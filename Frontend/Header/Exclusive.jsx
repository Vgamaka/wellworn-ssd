import './Exclusive.scss';
import axios from 'axios';
import { Link } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import Exnewim from '../../src/assets/Exnewim.png'; // New desktop banner
import EXCMobile from '../../src/assets/EXCMobile.png'; // Mobile banner
import LOGOO from '../../src/assets/logoorange.png'; // Ensure you have this logo image
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import { PropagateLoader } from 'react-spinners';
import FilterSection from '../FilterExclusive'; // Imported the FilterExclusive component
import Mint from '../../src/assets/int.png';
import Koko from '../../src/assets/koko.png';
import { useCurrency } from '../CurrencyContext'; // Use the CurrencyContext

const apiUrl = import.meta.env.VITE_BACKEND_API;

function Exclusive() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('0');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortOrder, setSortOrder] = useState('featured');
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [stockFilter, setStockFilter] = useState('');
  const [inStockCount, setInStockCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [bannerImage, setBannerImage] = useState(Exnewim); // Default to desktop banner
  const productRef = useRef([]);

  // Access user location and currency details from CurrencyContext
  const { userLocation, exchangeRate, currency } = useCurrency();

  // Unified currency conversion function
  const convertCurrency = (priceInLKR) => {
    return currency === 'USD'
      ? (priceInLKR / exchangeRate).toFixed(2)
      : priceInLKR.toFixed(2);
  };

  useEffect(() => {
    const updateBannerImage = () => {
      if (window.innerWidth <= 1024) {
        setBannerImage(EXCMobile); // Mobile banner
      } else {
        setBannerImage(Exnewim); // Desktop banner
      }
    };

    updateBannerImage();
    window.addEventListener('resize', updateBannerImage);
    return () => window.removeEventListener('resize', updateBannerImage);
  }, []);


  // Fetch and filter products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsResponse = await axios.get(`${apiUrl}/api/products`);
        const productsData = productsResponse.data.response;

        const filteredProducts = productsData.filter((product) =>
          ((userLocation === 'Sri Lanka' && product.Areas.includes('Sri Lanka')) ||
            (userLocation !== 'Sri Lanka' && product.Areas.includes('International'))) &&
          product.Categories.includes('Exclusive')
        );

        setData(filteredProducts);
        setFilteredData(filteredProducts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };

    if (userLocation) {
      fetchProducts();
    }
  }, [userLocation]);


  useEffect(() => {
    const calculateStockCounts = () => {
      const inStock = data.filter(product => !isSoldOut(product.Variations)).length;
      const outOfStock = data.filter(product => isSoldOut(product.Variations)).length;
      setInStockCount(inStock);
      setOutOfStockCount(outOfStock);
    };

    calculateStockCounts();
  }, [data]);

  const sortProducts = (products, sortOrder) => {
    const sortedProducts = [...products];

    switch (sortOrder) {
      case 'a-z':
        sortedProducts.sort((a, b) => a.ProductName.localeCompare(b.ProductName));
        break;
      case 'z-a':
        sortedProducts.sort((a, b) => b.ProductName.localeCompare(a.ProductName));
        break;
      case 'low-high':
        sortedProducts.sort((a, b) => {
          const minPriceA = Math.min(...(a.Variations?.map(variation => parseFloat(variation.price)) || [Infinity]));
          const minPriceB = Math.min(...(b.Variations?.map(variation => parseFloat(variation.price)) || [Infinity]));
          return minPriceA - minPriceB;
        });
        break;
      case 'high-low':
        sortedProducts.sort((a, b) => {
          const minPriceA = Math.min(...(a.Variations?.map(variation => parseFloat(variation.price)) || [0]));
          const minPriceB = Math.min(...(b.Variations?.map(variation => parseFloat(variation.price)) || [0]));
          return minPriceB - minPriceA;
        });
        break;
      default:
        break;
    }

    return sortedProducts;
  };

  useEffect(() => {
    let filteredProducts = data;

    if (selectedCategory) {
      filteredProducts = filteredProducts.filter((product) =>
        product.Categories.includes(selectedCategory)
      );
    }

    if (stockFilter) {
      filteredProducts = filteredProducts.filter(product => {
        const isProductSoldOut = isSoldOut(product.Variations);
        return (stockFilter === 'inStock' && !isProductSoldOut) || (stockFilter === 'outOfStock' && isProductSoldOut);
      });
    }

    if (minPrice && maxPrice) {
      filteredProducts = filteredProducts.filter(product => {
        const originalPrice = Math.min(...product.Variations.map(variation => variation.price));
        const discountPercentage = product.DiscountPercentage || 0;
        const discountedPrice = originalPrice - (originalPrice * discountPercentage / 100);
  
        return (
          (originalPrice >= parseFloat(minPrice) && originalPrice <= parseFloat(maxPrice)) ||
          (discountedPrice >= parseFloat(minPrice) && discountedPrice <= parseFloat(maxPrice))
        );
      });
    }

    if (selectedRatings.length > 0) {
      filteredProducts = filteredProducts.filter(product => selectedRatings.includes(product.Rating.toString()));
    }

    if (searchQuery) {
      filteredProducts = filteredProducts.filter(product =>
        product.ProductName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.ProductId.toString().includes(searchQuery)
      );
    }

    const sortedFilteredProducts = sortProducts(filteredProducts, sortOrder);

    setFilteredData(sortedFilteredProducts);
  }, [data, selectedCategory, minPrice, maxPrice, selectedRatings, sortOrder, stockFilter, searchQuery]);

  const handleCategoryChange = (event) => {
    const selected = event.target.value;
    setSelectedCategory(prevCategory => prevCategory === selected ? '' : selected);
  };

  const handleMinPriceChange = (event) => {
    setMinPrice(event.target.value);
  };

  const handleMaxPriceChange = (event) => {
    setMaxPrice(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };

  const handleRatingChange = (event) => {
    const rating = event.target.value;
    if (event.target.checked) {
      setSelectedRatings((prevRatings) => [...prevRatings, rating]);
    } else {
      setSelectedRatings((prevRatings) => prevRatings.filter((r) => r !== rating));
    }
  };

  const handleStockFilterChange = (event) => {
    setStockFilter(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
  };

  const calculateDiscountedPrice = (originalPrice, discountPercentage) => {
    return originalPrice - (originalPrice * discountPercentage / 100);
  };

  const isSoldOut = (variations) => {
    return variations.every(variation => variation.count === 0);
  };



  const clearCategory = () => {
    setSelectedCategory('');
  };

  const clearAvailability = () => {
    setStockFilter('');
  };

  const clearPrice = () => {
    setMinPrice('');
    setMaxPrice('');
  };

  const clearRating = () => {
    setSelectedRatings([]);
  };

  const handleScrollDown = () => {
    const targetElement = document.querySelector('.exclusive-product-container');
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle Scroll animation using IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view'); // Add 'in-view' class when in view
        } else {
          entry.target.classList.remove('in-view'); // Remove 'in-view' class when out of view
        }
      });
    });

    productRef.current.forEach(product => {
      if (product) {
        observer.observe(product);
      }
    });

    return () => {
      if (productRef.current) {
        productRef.current.forEach(product => {
          if (product) observer.unobserve(product);
        });
      }
    };
  }, [filteredData]);

  return (
    <div className="exclusive-main-container">
      {loading && (
        <div className="loader-container">
          <div className="loader-overlay">
            <img src={LOGOO} alt="Logo" className="loader-logo" />
            <PropagateLoader color={'#ff3c00'} loading={true} />
          </div>
        </div>
      )}

      {!loading && (
        <>
          <Header />

          <div className="exclusive-main-image-container">
            <img className="exclusive-main-banner" src={bannerImage} alt="Banner" />
            <button className="excabuton" onClick={handleScrollDown}>Shop Now</button>
          </div>

          <FilterSection
                     selectedCategory={selectedCategory}
                     minPrice={minPrice}
                     maxPrice={maxPrice}
                     sortOrder={sortOrder}
                     selectedRatings={selectedRatings}
                     stockFilter={stockFilter}
                     inStockCount={inStockCount}
                     outOfStockCount={outOfStockCount}
                     handleCategoryChange={handleCategoryChange}
                     handleMinPriceChange={handleMinPriceChange}
                     handleMaxPriceChange={handleMaxPriceChange}
                     handleSortChange={handleSortChange}
                     handleRatingChange={handleRatingChange}
                     handleStockFilterChange={handleStockFilterChange}
                     clearCategory={clearCategory}
                     clearPrice={clearPrice}
                     clearRating={clearRating}
                     clearAvailability={clearAvailability}
                     productCounts={filteredData.length}
                     handleSearchChange={handleSearchChange}
                     handleSearchSubmit={handleSearchSubmit}
                     searchQuery={searchQuery}
          />

          <div className="exclusive-product-container">
            <div className="exclusive-product-list">
              {filteredData.map((record, index) => {
                const originalPrice = Math.min(...record.Variations.map(variation => variation.price));
                const discountPercentage = record.DiscountPercentage || 0;
                const discountedPrice = calculateDiscountedPrice(originalPrice, discountPercentage);

                return (
                  <div
                    className="exclusive-product-box"
                    key={record.ProductId}
                    ref={(el) => (productRef.current[index] = el)} // Assign each product box to the ref array
                  >
                    <div className="exclusive-product-image">
                      {record.QuickDeliveryAvailable && (
                        <div className="quick-delivery-badgee">Quick Delivery</div>
                      )}
                      {/* Wrap the image in Link to navigate to the product page */}
                      <Link to={`/product/${record.ProductId}`}>
                        <img src={record.ImgUrls[0]} alt={record.ProductName} />
                      </Link>
                      {/* The overlay is hidden on smaller screens using media query */}
                      <div className="men-product-overlay">
                        <Link to={`/product/${record.ProductId}`}>
                          <p>VIEW MORE</p>
                        </Link>
                      </div>
                      {!isSoldOut(record.Variations) && discountPercentage > 0 && (
                        <div className="exclusive-discount-percentage">
                          <span>Sale {discountPercentage}%</span>
                        </div>
                      )}
                      {isSoldOut(record.Variations) && (
                        <div className="exclusive-sold-out-notice">
                          <span>SOLD OUT</span>
                        </div>
                      )}
                    </div>
                    <div className="exclusive-product-info">
                      {/* Wrap the title in Link to navigate to the product page */}
                      <Link to={`/product/${record.ProductId}`} className="exclusive-product-title">
                        {record.ProductName}
                      </Link>
                      <div className="exclusive-product-price">
                        {currency === 'LKR' ? (
                          <>
                            {discountPercentage > 0 ? (
                              <>
                                <span className="exclusive-discounted-price">
                                  LKR {convertCurrency(discountedPrice)}
                                </span>
                                <span className="exclusive-original-price">
                                  LKR {convertCurrency(originalPrice)}
                                </span>
                              </>
                            ) : (
                              <span>LKR {convertCurrency(originalPrice)}</span>
                            )}
                          </>
                        ) : (
                          <>
                            {discountPercentage > 0 ? (
                              <>
                                <span className="exclusive-discounted-price">
                                  USD {convertCurrency(discountedPrice)}
                                </span>
                                <span className="exclusive-original-price">
                                  USD {convertCurrency(originalPrice)}
                                </span>
                              </>
                            ) : (
                              <span>USD {convertCurrency(originalPrice)}</span>
                            )}
                          </>
                        )}
                      </div>
                      <div className="exclusive-product-payments">
                        <div className="exclusive-payment-option">
                          or 3 X {(discountedPrice / 3).toFixed(2)} with
                          <img
                            src={Koko}
                            className="exclusive-payment-koko"
                            style={{ marginBottom: '2px' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
                
              })}
            </div>
          </div>

          <Footer />
        </>
      )}
    </div>
  );
}

export default Exclusive;
