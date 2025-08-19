import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PropagateLoader } from 'react-spinners'; // Import the loader
import Notification from "./Notification";

const apiUrl = import.meta.env.VITE_BACKEND_API;

const OrderCancellation = () => {
  const [cancellations, setCancellations] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [showConfirm, setShowConfirm] = useState(false); // Confirmation dialog state
  const [cancellationToDelete, setCancellationToDelete] = useState(null); // State variable to store cancellation to delete

  useEffect(() => {
    fetchCancellations();
  }, []);

  const fetchCancellations = () => {
    setLoading(true); // Show loading before fetching data
    axios.get(`https://wellworn-4.onrender.com/api/getOrderCancellation`)
      .then(response => {
        setCancellations(response.data.response);
      })
      .catch(error => {
        console.error('Error fetching order cancellations:', error);
      })
      .finally(() => {
        setLoading(false); // Hide loading after fetching data
      });
  };

  const handleDelete = (OrderID) => {
    setCancellationToDelete(OrderID);
    setShowConfirm(true); // Show confirmation dialog
  };

  const confirmDelete = () => {
    axios.delete(`https://wellworn-4.onrender.com/api/deleteOrderCancellation/${cancellationToDelete}`)
      .then(res => {
        setCancellations(prevCancellations => prevCancellations.filter(cancellation => cancellation.OrderID !== cancellationToDelete));
        toast.success('Order cancellation deleted successfully!');
      })
      .catch(err => {
        console.error('Error deleting order cancellation:', err);
        toast.error('Error deleting order cancellation.');
      })
      .finally(() => {
        // Close the confirmation dialog
        setShowConfirm(false);
      });
  };

  return (
    <div>
      <Notification />
      <div className="mainContainer">
        <h1>Order Cancellations</h1>
        {loading ? (
          <div className="loading-container">
            <PropagateLoader color="#ff4500" loading={loading} />
          </div>
        ) : (
          <>
            <div>
              <h3 className="subtitl">Cancelled Orders ({cancellations.length})</h3>
            </div>
            <div className="categorytable">
              <table style={{ width: "140%", marginLeft: '-20%' }}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Title for Cancellation</th>
                    <th>Reason for Cancellation</th>
                    <th>Cancellation Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cancellations.map(cancellation => (
                    <tr key={cancellation.OrderID}>
                      <td>{cancellation.OrderID}</td>
                      <td>{cancellation.titleForCancellation}</td>
                      <td>{cancellation.reasonForCancellation}</td>
                      <td>{new Date(cancellation.cancellationDate).toLocaleDateString('en-US')}</td>
                      <td>
                        <button
                          className="deletebtn"
                          style={{ width: "100%" }}
                          onClick={() => handleDelete(cancellation.OrderID)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {showConfirm && (
              <div className="confirm-dialogrefun">
                <p>Are you sure you want to delete this order cancellation?</p>
                <div>
                  <button onClick={confirmDelete}>Yes</button>
                  <button onClick={() => setShowConfirm(false)}>No</button>
                </div>
              </div>
            )}
          </>
        )}
        <ToastContainer />
      </div>
    </div>
  );
};

export default OrderCancellation;
