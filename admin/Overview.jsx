import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './Overview.scss';
import Notification from './Notification';
import moment from 'moment';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Loading from './Loading'; // Import reusable Loading component

const Dashboard = () => {
    const [chartDatas, setChartData] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [totalWeeklyRevenue, setTotalWeeklyRevenue] = useState(0);
    const [totalWeeklyOrders, setTotalWeeklyOrders] = useState(0);
    const [selectedWeek, setSelectedWeek] = useState('');
    const [availableWeeks, setAvailableWeeks] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [availableMonths, setAvailableMonths] = useState([]);
    const [detailedWeeklyData, setDetailedWeeklyData] = useState({});
    const [detailedMonthlyData, setDetailedMonthlyData] = useState({});
    const [allOrders, setAllOrders] = useState([]);
    const [loading, setLoading] = useState(true); // Add loading state

    const ordersChartRef = useRef(null);
    const salesChartRef = useRef(null);

    useEffect(() => {
        const fetchWeeklyOrderData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`https://wellworn-4.onrender.com/api/orders`);
                const orders = response.data.orders;

                if (orders && Array.isArray(orders)) {
                    setAllOrders(orders);

                    // Group orders by week
                    const weeklyData = {};
                    orders.forEach(order => {
                        const weekKey = `Week of ${moment(order.orderDate).startOf('isoWeek').format('MMM D, YYYY')}`;
                        if (!weeklyData[weekKey]) weeklyData[weekKey] = [];
                        weeklyData[weekKey].push(order);
                    });

                    const chartData = Object.keys(weeklyData).map(weekKey => ({
                        week: weekKey,
                        orders: weeklyData[weekKey].length,
                    }));

                    setChartData(chartData);
                    setAvailableWeeks(Object.keys(weeklyData));
                    setDetailedWeeklyData(weeklyData);

                    // Calculate total weekly orders for the current week
                    const currentWeek = `Week of ${moment().startOf('isoWeek').format('MMM D, YYYY')}`;
                    const totalOrders = weeklyData[currentWeek]?.length || 0;
                    setTotalWeeklyOrders(totalOrders);

                    setLoading(false);
                } else {
                    console.error('Invalid orders data:', orders);
                }
            } catch (error) {
                console.error('Error fetching weekly order data:', error);
                setLoading(false);
            }
        };

        fetchWeeklyOrderData();
    }, []);

    useEffect(() => {
        const fetchSalesData = async () => {
            try {
                const response = await axios.get(`https://wellworn-4.onrender.com/api/orders`);
                const ordersData = response.data.orders;

                if (ordersData && Array.isArray(ordersData)) {
                    setAllOrders(ordersData);

                    const weeklyData = {};
                    const monthlyData = {};

                    ordersData.forEach(order => {
                        const week = `Week of ${moment(order.orderDate).startOf('isoWeek').format('MMM D, YYYY')}`;
                        const month = moment(order.orderDate).format('YYYY-MMM');

                        if (!weeklyData[week]) weeklyData[week] = [];
                        if (!monthlyData[month]) monthlyData[month] = [];

                        weeklyData[week].push(order);
                        monthlyData[month].push(order);
                    });

                    const weeklyChartData = Object.keys(weeklyData).map(week => ({
                        week,
                        totalSales: weeklyData[week].reduce((sum, order) => sum + (order.total || 0), 0),
                        orders: weeklyData[week].length,
                    }));

                    const monthlyChartData = Object.keys(monthlyData).map(month => ({
                        month,
                        totalSales: monthlyData[month].reduce((sum, order) => sum + (order.total || 0), 0),
                        orders: monthlyData[month].length,
                    }));

                    setSalesData(weeklyChartData);
                    setAvailableWeeks(Object.keys(weeklyData));
                    setAvailableMonths(Object.keys(monthlyData));
                    setDetailedWeeklyData(weeklyData);
                    setDetailedMonthlyData(monthlyData);

                    const currentWeek = `Week of ${moment().startOf('isoWeek').format('MMM D, YYYY')}`;
                    const totalRevenue = weeklyData[currentWeek]?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
                    setTotalWeeklyRevenue(totalRevenue);
                } else {
                    console.error('Invalid order data:', ordersData);
                }
            } catch (error) {
                console.error('Error fetching sales data:', error);
            }
        };
        fetchSalesData();
    }, []);

    const generatePDF = async (data, title, filename, isDetailed = false) => {
        const doc = new jsPDF();
        doc.text(title, 20, 10);

        let totalRevenue = 0;

        if (isDetailed) {
            data.forEach((entry, index) => {
                const revenueForPeriod = entry.orders.reduce((sum, order) => sum + (order.total || 0), 0);
                totalRevenue += revenueForPeriod;

                doc.text(`${entry.week || entry.month}`, 20, 20 + index * 10);
                doc.autoTable({
                    head: [['Order ID', 'Customer', 'Total']],
                    body: entry.orders.map(order => [
                        order.orderId,
                        `${order.firstName} ${order.lastName}`,
                        `Rs. ${order.total?.toFixed(2) || '0.00'}`,
                    ]),
                });
            });
        } else {
            totalRevenue = data.reduce((sum, row) => sum + row.totalSales, 0);
            doc.autoTable({
                head: [['Period', 'Orders', 'Total Revenue']],
                body: data.map(row => [row.week || row.month, row.orders, `Rs. ${row.totalSales?.toFixed(2)}`]),
            });
        }

        doc.text(`Total Revenue: Rs. ${totalRevenue.toFixed(2)}`, 20, doc.autoTable.previous.finalY + 10);
        doc.save(filename);
    };

    const handleGenerateWeeklyReport = () => {
        const weeklyData = detailedWeeklyData[selectedWeek];
        if (weeklyData) {
            generatePDF([{ week: selectedWeek, orders: weeklyData }], `Weekly Revenue Report (${selectedWeek})`, `weekly_revenue_report_${selectedWeek}.pdf`, true);
        }
    };

    const handleGenerateMonthlyReport = () => {
        const monthlyData = detailedMonthlyData[selectedMonth];
        if (monthlyData) {
            generatePDF([{ month: selectedMonth, orders: monthlyData }], `Monthly Revenue Report (${selectedMonth})`, `monthly_revenue_report_${selectedMonth}.pdf`, true);
        }
    };

    const handleGenerateAllRevenueReport = () => {
        const allTimeData = [
            {
                week: 'All-Time Revenue',
                orders: allOrders,
            },
        ];
        generatePDF(allTimeData, 'All-Time Revenue Report', 'all_time_revenue_report.pdf', true);
    };
    if (loading) {
        return <Loading />; // Use reusable Loading component
    }
    return (
        <div>            
            <Notification />
            <div className="overview-container">
                <div className="overview-charts">
                    {/* Orders Chart */}
                    <div className="chart-orders" ref={ordersChartRef}>
    <p>Orders Visualization</p>
    {loading ? (
        <p>Loading Orders data...</p>
    ) : (
        <div className="scrollable-content">
            <BarChart width={600} height={400} data={chartDatas}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#8884d8" />
            </BarChart>
        </div>
    )}
                <p>Total Weekly Orders: {totalWeeklyOrders}</p>

</div>

<div className="chart-sales" ref={salesChartRef}>
    <p>Weekly Revenue Visualization</p>
    {loading ? (
        <p>Loading Sales data...</p>
    ) : (
        <div className="scrollable-content">
            <BarChart width={600} height={400} data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalSales" fill="#82ca9d" />
            </BarChart>
        </div>
        
    )}
    <div className="report-buttons">
    <p>Weekly Revenue = Rs: {totalWeeklyRevenue.toFixed(2)}</p>

        <label>Select Week:</label>
        <select value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)}>
            <option value="" disabled>Select a Week</option>
            {availableWeeks.map(week => (
                <option key={week} value={week}>{week}</option>
            ))}
        </select>
        <button onClick={handleGenerateWeeklyReport} disabled={!selectedWeek}>
            Download Weekly Report
        </button>
        <label>Select Month:</label>
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            <option value="" disabled>Select a Month</option>
            {availableMonths.map(month => (
                <option key={month} value={month}>{month}</option>
            ))}
        </select>
        <button onClick={handleGenerateMonthlyReport} disabled={!selectedMonth}>
            Download Monthly Report
        </button>
        <button onClick={handleGenerateAllRevenueReport} className="all-revenue-button">
    Download All-Time Revenue Report
</button>

    </div>
</div>

                </div>
            </div>
        </div>
    );
    };
    
    export default Dashboard;
    