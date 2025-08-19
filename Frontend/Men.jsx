import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Men.scss';
import Koko from '../src/assets/koko.png';
import Header from './Header/Header';
import LOGOO from '../src/assets/logoorange.png';
import { PropagateLoader } from 'react-spinners';
import MenBag from '../src/assets/mb.jpg';
import Footer from './Footer/Footer';
import Filter from './Filter';
import { useCurrency } from './CurrencyContext';

const apiUrl = import.meta.env.VITE_BACKEND_API;

const Men = () => {
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
  const navigate = useNavigate();

    // Access user location and currency details from CurrencyContext
    const { userLocation, exchangeRate, currency } = useCurrency();

    const convertToUSD = (priceInLKR) => priceInLKR / exchangeRate;

    useEffect(() => {
      console.log("User Location:", userLocation);
      console.log("Currency:", currency);
      console.log("Exchange Rate:", exchangeRate);
    }, [userLocation, currency, exchangeRate]);
    
    useEffect(() => {
      const fetchProducts = async () => {
        try {
          const productsResponse = await axios.get(`https://wellworn-4.onrender.com/api/products`);
          const productsData = productsResponse.data.response;
      
          const filteredProducts = productsData.filter(product =>
            // Check location-based areas
            ((userLocation === "Sri Lanka" && product.Areas.includes("Sri Lanka")) ||
              (userLocation !== "Sri Lanka" && product.Areas.includes("International"))) &&
            // Include Bags and Shoes in Men and Men & Women categories
            (product.Categories.includes("Bags") || product.Categories.includes("Shoes")) &&
            (product.Categories.includes("Men") || product.Categories.includes("Men & Women")) &&
            // Exclude products in Women and Exclusive categories
            !product.Categories.includes("Women") &&
            !product.Categories.includes("Exclusive")
            
          );
      
          setData(filteredProducts);
          setFilteredData(filteredProducts);
        } catch (error) {
          console.error('Error fetching products:', error);
        } finally {
          setLoading(false);
        }
      };
      
  
    fetchProducts();
    
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

  return (
    <>
      {loading && (
        <div className="men-loader-container">
          <div className="men-loader-overlay">
            <img src={LOGOO} alt="Logo" className="men-loader-logo" />
            <PropagateLoader color={'#ff3c00'} loading={true} />
          </div>
        </div>
      )}

      {!loading && (
        <div className='men-main-container'>
          <Header />
          <div className='men-main-image-container'>
            <img src={MenBag} className='men-main-bag-logo' />
            {/* <p className='men-main-title'>SHOP MENS</p> */}
          </div>
          <p className='men-breadcrumb'>
            <Link to='/'>HOME</Link> <i className="fas fa-angle-right" /> <Link to="/men">MEN </Link><i className="fas fa-angle-right" />
          </p>
          <Filter
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
<div className="men-product-container">
  <div className="men-product-list">
    {filteredData.map(record => {
      const originalPrice = Math.min(...record.Variations.map(variation => variation.price));
      const discountPercentage = record.DiscountPercentage || 0;
      const discountedPrice = calculateDiscountedPrice(originalPrice, discountPercentage);
      console.log("Price in LKR:", originalPrice);
      console.log("Discount Percentage:", discountPercentage);
      console.log("Discounted Price in LKR:", discountedPrice);
      console.log("Price in USD:", convertToUSD(originalPrice));
      console.log("Discounted Price in USD:", convertToUSD(discountedPrice));
      return (
        <div className="men-product-box" key={record.ProductId}>
          <div className="men-product-image" onClick={() => navigate(`/product/${record.ProductId}`)}>
            <img src={record.ImgUrls[0]} alt="" />
            {record.QuickDeliveryAvailable && ( // Check for QuickDeliveryAvailable
              <div className="quick-delivery-badge">
                Quick Delivery
              </div>
            )}
            <div className="men-product-overlay">
              <Link to={`/product/${record.ProductId}`}><p>VIEW MORE</p></Link>
            </div>
            {!isSoldOut(record.Variations) && discountPercentage > 0 && (
              <div className="men-discount-percentage">
                <span>Sale {discountPercentage}%</span>
              </div>
            )}
            {isSoldOut(record.Variations) && (
              <div className="men-sold-out-notice">
                <span>SOLD OUT</span>
              </div>
            )}
          </div>
          <div className="men-product-info">
            <div className="men-product-title">{record.ProductName}</div>
            <div className="men-product-price">
              {userLocation === "Sri Lanka" ? (
                <>
                  {discountPercentage > 0 ? (
                    <>
                      <span className="men-discounted-price">LKR {discountedPrice.toFixed(2)}</span>
                      <span className="men-original-price">LKR {originalPrice.toFixed(2)}</span>
                    </>
                  ) : (
                    <span>LKR {originalPrice.toFixed(2)}</span>
                  )}
                </>
              ) : (
                <>
                  {discountPercentage > 0 ? (
                    <>
                      <span className="men-discounted-price">USD {(convertToUSD(discountedPrice)).toFixed(2)}</span>
                      <span className="men-original-price">USD {(convertToUSD(originalPrice)).toFixed(2)}</span>
                    </>
                  ) : (
                    
                    <span>USD {(convertToUSD(originalPrice)).toFixed(2)}</span>
                  )}
                </>
              )}
            </div>
            <div className="men-product-payments">
              <div className="men-payment-option">
                or 3 X {(discountedPrice / 3).toFixed(2)} with <img src={Koko} className='men-payment-koko' />
              </div>
            </div>
          </div>
        </div>
      );
    })}
  </div>
</div>



          <Footer />
        </div>
      )}
    </>
  );
};

export default Men;
