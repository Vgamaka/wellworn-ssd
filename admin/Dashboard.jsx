import { useEffect, useState } from 'react';
import axios from 'axios';
import './Dashboard.scss';
import moment from 'moment';
import Widget from './Widget';
import Notification from './Notification';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import AuthAPI from '../src/api/AuthAPI';
import Loading from './Loading'; // Import the reusable Loading component

const Dashboard = () => {
    const adminName = 'WELLWORN ADMIN DASHBOARD';
    const todayDate = moment().format('dddd, MMMM Do YYYY');
    const [userCount, setUserCount] = useState(0);
    // const [monthlyOrderCount, setMonthlyOrderCount] = useState(0); // Renamed to reflect monthly data
    // const [monthlyRevenue, setMonthlyRevenue] = useState(0);       // Renamed to reflect monthly data
    const [weeklyOrderCount, setWeeklyOrderCount] = useState(0); // Weekly orders count
    const [weeklyRevenue, setWeeklyRevenue] = useState(0);       // Weekly revenue
    const [totalOrders, setTotalOrders] = useState(0);
    const [chartData, setChartData] = useState([]);
    const [weeklyOrders, setWeeklyOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch user count
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await AuthAPI.fetchCustomers();
                setUserCount(response.data.customers.length);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, []);

    // Fetch orders and calculate monthly and weekly data
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get(`https://wellworn-4.onrender.com/api/orders`);
                const ordersData = response.data.orders;
        
                if (ordersData && Array.isArray(ordersData)) {
                    setTotalOrders(ordersData.length);
                    setLoading(false);
        
                    const startDate = moment().startOf('isoWeek').toDate(); // Start of the current week
                    const filteredWeeklyOrders = ordersData.filter(order => new Date(order.orderDate) >= startDate);
        
                    // Count weekly orders and calculate weekly revenue
                    setWeeklyOrderCount(filteredWeeklyOrders.length);
                    const weeklyRevenueTotal = filteredWeeklyOrders.reduce((total, order) => total + order.total, 0);
                    setWeeklyRevenue(weeklyRevenueTotal.toFixed(2)); // Keep two decimal points
        
                    // Count orders by day for the last week
                    const orderCounts = {};
                    filteredWeeklyOrders.forEach(order => {
                        const orderDate = moment(order.orderDate).format('YYYY-MM-DD');
                        orderCounts[orderDate] = (orderCounts[orderDate] || 0) + 1;
                    });
        
                    const chartData = Object.keys(orderCounts).map(date => ({
                        date,
                        orders: orderCounts[date]
                    }));
        
                    setChartData(chartData);
                    setWeeklyOrders(filteredWeeklyOrders);
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };
        
        fetchOrders();
    }, []);

    const handleViewMore = (orderId) => {
        navigate(`/admin/OrderDetails/${orderId}`);
    };

    return (
        <div>
                        <Notification/>
                        {loading ? (
                <Loading /> // Use the reusable Loading component
            ) : (
        <div className="dashboard">
            <h1 className='wellcomeh1'>{adminName}</h1>
            <p>{todayDate}</p>

            <div className="widgets">
                <Widget title="Total Customers" value={userCount} icon="customers" />
                <Widget title="Orders This Week" value={weeklyOrderCount} icon="orders" />
                <Widget title="Revenue This Week" value={`LKR.${weeklyRevenue}`} icon="revenue" />
                {/* <Widget title="Orders This Month" value={monthlyOrderCount} icon="orders" />
                <Widget title="Revenue This Month" value={`LKR.${monthlyRevenue}`} icon="revenue" /> */}
                <Widget title="Total Orders" value={totalOrders} icon="totalOrders" />
            </div>

            <div className="charts">
                <h3 className='titleh3'>Orders Over the Last Week</h3>
  
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="orders" stroke="#8884d8" />
                        </LineChart>
                    </ResponsiveContainer>
                
            </div>

            <div className="weekly-orders">
                <h3 className='titleh3'>Weekly Orders</h3>
                {weeklyOrders.length > 0 ? (
                    <div className="weekly-orders-list">
                        {[...weeklyOrders].reverse().map(order => (
                            <div className="weekly-order-row" key={order.orderId}>
                                {/* Product Images and Details */}
                                <div className="product-images">
                                    {order.products.map(product => (
                                        <div key={product.productId} className="product-image-container">
                                            {product.image ? (
                                                <div className="image-overlay">
                                                    <img
                                                        src={product.image}
                                                        alt={product.ProductName}
                                                        className="product-image"
                                                    />
                                                    <div className="labels">
                                                        <span className="label">{product.quantity}</span>
                                                        <span className="label">{product.color}</span>
                                                        <span className="label">{product.size}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p>No image available</p>
                                            )}
                                            <p className="product-name">
                                                {product.ProductName} (ID: {product.productId})
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Order Details */}
                                <div className="order-details">
                                    <p><strong>Order ID:</strong> {order.orderId}</p>
                                    <p><strong>Customer Name:</strong> {order.firstName} {order.lastName}</p>
                                    <p><strong>Address:</strong> {order.address}, {order.city}</p>
                                </div>

                                {/* Order Price and Button */}
                                <div className="order-price">
                                    <p>LKR {order.total.toFixed(2)}</p>
                                    <button onClick={() => handleViewMore(order.orderId)}>View More</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No orders found for the last week.</p>
                )}
            </div>
        </div>
                 )}
        </div>

    );
};

export default Dashboard;
