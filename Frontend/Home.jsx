import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.scss';
import Footer from './Footer/Footer';
import Header from '../Frontend/Header/Header';
import Slider from './Slider';
import HomeMen from './Home/HomeMen';
import HomeWomen from './Home/HomeWomen';
import NewArrivals from './Home/NewArrivals';
import Sections from '../src/assets/section.jpg';
import Image1Hover from '../src/assets/Well Worn Men Shoe.png';
import Image2Hover from '../src/assets/Well Worn Women Shoe.png';
import Image3Hover from '../src/assets/Well Worn Women Bag.png';
import Image4Hover from '../src/assets/Well Worn Men Bag.png';
import { useCurrency } from './CurrencyContext'; // Import CurrencyContext

const apiUrl = import.meta.env.VITE_BACKEND_API;

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const { currency, exchangeRate } = useCurrency(); // Use CurrencyContext

  
  const handleSearch = async () => {
    try {
      const userCountry = currency === 'LKR' ? 'Sri Lanka' : 'Other'; // Determine country
      const response = await axios.get('https://wellworn-4.onrender.com/api/search', {
        params: { query: searchQuery, country: userCountry }
      });
  
      console.log('Search response:', response);
      setSearchResults(response.data.products || []);
      setSearched(true);
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
    }
  };
  

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Enter') {
        handleSearch();
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [searchQuery]);

  const formatPrice = (price, originalPrice, convertedPrice) => {
    if (currency === 'LKR') {
      // Show the original price without conversion for LKR
      return `LKR ${originalPrice?.toFixed(2) || '0.00'}`;
    }
  
    if (currency === 'USD') {
      // Show the converted price for USD
      return `USD ${convertedPrice?.toFixed(2) || '0.00'}`;
    }
  
    return 'N/A'; // Fallback
  };
  
  
  const calculateDiscountedPrice = (price, discountPercentage) => {
    const discountedPrice = price - (price * discountPercentage / 100);
    return discountedPrice;
  };
  
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div>
      <Header />
      <div className="home-container">
        <Slider />
        <div className="search-barrr">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Product Name, ID, Category..."
          />
          <button className="search-buttomnm" onClick={handleSearch}>Search</button>
        </div>

        <div className="search-results">
          {searched && searchResults.length > 0 ? (
            searchResults.map(product => {
              const minPrice = product.Variations.length > 0 ? Math.min(...product.Variations.map(variation => variation.price)) : null;
              const discountedPrice = minPrice && product.DiscountPercentage ? (minPrice - (minPrice * product.DiscountPercentage / 100)).toFixed(2) : null;

              return (
                <div className="men-product-box" key={product.ProductId} onClick={() => handleProductClick(product.ProductId)}>
                  <div className="men-product-image">


                    <img src={product.ImgUrls[0]} alt={product.ProductName} />
                    <div className="men-product-overlay">
                      <Link to={`/product/${product.ProductId}`}><p>VIEW MORE</p></Link>
                    </div>
                    {product.DiscountPercentage > 0 && (
                      <div className="men-discount-percentage">
                        <span>Sale {product.DiscountPercentage}%</span>
                      </div>
                    )}
                    {product.Variations.every(variation => variation.count === 0) && (
                      <div className="men-sold-out-notice">
                        <span>SOLD OUT</span>
                      </div>
                    )}
                  </div>
                  <div className="men-product-info">
                    <div className="men-product-title">{product.ProductName}</div>
                    <div className="men-product-price">
  {discountedPrice ? (
    <>
      <span className="original-price">
        {formatPrice(minPrice, minPrice, minPrice ? minPrice / exchangeRate : null)}
      </span>
      <span className="discounted-price">
        {formatPrice(
          parseFloat(discountedPrice),
          parseFloat(discountedPrice),
          discountedPrice ? discountedPrice / exchangeRate : null
        )}
      </span>
    </>
  ) : (
    <span className="original-priceee">
      {formatPrice(minPrice, minPrice, minPrice ? minPrice / exchangeRate : null)}
    </span>
  )}
</div>


                  </div>
                </div>
              );
            })
          ) : (
            searched && <p className="no-results">No results found</p>
          )}
        </div>

        <div className="home-content">
          <div className="home-newarrivals">
            <h4 className="home-h4m">New Arrivals</h4>
            <div className="home-imgplace">
              <NewArrivals />
            </div>
            <Link to={'/newarrivalsmain'}>
              <label className="home-homemenlable1">View All</label>
            </Link>
          </div>

          <div className="home-sections-grid mobile-only">
            <Link to={'/MenShoes'} className="home-section">
              <img src={Image1Hover} alt="Men's Shoes" className="hover-img" />
              <div className="overlay">
                <h2>MEN'S SHOES</h2>
                <button className="shop-buttott">Shop Now</button>
              </div>
            </Link>
            <Link to={'/WomenShoes'} className="home-section">
              <img src={Image2Hover} alt="Women's Shoes" className="hover-img" />
              <div className="overlay">
                <h2>WOMEN'S SHOES</h2>
                <button className="shop-buttott">Shop Now</button>
              </div>
            </Link>
            <Link to={'/WomenBag'} className="home-section">
              <img src={Image3Hover} alt="Women's Bags" className="hover-img" />
              <div className="overlay">
                <h2>WOMEN'S BAGS</h2>
                <button className="shop-buttott">Shop Now</button>
              </div>
            </Link>
            <Link to={'/MenBag'} className="home-section">
              <img src={Image4Hover} alt="Men's Bags" className="hover-img" />
              <div className="overlay">
                <h2>MEN'S BAGS</h2>
                <button className="shop-buttott">Shop Now</button>
              </div>
            </Link>
          </div>

          <div className="home-homemenn">
            <h4 className="home-h4m">Men's Collection</h4>
            <HomeMen />
            <Link to={'/men'}>
              <label className="home-homemenlable">View All</label>
            </Link>
          </div>

          <div className="home-homewomen">
            <h4 className="home-h4m">Women's Collection</h4>
            <HomeWomen />
            <Link to={'/women'}>
              <label className="home-homemenlable">View All</label>
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Home;