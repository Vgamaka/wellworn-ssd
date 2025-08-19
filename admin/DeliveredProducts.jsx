import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { toast, ToastContainer } from "react-toastify";
import { PropagateLoader } from "react-spinners"; // Import the loader
import "./refundOrders.scss"; // Make sure you have the styles for buttons and the layout
import Notification from "./Notification";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};

const DeliveredProducts = () => {
  const [deliveredProducts, setDeliveredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [loading, setLoading] = useState(true); // Loading state
  const sortedFilteredProducts = [...filteredProducts].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

  useEffect(() => {
    fetchDeliveredProducts();
  }, []);

  const fetchDeliveredProducts = async () => {
    try {
      setLoading(true); // Start loader
      const response = await axios.get(
        `https://wellworn-4.onrender.com/api/deliveredproducts`
      );
      setDeliveredProducts(response.data.deliveredProducts);
      setFilteredProducts(response.data.deliveredProducts);
    } catch (error) {
      console.error("Error fetching delivered products:", error);
    } finally {
      setLoading(false); // Stop loader
    }
  };

  useEffect(() => {
    const filtered = deliveredProducts.filter((product) => {
      const orderId = product.orderId || "";
      const firstName = product.firstName || "";
      const country = product.country || "";

      return (
        (orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          firstName.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedCountry === "All" || country === selectedCountry)
      );
    });
    setFilteredProducts(filtered);
  }, [searchTerm, selectedCountry, deliveredProducts]);

  const generateReport = () => {
    const doc = new jsPDF();
    doc.text("Delivered Products Report", 10, 10);
    doc.autoTable({
      head: [
        [
          "Order ID",
          "Order Date",
          "Estimated Date",
          "Country",
          "Dispatch from Overseas",
          "CN Custom",
          "Air Fred Company",
          "Arrival in Custom",
          "Courier Selected",
          "Delivered",
        ],
      ],

      body: sortedFilteredProducts.map((product) => [
        product.orderId,
        formatDate(product.orderDate),
        formatDate(product.estimatedDate),
        product.country,
        formatDate(product.firstStateDate),
        formatDate(product.secondStateDate),
        formatDate(product.thirdStateDate),
        formatDate(product.fourthStateDate),
        formatDate(product.fifthStateDate),
        formatDate(product.sixthStateDate),
      ]),
    });
    doc.save("delivered_products_report.pdf");
  };

  const handleDelete = (orderId) => {
    setProductToDelete(orderId);
    setShowConfirm(true);
  };

  const deleteProduct = async () => {
    try {
      await axios.delete(
        `https://wellworn-4.onrender.com/api/delproduct/${productToDelete}`
      );
      setDeliveredProducts((prevProducts) =>
        prevProducts.filter((product) => product.orderId !== productToDelete)
      );
      setFilteredProducts((prevProducts) =>
        prevProducts.filter((product) => product.orderId !== productToDelete)
      );
      toast.success("Deleted Successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
    } finally {
      setShowConfirm(false);
    }
  };

  const handleCountryChange = (event) => {
    setSelectedCountry(event.target.value);
  };

  return (
    <div>
      <Notification />
      <div className="mainContainer">
        <h1>Delivered Products</h1>
        <div>
          <button className="generate-reports-buttonr" onClick={generateReport}>
            Generate Report
          </button>
        </div>
        <br />
        <div>
          <input
            type="text"
            placeholder="Search by Order ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <label className="filter-labelDD">Country:</label>
        <select
          className="filter-dropdownDD"
          value={selectedCountry}
          onChange={handleCountryChange}
        >
          <option value="All">All Countries</option>
          <option value="Sri Lanka">Sri Lanka</option>
          <option value="USA">USA</option>
          <option value="India">India</option>
        </select>
        <div>
          <h3 className="subtitle">
            Delivered Products ({sortedFilteredProducts.length})
          </h3>
        </div>

        {loading ? ( // Show loader while fetching data
          <div className="loading-container">
            <PropagateLoader color="#ff4500" />
          </div>
        ) : (
          <div className="categorytable">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Order Date</th>
                  <th>Estimated Date</th>
                  <th>Country</th>
                  <th>Dispatch from Overseas</th>
                  <th>CN Custom</th>
                  <th>Air Fred Company</th>
                  <th>Arrival in Custom</th>
                  <th>Courier Selected</th>
                  <th>Delivered</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedFilteredProducts.map((product) => (
                  <tr key={product._id}>
                    <td>{product.orderId}</td>
                    <td>{formatDate(product.orderDate)}</td>
                    <td>{formatDate(product.estimatedDate)}</td>
                    <td>{product.country}</td>
                    <td>{formatDate(product.firstStateDate)}</td>
                    <td>{formatDate(product.secondStateDate)}</td>
                    <td>{formatDate(product.thirdStateDate)}</td>
                    <td>{formatDate(product.fourthStateDate)}</td>
                    <td>{formatDate(product.fifthStateDate)}</td>
                    <td>{formatDate(product.sixthStateDate)}</td>
                    <td>
                      <button
                        id="ordelete"
                        onClick={() => handleDelete(product.orderId)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {showConfirm && (
          <div className="confirm-dialogrefun">
            <p>Are you sure you want to delete this product?</p>
            <div>
              <button onClick={deleteProduct}>Yes</button>
              <button onClick={() => setShowConfirm(false)}>No</button>
            </div>
          </div>
        )}
        <ToastContainer />
      </div>
    </div>
  );
};

export default DeliveredProducts;
