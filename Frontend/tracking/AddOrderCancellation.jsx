import React, { useState } from "react";
import "./OrderCancellation.scss";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const apiUrl = import.meta.env.VITE_BACKEND_API;

function AddOrderCancellation({ onClose, orderId }) {
  const [titleForCancellation, setTitleForCancellation] = useState("");
  const [reasonForCancellation, setReasonForCancellation] = useState("");

  const handleCancelOrder = async (event) => {
    event.preventDefault();

    const currentDate = new Date().toISOString();
    const cancellationData = {
      OrderID: orderId,
      titleForCancellation,
      reasonForCancellation,
      cancellationDate: currentDate,
    };

    try {
      const response = await axios.post(
        `https://wellworn-4.onrender.com/api/addOrderCancellation`,
        cancellationData
      );
      console.log("Cancellation submitted:", response.data);
      toast.info("Processing your cancellation...");

      const deleteResponse = await axios.delete(
        `https://wellworn-4.onrender.com/api/deleteOrder/${orderId}`
      );
      if (deleteResponse.status === 200) {
        toast.success("Order successfully cancelled and removed!");
        onClose();
        window.location.reload();

      } else {
        throw new Error(deleteResponse.data.message || "Failed to delete order");
      }
    } catch (error) {
      console.error("Error handling order cancellation:", error);
      toast.error("Failed to cancel order. Please try again.");
    }
  };

  return (
    <div className="popup-container">
      <div className="popup-content">
        <form onSubmit={handleCancelOrder}>
          <h1 className="popup-title">Order Cancellation</h1>
          <p className="order-id-text">Order ID: {orderId}</p>

          <label htmlFor="titleForCancellation" className="form-label">
            Title for cancellation:
          </label>
          <input
            type="text"
            id="titleForCancellation"
            value={titleForCancellation}
            onChange={(e) => setTitleForCancellation(e.target.value)}
            className="input-field"
            required
          />

          <label htmlFor="reasonForCancellation" className="form-label">
            Reason for cancellation:
          </label>
          <textarea
            id="reasonForCancellation"
            value={reasonForCancellation}
            onChange={(e) => setReasonForCancellation(e.target.value)}
            className="textarea-field"
            minLength={10}
            maxLength={200}
            rows={6}
            required
          ></textarea>

          <div className="button-group">
            <div className="cancel-button" onClick={onClose}>
              Close
            </div>
            <div className="submit-button" onClick={handleCancelOrder}>
              Submit
            </div>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}

export default AddOrderCancellation;
