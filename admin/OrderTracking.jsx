import React, { useState, useEffect } from "react";
import axios from "axios";
import "./OrdersTracking.scss";
import { toast, ToastContainer } from "react-toastify";
import Notification from "./Notification";
import { Link } from "react-router-dom";
import Loading from './Loading'; // Import reusable Loading component

const apiUrl = import.meta.env.VITE_BACKEND_API;

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};

const OrderTracking = () => {
  const [orders, setOrders] = useState([]);
  const [trackingEntries, setTrackingEntries] = useState([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState(new Set());
  const [showConfirm, setShowConfirm] = useState(false);
  const [refundToDelete, setRefundToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Show loader before API calls
        const ordersResponse = await axios.get(`${apiUrl}/api/orders`);
        const trackingResponse = await axios.get(`${apiUrl}/api/tracking`);
        setOrders(ordersResponse.data.orders);
        setTrackingEntries(trackingResponse.data.trackingEntries);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // Hide loader after API calls
      }
    };

    fetchData();
  }, []);

  const getOrderStatus = (orderId) => {
    const trackingEntry = trackingEntries.find(
      (entry) => entry.orderId === orderId
    );
    if (!trackingEntry) return "";

    if (trackingEntry.sixthStateDate) return "Order Complete";
    if (trackingEntry.fifthStateDate) return "Hand Over to Courier";
    if (trackingEntry.fourthStateDate) return "Arrival in Custom";
    if (trackingEntry.thirdStateDate) return "Shipping Customs";
    if (trackingEntry.secondStateDate) return "Overseas Custom";
    if (trackingEntry.firstStateDate) return "Dispatch from Overseas";

    return "";
  };



  const handleCheckboxChange = (orderId) => {
    setSelectedOrderIds((prevSelectedOrderIds) => {
      const newSelectedOrderIds = new Set(prevSelectedOrderIds);
      if (newSelectedOrderIds.has(orderId)) {
        newSelectedOrderIds.delete(orderId);
      } else {
        newSelectedOrderIds.add(orderId);
      }
      return newSelectedOrderIds;
    });
  };

  const notifyCustomer = async (orderId, status) => {
    try {
      await axios.post(`${apiUrl}/api/notify`, {
        orderId,
        status,
      });
    } catch (error) {
      console.error("Error notifying customer:", error);
    }
  };

  const handleStatusUpdate = async (status) => {
    if (selectedOrderIds.size === 0) {
      toast.warn("Please select at least one order.");
      return;
    }
  
    if (status === "Dispatch from Overseas") {
      const enteredPassword = prompt("Please enter the password to proceed:");
      const correctPassword = "123"; // Replace this with your actual password
      if (enteredPassword !== correctPassword) {
        toast.error("Incorrect password. Action denied.");
        return;
      }
    }
  
    try {
      setLoading(true); // Show loader
      const orderIds = Array.from(selectedOrderIds);
  
      await Promise.all(
        orderIds.map(async (orderId) => {
          if (status === "Dispatch from Overseas") {
            await axios.post(`${apiUrl}/api/tracking`, { orderId, status });
          } else {
            await axios.put(`${apiUrl}/api/tracking/${orderId}`, { status });
          }
          await notifyCustomer(orderId, status);
        })
      );
  
      // Re-fetch updated tracking data
      const trackingResponse = await axios.get(`${apiUrl}/api/tracking`);
      setTrackingEntries(trackingResponse.data.trackingEntries);
  
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status.");
    } finally {
      setLoading(false);
    }
  };
  
  
  const handleRevertStatus = async (currentStatus) => {
    if (selectedOrderIds.size === 0) {
      toast.warn("Please select at least one order.");
      return;
    }
  
    const stateMapping = {
      "Overseas Custom": "firstStateDate",
      "Shipping Customs": "secondStateDate",
      "Arrival in Custom": "thirdStateDate",
      "Hand Over to Courier": "fourthStateDate",
      "Delivered": "fifthStateDate",
    };
  
    const previousStateField = stateMapping[currentStatus];
    if (!previousStateField) {
      toast.error("Cannot revert from this state.");
      return;
    }
  
    try {
      setLoading(true); // Show loader
      const orderIds = Array.from(selectedOrderIds);
  
      await Promise.all(
        orderIds.map((orderId) =>
          axios.put(`${apiUrl}/api/tracking/revert/${orderId}`, {
            status: currentStatus,
          })
        )
      );
  
      // Re-fetch updated tracking data
      const trackingResponse = await axios.get(`${apiUrl}/api/tracking`);
      setTrackingEntries(trackingResponse.data.trackingEntries);
  
      toast.success("Status reverted successfully.");
    } catch (error) {
      console.error("Error reverting status:", error);
      toast.error("Failed to revert status.");
    } finally {
      setLoading(false);
    }
  };
  
  
  // Helper function to get the corresponding field name in the trackingEntries
  const getStateFieldName = (status) => {
    const stateMapping = {
      "Dispatch from Overseas": "firstStateDate",
      "Overseas Custom": "secondStateDate",
      "Shipping Customs": "thirdStateDate",
      "Arrival in Custom": "fourthStateDate",
      "Hand Over to Courier": "fifthStateDate",
      "Delivered": "sixthStateDate",
    };
    return stateMapping[status];
  };
  
  // Helper function to get the previous field name for revert
  const getPreviousStateFieldName = (status) => {
    const stateMapping = {
      "Overseas Custom": "firstStateDate",
      "Shipping Customs": "secondStateDate",
      "Arrival in Custom": "thirdStateDate",
      "Hand Over to Courier": "fourthStateDate",
      "Delivered": "fifthStateDate",
    };
    return stateMapping[status];
  };
  
  

  const handleNextStatus = async () => {
    if (!window.confirm("Do you want to proceed?")) return;
  
    const statusOrder = [
      "Dispatch from Overseas",
      "Overseas Custom",
      "Shipping Customs",
      "Arrival in Custom",
      "Hand Over to Courier",
      "Delivered",
    ];
  
    const orderIds = Array.from(selectedOrderIds);
  
    try {
      setLoading(true); // Show loader before API call
      const updatePromises = orderIds.map((orderId) => {
        const currentStatus = getOrderStatus(orderId);
        const nextStatusIndex = statusOrder.indexOf(currentStatus) + 1;
  
        if (nextStatusIndex < statusOrder.length) {
          const nextStatus = statusOrder[nextStatusIndex];
          return handleStatusUpdate(nextStatus, orderId); // Update specific order
        }
  
        return Promise.resolve(); // If no next status, do nothing
      });
  
      await Promise.all(updatePromises);
  
      toast.success("All statuses updated successfully.");
    } catch (error) {
      console.error("Error updating statuses:", error);
      toast.error("Failed to update some statuses. Please try again.");
    } finally {
      setLoading(false); // Hide loader after API calls
    }
  };
  

  const handleDelete = (orderId) => {
    setRefundToDelete(orderId);
    setShowConfirm(true);
  };

  const deleteTrackingEntry = async () => {
    try {
      await axios.delete(
        `https://wellworn-4.onrender.com/api/tracking/${refundToDelete}`
      );
      setTrackingEntries((prevEntries) =>
        prevEntries.filter((entry) => entry.orderId !== refundToDelete)
      );
      toast.success("Deleted Successfully!");
    } catch (error) {
      console.error("Error deleting tracking entry:", error);
    } finally {
      setShowConfirm(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    return (
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.products.some(
        (product) =>
          product.productId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.ProductName.toLowerCase().includes(searchQuery.toLowerCase()) || order.firstName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  });

  const groupedOrders = filteredOrders.reduce((acc, order) => {
    if (!acc[order.orderId]) {
      acc[order.orderId] = {
        ...order,
        products: [],
      };
    }
    acc[order.orderId].products = acc[order.orderId].products.concat(
      order.products
    );
    return acc;
  }, {});
  const sortedOrders = [...filteredOrders].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
  const sortedTrackingEntries = [...trackingEntries].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
  
  // Add this function to map the order details to the tracking entries
  const getProductsForOrder = (orderId) => {
    const order = orders.find((order) => order.orderId === orderId);
    return order ? order.products : [];
  };
  if (loading) {
    return <Loading />; // Use reusable Loading component
  }
  return (
    <div>
      <Notification />
      <div className="orders-container">
        <div className="top-section">
          <div className="left-panel">
            <h2>Orders ({filteredOrders.length})</h2>
            <div className="search-barTrack">
              <input
                type="text"
                placeholder="Search by Order ID, First Name or Product Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <table>
              <thead>
                <tr style={{ fontSize: "14px" }}>
                  <th>Select</th>
                  <th>Order ID</th>
                  <th>Product Names</th>
                  <th>Product Images</th>
                  <th>Name</th>
                  <th>Country</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(sortedOrders).map((order) => (
                  <tr key={order.orderId}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.has(order.orderId)}
                        onChange={() => handleCheckboxChange(order.orderId)}
                      />
                    </td>
                    <td>{order.orderId}</td>
                    <td>
                      {order.products
                        .map((product) => product.ProductName)
                        .join(", ")}
                    </td>
                    <td>
                      {order.products.map((product) => (
                        <img
                          style={{ height: "65px", borderRadius:'5px' }}
                          key={product.productId}
                          src={product.image}
                          alt={product.ProductName}
                          width="65"
                        />
                      ))}
                    </td>
                    <td>{order.firstName}</td>
                    <td>{order.country}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div id="OderTracking_Status_Update" className="right-panel">
            <h2>Status Update</h2>
            {Array.from(selectedOrderIds).length > 0 ? (
      <div>
        {(() => {
          const currentOrderId = Array.from(selectedOrderIds)[0];
          const currentStatus = getOrderStatus(currentOrderId);

          // Define if the "Previous State" button should be disabled
          const isFirstStep = currentStatus === "Shipping Customs";

          return (
            <>
              <h3>Order ID: {currentOrderId}</h3>

              {/* Status Labels */}
              <label
                className={
                  currentStatus === "Dispatch from Overseas" ? "highlight" : ""
                }
              >
                <input
                  type="radio"
                  name="status"
                  value="Dispatch from Overseas"
                  checked={currentStatus === "Shipping Customs"}
                  onChange={() =>
                    handleStatusUpdate("Dispatch from Overseas")
                  }
                  disabled
                />
                Dispatch from Overseas
              </label>
              <label
                className={
                  currentStatus === "Arrival in Custom" ? "highlight" : ""
                }
              >
                <input
                  type="radio"
                  name="status"
                  value="Arrival in Custom"
                  checked={currentStatus === "Arrival in Custom"}
                  onChange={() => handleStatusUpdate("Arrival in Custom")}
                  disabled
                />
                Arrival in Custom
              </label>
              <label
                className={
                  currentStatus === "Hand Over to Courier" ? "highlight" : ""
                }
              >
                <input
                  type="radio"
                  name="status"
                  value="Hand Over to Courier"
                  checked={currentStatus === "Hand Over to Courier"}
                  onChange={() =>
                    handleStatusUpdate("Hand Over to Courier")
                  }
                  disabled
                />
                Hand Over to Courier
              </label>
              <label
                className={
                  currentStatus === "Order Complete" ? "highlight" : ""
                }
              >
                <input
                  type="radio"
                  name="status"
                  value="Order Complete"
                  checked={currentStatus === "Order Complete"}
                  onChange={() => handleStatusUpdate("Order Complete")}
                  disabled
                />
                Order Complete
              </label>

              {/* Buttons */}
              <button
                className={`revertbtn ${isFirstStep ? "disabled" : ""}`}
                onClick={() => handleRevertStatus(currentStatus)}
                disabled={isFirstStep} // Disable button if on the first step
              >
                ← Previous State
              </button>

              <button className="nextbtn" onClick={handleNextStatus}>
                Next State →
              </button>
            </>
          );
        })()}
      </div>
    ) : (
              <p>
                Please select an order to update its status. <br />
                (You can select more than ONE at a time)
              </p>
            )}
          </div>
        </div>
        <div className="bottom-section">
          <div className="right-panel">
            <Link to="/admin/deliveredProducts">
              <button id="delivbtn">Delivered Orders</button>
            </Link>

            <h2>Tracking Table ({trackingEntries.length})</h2>
            <div className="right-panel-table">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Products</th> {/* Add a header for Products */}
                  <th>Order Date</th>
                  <th>Estimated Arrival</th>
                  <th>Country</th>
                  <th>Dispatch from Overseas</th>
                  <th>CN Custom</th>
                  <th>Air Freight</th>
                  <th>Arrival in Custom</th>
                  <th>Courier Selected</th>
                  <th>Delivered</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedTrackingEntries.map((entry) => (
                  <tr key={entry._id}>
                    <td>{entry.orderId}</td>
                    <td>
                      {/* Display product images */}
                      {getProductsForOrder(entry.orderId).map((product) => (
                        <img
                          key={product.productId}
                          src={product.image}
                          alt={product.ProductName}
                          style={{
                            height: "50px",
                            width: "50px",
                            marginRight: "5px",
                            borderRadius:'5px',
                          }}
                        />
                      ))}
                    </td>
                    <td>{formatDate(entry.orderDate)}</td>
                    <td>{formatDate(entry.estimatedDate)}</td>
                    <td>{entry.country}</td>
                    <td>{formatDate(entry.firstStateDate)}</td>
                    <td>{formatDate(entry.secondStateDate)}</td>
                    <td>{formatDate(entry.thirdStateDate)}</td>
                    <td>
                      {entry.fourthStateDate
                        ? formatDate(entry.fourthStateDate)
                        : "-"}
                    </td>
                    <td>
                      {entry.fifthStateDate
                        ? formatDate(entry.fifthStateDate)
                        : "-"}
                    </td>
                    <td>
                      {entry.sixthStateDate
                        ? formatDate(entry.sixthStateDate)
                        : "-"}
                    </td>
                    <td>
                      <button
                        id="ordelete"
                        onClick={() => handleDelete(entry.orderId)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </div>
      {showConfirm && (
        <div className="confirm-dialogrefun">
          <p>Are you sure you want to delete this Order Tracking?</p>
          <div>
            <button onClick={deleteTrackingEntry}>Yes</button>
            <button onClick={() => setShowConfirm(false)}>No</button>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default OrderTracking;
