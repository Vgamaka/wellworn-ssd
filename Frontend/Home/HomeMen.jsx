import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './HomeMen.scss';
import Koko from '../../src/assets/koko.png';
import { PropagateLoader } from 'react-spinners';
import { useCurrency } from '../CurrencyContext'; // Use the CurrencyContext

const apiUrl = import.meta.env.VITE_BACKEND_API;

const HomeMen = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('0');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [selectedRatings, setSelectedRatings] = useState([]);
  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();
  const isMobile = window.innerWidth <= 575.98;
   // Access user location and currency details from CurrencyContext
   const { userLocation, exchangeRate } = useCurrency();

   // Currency conversion function

   const convertToUSD = (priceInLKR) => priceInLKR / exchangeRate;


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsResponse = await axios.get(`${apiUrl}/api/products`);
        const productsData = productsResponse.data.response;

        const filteredProducts = productsData.filter(product =>
          ((userLocation === "Sri Lanka" && product.Areas.includes("Sri Lanka")) ||
            (userLocation !== "Sri Lanka" && product.Areas.includes("International"))) &&
          (product.Categories.includes("Men") || product.Categories.includes("Men & Women"))
        );

        setData(filteredProducts);
        setLoading(false);
        setFilteredData(filteredProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userLocation) {
      fetchProducts();
    }
  }, [userLocation]);

  useEffect(() => {
    let filteredProducts = data;

    if (selectedCategory) {
      filteredProducts = filteredProducts.filter((product) =>
        product.Categories.includes(selectedCategory)
      );
    }

    if (minPrice && maxPrice) {
      filteredProducts = filteredProducts.filter((product) => {
        const minProductPrice = Math.min(
          ...product.Variations.map((variation) => variation.price)
        );
        return (
          minProductPrice >= parseFloat(minPrice) &&
          minProductPrice <= parseFloat(maxPrice)
        );
      });
    }

    if (selectedRatings.length > 0) {
      filteredProducts = filteredProducts.filter((product) =>
        selectedRatings.includes(product.Rating.toString())
      );
    }

    if (sortOrder === 'minToMax') {
      filteredProducts.sort(
        (a, b) =>
          Math.min(...a.Variations.map((variation) => variation.price)) -
          Math.min(...b.Variations.map((variation) => variation.price))
      );
    } else if (sortOrder === 'maxToMin') {
      filteredProducts.sort(
        (a, b) =>
          Math.min(...b.Variations.map((variation) => variation.price)) -
          Math.min(...a.Variations.map((variation) => variation.price))
      );
    }

    setFilteredData(filteredProducts);
  }, [data, selectedCategory, minPrice, maxPrice, selectedRatings, sortOrder]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handleWheelScroll = (event) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: event.deltaY, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheelScroll);
      return () => {
        container.removeEventListener('wheel', handleWheelScroll);
      };
    }
  }, []);


  const calculateDiscountedPrice = (originalPrice, discountPercentage) => {
    return originalPrice - (originalPrice * discountPercentage / 100);
  };

  const isSoldOut = (variations) => {
    return variations.every(variation => variation.count === 0);
  };

  return (
    <>
      {loading ? (
        <div className="spinner-container">
          <PropagateLoader color="#333" loading={loading} />
        </div>
      ) : (
        <div>
          <div className="menmids">
            <div className="mens" ref={scrollContainerRef}>
              {filteredData.map((record) => {
                const originalPrice = Math.min(...record.Variations.map(variation => variation.price));
                const discountPercentage = record.DiscountPercentage || 0;
                const discountedPrice = calculateDiscountedPrice(originalPrice, discountPercentage);

                return (
                  <div className="boxs" key={record.ProductId}>
                    <div className="imgages" onClick={() => isMobile && navigate(`/product/${record.ProductId}`)}>
                                {/* Quick Delivery Badge */}
          {record.QuickDeliveryAvailable && (
            <div className="quick-delivery-badg">Quick Delivery</div>
          )}
                      <img src={record.ImgUrls[0]} alt="" />
                      {!isMobile && (
                        <div className="overlay3s">
                          <Link to={`/product/${record.ProductId}`}>
                            <p>VIEW MORE</p>
                          </Link>
                        </div>
                      )}
                    </div>
                    <div className="informationss">
                      <div className="title">{record.ProductName}</div>
                      <div className="price">
                        {userLocation === "Sri Lanka" ? (
                          <>
                            {discountPercentage > 0 ? (
                              <>
                                 <span className="men-original-price">LKR {discountedPrice.toFixed(2)}</span>
                                <span className="men-discounted-price">LKR {originalPrice.toFixed(2)}</span>
                              </>
                            ) : (
                              <span>LKR {originalPrice.toFixed(2)}</span>
                            )}
                          </>
                        ) : (
                          <>
                            {discountPercentage > 0 ? (
                              <>
                                <span className="men-original-price">USD {(convertToUSD(discountedPrice)).toFixed(2)}</span>
                                <span className="men-discounted-price">USD {(convertToUSD(originalPrice)).toFixed(2)}</span>
                              </>
                            ) : (
                              <span>USD {(convertToUSD(originalPrice)).toFixed(2)}</span>
                            )}
                          </>
                        )}
                      </div>
                      <div className="ratingss">
                        <div className="paymentsimgs">
                          <div className="p01">
                            <p>or 3 X {(discountedPrice / 3).toFixed(2)} with </p>
                            <img src={Koko} className="kokopay" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HomeMen;
