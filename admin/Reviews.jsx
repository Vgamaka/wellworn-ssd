import React, { useState, useEffect } from 'react';
import './Review.scss';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Notification from './Notification';
import { PropagateLoader } from 'react-spinners'; // Import the loader

const apiUrl = import.meta.env.VITE_BACKEND_API;

const Ratings = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true); // Loading state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true); // Start loader
        const productsResponse = await axios.get(
          `https://wellworn-4.onrender.com/api/products`
        );
        const formattedProducts = productsResponse.data.response.map((product) => ({
          ProductId: product.ProductId,
          ProductName: product.ProductName,
        }));
        setProducts(formattedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false); // Stop loader
      }
    };

    fetchProducts();
  }, []);

  const handleViewReviews = (productId) => {
    navigate(`/admin/productreviews/${productId}`);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredProducts = products.filter((product) =>
    product.ProductId.toString().includes(searchTerm)
  );

  return (
    <div>      <Notification />
    <div className="Review_main">
      <h1 className="topic_review">Reviews Section</h1>
      <div className="reviewsearch-bar">
        <input
          type="text"
          placeholder="Search by Product ID"
          value={searchTerm}
          onChange={handleSearch}
          className="reviewsearch-input"
        />
      </div>

      {loading ? ( // Show loader if data is still being fetched
        <div className="loading-container">
          <PropagateLoader color="#ff4500" />
        </div>
      ) : (
        <div className="table-container">
          <table className="Reviewtable">
            <thead>
              <tr>
                <th className="review_theader1">Product ID</th>
                <th className="review_theader2">Product Name</th>
                <th className="review_theader3">View Reviews</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts && filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.ProductId}>
                    <td>{product.ProductId}</td>
                    <td>{product.ProductName}</td>
                    <td>
                      <button
                        className="Review_viewmore"
                        onClick={() => handleViewReviews(product.ProductId)}
                      >
                        Reviews
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No products found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </div>

  );
};

export default Ratings;
