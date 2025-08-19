import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./refundOrders.scss";
import jsPDF from "jspdf";
import Notification from "./Notification";
import "jspdf-autotable";
import { ToastContainer, toast } from "react-toastify";
import { PropagateLoader } from "react-spinners"; // Import the loader

const apiUrl = import.meta.env.VITE_BACKEND_API;

const AcceptedRefunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [filteredRefunds, setFilteredRefunds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [refundToDelete, setRefundToDelete] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    axios
      .get(`https://wellworn-4.onrender.com/api/acceptrefunds`)
      .then((response) => {
        setRefunds(response.data.response);
      })
      .catch((error) => {
        console.error("Error fetching accepted refunds:", error);
      })
      .finally(() => {
        setLoading(false); // Stop loading animation after data is fetched
      });
  }, []);

  useEffect(() => {
    const filtered = refunds.filter((refund) => {
      const orderId = refund?.orderId || "";
      const id = refund?.id || "";
      const customerName = refund?.customerName || "";
      const refundDate = formatDate(refund?.refundDate);

      return (
        orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        refundDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    setFilteredRefunds(filtered);
  }, [searchTerm, refunds]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US");
  };

  const generateReport = () => {
    const doc = new jsPDF();
    doc.text("Approved Refunds Report", 10, 10);
    doc.autoTable({
      head: [
        [
          "Order Id",
          "Product Id",
          "Customer Name",
          "Customer Email",
          "Reason",
          "Refund Initiate Date",
        ],
      ],
      body: filteredRefunds.map((refund) => [
        refund?.orderId,
        refund?.productIds?.join(", "),
        refund?.customerName,
        refund?.customerEmail,
        refund?.reason,
        formatDate(refund?.refundDate),
      ]),
    });
    doc.save("ApprovedRefund_report.pdf");
  };

  const handleDelete = (orderId) => {
    setRefundToDelete(orderId);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    axios
      .delete(
        `https://wellworn-4.onrender.com/api/deleteAccrefund/${refundToDelete}`
      )
      .then(() => {
        setRefunds((prevRefunds) =>
          prevRefunds.filter((refund) => refund.orderId !== refundToDelete)
        );
        toast.success("Refund deleted successfully!");
      })
      .catch((err) => {
        console.error("Error deleting refund:", err);
        toast.error("Error deleting refund.");
      })
      .finally(() => {
        setShowConfirm(false);
      });
  };

  return (
    <div>
      <Notification />

    <div className="mainContainer">
      <h1>Accepted Refunds</h1>
      {loading ? (
        <div className="loading-container">
          <PropagateLoader color="#ff4500" loading={loading} />
        </div>
      ) : (
        <>
          <div className="action-container">
            <div id="search-barr">
              <input
                type="text"
                placeholder="Search Refund..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button id="search-buttonrrr">
                <i className="fas fa-search" />
              </button>
            </div>

            <div className="twobtnr">
              <button
                className="generate-reports-buttonr"
                onClick={generateReport}
              >
                Generate Report
              </button>
              <Link to="/admin/refundorder">
                <button className="generate-reports-buttonr">
                  Requested Refunds
                </button>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="subtitle">
              Approved Refunds ({filteredRefunds.length})
            </h3>
          </div>
          <div className="categorytable">
            <table>
              <tbody>
                <tr>
                  <th>Order Id</th>
                  <th>Product Id</th>
                  <th>Customer Name</th>
                  <th>Customer Email</th>
                  <th>Reason</th>
                  <th>Refund Initiate Date</th>
                  <th>Image</th>
                  <th>Actions</th>
                </tr>
                {filteredRefunds.map((refund) => (
                  <tr key={refund?.orderId}>
                    <td>{refund?.orderId}</td>
                    <td>{refund?.productIds?.join(", ")}</td>
                    <td>{refund?.customerName}</td>
                    <td>{refund?.customerEmail}</td>
                    <td>{refund?.reason}</td>
                    <td>{formatDate(refund?.refundDate)}</td>
                    <td>
                      {refund.imgUrls && refund.imgUrls.length > 0 ? (
                        <img
                          src={refund.imgUrls[0]}
                          alt={refund.orderId}
                          style={{ maxWidth: "80px", maxHeight: "80px" }}
                          onLoad={() => console.log("Image loaded successfully")}
                          onError={(e) => {
                            e.target.src = "placeholder-image-url";
                          }}
                        />
                      ) : (
                        <div>No Image</div>
                      )}
                    </td>
                    <td>
                      <button
                        className="deletebtna"
                        onClick={() => handleDelete(refund?.orderId)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showConfirm && (
            <div className="confirm-dialogrefun">
              <p>Are you sure you want to delete this refund?</p>
              <div>
                <button onClick={confirmDelete}>Yes</button>
                <button onClick={() => setShowConfirm(false)}>No</button>
              </div>
            </div>
          )}
          <ToastContainer />
        </>
      )}
    </div>
    </div>

  );
};

export default AcceptedRefunds;
