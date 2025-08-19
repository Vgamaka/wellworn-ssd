import React, { useState, useEffect } from 'react';
import './ProductReviews.scss';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { PropagateLoader } from 'react-spinners'; // Import spinner
import Notification from './Notification';
import Loading from './Loading'; // Import the reusable Loading component

const apiUrl = import.meta.env.VITE_BACKEND_API;

const ProductReviews = () => {
  const { productId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true); // Start loader
        if (productId) {
          const reviewsResponse = await axios.get(
            `https://wellworn-4.onrender.com/api/reviewsByProductId/${productId}`
          );
          const filteredReviews = reviewsResponse.data.reviews;
          setReviews(filteredReviews);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false); // Stop loader
      }
    };

    fetchReviews();
  }, [productId]);

  const openReviewModal = (reviewID) => {
    axios
      .get(`https://wellworn-4.onrender.com/api/review/${reviewID}`)
      .then((response) => {
        setSelectedReview(response.data);
        setShowForm(true);
      })
      .catch((error) => {
        console.error('Error fetching review data:', error);
        if (error.response && error.response.status === 404) {
          toast.error('Review not found.');
        }
      });
  };

  const renderStarRating = (ratingCount) => {
    const maxStars = 5;
    const filledStars = Math.round(ratingCount);
    const stars = [];

    for (let i = 0; i < maxStars; i++) {
      stars.push(i < filledStars ? <span key={i}>&#9733;</span> : <span key={i}>&#9734;</span>);
    }

    return stars;
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedReview(null);
  };

  const handleRemove = (e) => {
    e.preventDefault();

    if (!selectedReview || !selectedReview.review) {
      toast.error('No review selected for deletion.');
      return;
    }

    const reviewID = selectedReview.review.ReviewID;

    axios
      .delete(`https://wellworn-4.onrender.com/api/deletereview/${reviewID}`)
      .then(() => {
        toast.success('Review deleted successfully.');
        const updatedReviews = reviews.filter((review) => review.ReviewID !== reviewID);
        setReviews(updatedReviews);
        closeForm();
      })
      .catch((error) => {
        console.error('Error deleting review:', error);
        toast.error('Failed to delete review.');
      });
  };

  return (
    <div className="ProductReviews_main">
      <ToastContainer />
      <Notification />
      {loading ? (
        <Loading /> // Use the reusable Loading component
      ) : (
        <div className="ProductReviews_table-container">
                <h1 className="topic_review">Product Reviews</h1>

          <table className="ProductReviews_table">
            <thead>
              <tr>
                <th className="review_theader2">ReviewID</th>
                <th className="review_theader3">ProductID</th>
                <th className="review_theader4">Date</th>
                <th className="review_theader5">CustomerID</th>
                <th className="review_theader6">Customer Name</th>
                <th className="review_theader7">Action</th>
              </tr>
            </thead>
            <tbody>
              {reviews && reviews.length > 0 ? (
                reviews.map((review) => (
                  <tr key={review.ReviewID}>
                    <td>{review.ReviewID}</td>
                    <td>{review.ProductId}</td>
                    <td>{review.Date}</td>
                    <td>{review.customerId}</td>
                    <td>{review.CustomerName}</td>
                    <td>
                      <button
                        className="Review_viewmore"
                        onClick={() => openReviewModal(review.ReviewID)}
                      >
                        View More
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No reviews found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && selectedReview && (
        <div className="popupform">
          <h2>
            <u>Added Review</u>
          </h2>
          <h3>View the review</h3>
          <form>
            <div className="form-element">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                value={selectedReview.review.CustomerName}
                disabled
              />
            </div>
            <div className="form-element">
              <label htmlFor="email">Email</label>
              <input
                type="text"
                id="email"
                value={selectedReview.review.CustomerEmail}
                disabled
              />
            </div>
            <div className="form-element">
              <label htmlFor="rating">Rating</label>
              <div className="starss">{renderStarRating(selectedReview.review.Ratecount)}</div>
            </div>
            <div className="form-element">
              <label htmlFor="reviewTitle">Review Title</label>
              <input
                type="text"
                id="reviewTitle"
                value={selectedReview.review.ReviewTitle}
                disabled
              />
            </div>
            <div className="form-element">
              <label htmlFor="reviewBody">Body of Review</label>
              <textarea
                id="reviewBody"
                cols="40"
                rows="5"
                value={selectedReview.review.ReviewBody}
                disabled
              />
            </div>
            <div className="form-element">
              <label htmlFor="reviewImage">Review Images</label>
              {selectedReview.review.ReviewImage && selectedReview.review.ReviewImage.length > 0 ? (
                <div className="review-images-containerr">
                  {selectedReview.review.ReviewImage.map((image, index) => (
                    <img key={index} src={image} alt={`Review ${index + 1}`} />
                  ))}
                </div>
              ) : (
                <p className='noimg'>No images uploaded for this review.</p>
              )}
            </div>
            <div className="review-btn-container">
              <button className="btn2" onClick={closeForm}>
                Cancel
              </button>
              <button className="btn3" onClick={handleRemove}>
                Remove
              </button>
            </div>
          </form>
          <button className="prorevclose-btn" onClick={closeForm}>
            X
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
