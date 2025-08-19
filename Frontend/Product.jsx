import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
// import './pp.scss';
//import './Product.css';
import './product-new.scss';
import './Productreviewsection.scss';
import { Link } from 'react-router-dom';
import Footer from './Footer/Footer';
import Header from './Header/Header'; 
import { useCart } from './CartContext';
import ReviewPercentageChart from '../Frontend/ReviewPercentageChart';
import LOGOO from '../src/assets/logoorange.png'
import { PropagateLoader } from 'react-spinners'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCheckout } from '../Frontend/order/CheckoutContext';
import { useAuthStore } from "../src/store/useAuthStore";
import HomeMen from './Home/HomeMen';
import HomeWomen from './Home/HomeWomen';
import { useCurrency } from './CurrencyContext'; // Import CurrencyContext

// import SizeChartModal from './SizeChartModal';

const apiUrl = import.meta.env.VITE_BACKEND_API;

const Product = () => {
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { refreshCart } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [availableColors, setAvailableColors] = useState([]);
  const [originalPrice, setOriginalPrice] = useState(null);
  const [reviews, setReviews] = useState([]);
  const { setCheckoutInfo } = useCheckout();
  const { user } = useAuthStore();
  const [categorydata, setCategoryData] = useState('');
  const [selectedVariationPrice, setSelectedVariationPrice] = useState(null);
  const [isSizeChartVisible, setIsSizeChartVisible] = useState(false);
  const [sizeChartImg, setSizeChartImg] = useState(null);
  // const [showModal, setShowModal] = useState(false);
  const [isSizeChartExpanded, setIsSizeChartExpanded] = useState(false);
  const [discountedPrice, setDiscountedPrice] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const { userLocation, exchangeRate, currency } = useCurrency();

  const convertToUSD = (priceInLKR) => priceInLKR / exchangeRate;

  useEffect(() => {
    const fetchProductById = async (productId) => {
      try {
        const response = await axios.get(`https://wellworn-4.onrender.com/api/products/${productId}`);
        const productData = response.data.product;
  
        if (!productData || typeof productData !== 'object' || !('ProductId' in productData)) {
          throw new Error('Invalid product data received from the server');
        }
  
        setProduct(productData);
        setCategoryData(productData.Categories);
  
        const originalPrice = Math.min(...productData.Variations.map((variation) => variation.price));
        const discountPercentage = productData.DiscountPercentage || 0;
        const discountedPrice = discountPercentage > 0
          ? originalPrice - (originalPrice * discountPercentage / 100)
          : originalPrice;
  
        setOriginalPrice(originalPrice);
        setDiscountedPrice(discountedPrice);
  
        if (productData.sizeImg && productData.sizeImg.length > 0) {
          setIsSizeChartVisible(true);
          setSizeChartImg(productData.sizeImg[0]);
        } else {
          setIsSizeChartVisible(false);
          setSizeChartImg(null);
        }
  
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setTimeout(() => setLoading(false), 1000); // Add a small delay
      }
    };
  
    fetchProductById(id);
  }, [id, userLocation, exchangeRate]); // Add userLocation and exchangeRate as dependencies
  
  
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        isSizeChartExpanded && // Only listen when expanded
        !event.target.closest(".size-chart-button") // Check if click is outside the button
      ) {
        setIsSizeChartExpanded(false);
      }
    };
  
    document.addEventListener("click", handleOutsideClick);
  
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [isSizeChartExpanded]);
  
  const fetchReviews = async (productId) => {
    try {
      const response = await axios.get(`https://wellworn-4.onrender.com/api/reviewsByProductId/${productId}`);
      const fetchedReviews = response.data.reviews;

      fetchedReviews.forEach((review, index) => {
        console.log(`Review ${index + 1}:`);
        console.log(`Customer Name: ${review.CustomerName}`);
        console.log(`Rating: ${review.Ratecount}`);
        console.log(`Review: ${review.ReviewBody}`);
        if (Array.isArray(review.ReviewImages)) {
          review.ReviewImages.forEach((image, imgIndex) => {
            console.log(`Image ${imgIndex + 1}: ${image}`);
          });
        } else {
          console.log(`Image: ${review.ReviewImages}`);
        }
        console.log(`Date: ${new Date(review.Date).toLocaleDateString()}`);
        console.log("--------------------");
      });

      setReviews(fetchedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const [displayedReviews, setDisplayedReviews] = useState(3);
  const [popupImage, setPopupImage] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });



  const calculateDiscountedPrice = (originalPrice, discountPercentage) => {
    return originalPrice - (originalPrice * discountPercentage / 100);
  };

  const handleMouseEnter = (e, imageData) => {
    const rect = e.target.getBoundingClientRect();
    setPopupImage(imageData);
    setPopupPosition({
      top: rect.top + window.scrollY - rect.height +50,  // Adjusted the popup position to be near the main image
      left: rect.left + window.scrollX + rect.width + 60
    });
  };

  const handleMouseLeave = () => {
    setPopupImage(null);
  };

  const handleSeeMore = () => {
    setDisplayedReviews(prevCount => prevCount + 3);
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const incrementQuantity = () => {
    const selectedVariation = product.Variations.find(
      (variation) => variation.size === selectedSize && variation.name === selectedColor
    );

    if (selectedVariation && quantity < selectedVariation.count) {
      setQuantity(quantity + 1);
    } else {
      toast.info('Product available count is over.');
    }
  };

  const handleSizeClick = (size) => {
    setSelectedSize(size);
    const colors = product.Variations
      .filter(variation => variation.size === size)
      .map(variation => variation.color);
    setAvailableColors(colors);
    setSelectedColor(null);
    const variation = product.Variations.find(variation => variation.size === size);
    setSelectedVariationPrice(variation ? variation.price : originalPrice);
  };

  const handleColorClick = (color) => {
    setSelectedColor(color);
    const selectedVariation = product.Variations.find(variation => variation.name === color && variation.size === selectedSize);
    if (selectedVariation) {
      setSelectedImage(selectedVariation.images);
      setSelectedVariationPrice(selectedVariation.price);
    } else {
      setSelectedImage(product.ImgUrls[0]);
      setSelectedVariationPrice(originalPrice);
    }
  };



  const handleBuyNow = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!selectedSize) {
      toast.error("Please select a size.");
      return;
    }
    if (!selectedColor) {
      toast.error("Please select a color.");
      return;
    }
    if (quantity < 1) {
      toast.error("Please adjust the quantity.");
      return;
    }
    const priceToPass = currency === 'LKR'
    ? (discountedPrice || selectedVariationPrice)
    : (discountedPrice || selectedVariationPrice) / exchangeRate;
  
    const dataToPass = [{
      productId: id,
      ProductName: product.ProductName,
      quantity,
      size: selectedSize,
      color: selectedColor,
      price: priceToPass,
      currency, // Include the currency directly
      image: selectedImage || product.ImgUrls[0]
    }];

    console.log("Passing data to checkout:", dataToPass);
    setCheckoutInfo(dataToPass, 'product'); // Indicate checkout initiated from product
    navigate('/checkout');
  };

  const handleAddToCart = () => {
    const userId = user?.id || user?.UserId || user?.customerId;
    if (!userId) {
      toast.error("User not authenticated. Please log in.");
      navigate('/login');
      return;
    }
    

    if (!selectedColor) {
      toast.error("Please select a color.");
      return;
    }

    const selectedVariation = product.Variations.find(variation =>
      variation.name === selectedColor && (!product.Variations.some(v => v.size) || variation.size === selectedSize)
    );

    if (!selectedVariation) {
      toast.error("Selected variation not available.");
      return;
    }

    if (selectedVariation.count === 0) {
      toast.error("This product is currently out of stock.");
      return;
    }

    const randomNumber = Math.floor(10000 + Math.random() * 90000);
    const cartId = `CART_${randomNumber}`;

    const priceToAdd = currency === 'LKR'
    ? (discountedPrice || originalPrice)
    : (discountedPrice || originalPrice) / exchangeRate;

  const itemToAdd = {
    cartId,
    productId: product.ProductId,
    name: product.ProductName,
    price: priceToAdd,
    image: selectedVariation.images[0],
    size: selectedSize,
    color: selectedColor,
    quantity: quantity,
    availableCount: selectedVariation.count,
    customerId: userId, // Ensure userId is passed here
    currency // Include currency
  };

    console.log("Adding product to cart: ", itemToAdd);

    setIsAddingToCart(true);

    axios.post(`https://wellworn-4.onrender.com/api/cart/add`, itemToAdd)
      .then(response => {
        if (response.status === 200) {
          toast.success('Product added to cart successfully');
          refreshCart();
        } else {
          toast.error('Failed to add product to cart');
        }
      })
      .catch(error => {
        console.error('Failed to add product to cart:', error);
        toast.error('Failed to add product to cart');
      })
      .finally(() => {
        setIsAddingToCart(false);
      });
  };
  return (
    <div className='heaven'>
      {loading ? (
        <div className="loader-container">
          <div className="loader-overlay">
            <img src={LOGOO} alt="Logo" className="loader-logo" />
            <PropagateLoader color={'#ff3c00'} loading={true} />
          </div>
        </div>
      ) : (
        <>
          <Header />
          <p className='main1'>
            <Link to='/'>HOME</Link> <i className="fas fa-angle-right" /> <Link to="/men">MEN </Link>
            <i className="fas fa-angle-right" /> <Link to="/product/:id">{product.ProductName} </Link>
          </p>
          <div className="product-container">
            <div className="left-section">
              <div className="main-image">
                <img src={selectedImage || product.ImgUrls[0]} alt={product.ProductName} />
              </div>
              {Array.isArray(product.ImgUrls) && (
                <div className="small-images">
                  {product.ImgUrls.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={product.ProductName}
                      onClick={() => handleImageClick(image)}
                    />
                  ))}
                </div>
              )}
            </div>
  
            <div className="right-section">
              
              <p className='product_title'>{product.ProductName}</p>
              <div className="product_price">
  {discountedPrice !== originalPrice ? (
    <>
      <span className="discounted-price">
        {currency === 'LKR' ? `LKR ${discountedPrice.toFixed(2)}` : `USD ${(discountedPrice / exchangeRate).toFixed(2)}`}
      </span>
      <span className="original-price">
        {currency === 'LKR' ? `LKR ${originalPrice.toFixed(2)}` : `USD ${(originalPrice / exchangeRate).toFixed(2)}`}
      </span>
    </>
  ) : (
    <span>
      {currency === 'LKR' ? `LKR ${originalPrice.toFixed(2)}` : `USD ${(originalPrice / exchangeRate).toFixed(2)}`}
    </span>
  )}
</div>

              {product.QuickDeliveryAvailable && (
                  <div className="quickdelivery">
                    <i className="fas fa-shipping-fast"></i>
                    <label>Quick Delivery Available</label>
                  </div>
                )}

              <div className="ratings1">
                <div className="stars1">
                  {Array.from({ length: product.rating }, (_, index) => (
                    <i key={index} className="fas fa-star"></i>
                  ))}
                  {product.rating % 1 !== 0 && <i className="fas fa-star-half"></i>}
                </div>
                <span>({product.reviews} Reviews)</span>
                
              </div>

  
              <div className="description">
                <div dangerouslySetInnerHTML={{ __html: product.Description }}></div>
              </div>
  
              {product.Variations && product.Variations.some(variation => variation.size) && (
                <div className="sizebutton">
                  <p className='psize'>Size</p>
                  {product.Variations
                    .reduce((uniqueSizes, variation) => {
                      if (!uniqueSizes.includes(variation.size)) {
                        uniqueSizes.push(variation.size);
                      }
                      return uniqueSizes;
                    }, [])
                    .map((size, index) => (
                      <button
                        key={index}
                        className={selectedSize === size ? 'selected' : ''}
                        onClick={() => handleSizeClick(size)}
                      >
                        {size}
                      </button>
                    ))}
                  {selectedSize && (
                    <button className="clearbutton" onClick={() => setSelectedSize(null)}>
                      Clear
                    </button>
                  )}
                </div>
              )}
  
              <div
                className={`size-chart-button ${isSizeChartExpanded ? "visible" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSizeChartExpanded((prev) => !prev);
                }}
              >
                {!isSizeChartExpanded ? (
                  <span className="button-content">
                    <i className="fas fa-ruler-horizontal"></i>
                    <span>Size Chart</span>
                  </span>
                ) : (
                  <div className="size-chart-content">
                    <h4>Size Chart</h4>
                    <img
                      src={sizeChartImg}
                      alt="Size Chart"
                      style={{
                        width: "100%",
                        height: "auto",
                        aspectRatio: "1/1",
                      }}
                    />
                  </div>
                )}
              </div>
  
              {selectedSize && (
                <div className="color-section">
                  <p>Colors</p>
                  {product.Variations
                    .filter(variation => variation.size === selectedSize)
                    .map((variation, index) => (
                      <button
                        key={index}
                        className={selectedColor === variation.name ? 'selected' : ''}
                        onClick={() => handleColorClick(variation.name)}
                        value={variation.name}
                      >
                        {variation.name}
                      </button>
                    ))}
                </div>
              )}
  
              <div className="quantity-selector">
                <label className="quantity-label">Quantity</label>
                <button onClick={decrementQuantity}>-</button>
                <span>{quantity}</span>
                <button onClick={incrementQuantity}>+</button>
              </div>
  
              <div className="abs">
  <div className="button-group">
  <div className="addcart">
  <button onClick={handleAddToCart} disabled={isAddingToCart}>
    {isAddingToCart ? 'Adding...' : 'Add to Cart'}
  </button>
</div>

    <div className="buyNow">
      <button onClick={handleBuyNow}>Buy Now</button>
    </div>
  </div>
  <div className="payment-options">
                <img
                  src="/src/assets/Payments_Banner_Web.png"
                  alt="Payments"
                  className="payments-banner"
                />
                <img
                  src="/src/assets/koko_logo_removebg.png"
                  alt="Koko"
                  className="koko-logo"
                />
              </div>

</div>

  

            </div>
          </div>
          <span className='linedevider'></span>
          <ReviewPercentageChart productId={id} />
  
          <div className="reviewmain-container">
            <h2 className="reviewmain-title">Customer Reviews</h2>
            {reviews.length === 0 ? (
              <p className="noss-reviews">No reviews for this product yet.</p>
            ) : (
              reviews.slice(0, displayedReviews).map((review, index) => (
                <div key={index} className="reviewss">
                  <div className="reviewsmain-author">{review.CustomerName}</div>
                  <div className="reviewmain-rating">
                    {[...Array(review.Ratecount)].map((_, idx) => (
                      <i key={idx} className="fas fa-star"></i>
                    ))}
                  </div>
                  <div className="reviewmain-body">
                    <p>{review.ReviewBody}</p>
                  </div>
                  <div className="reviewmain-images">
                    {review.ReviewImage.map((imageData, idx) => (
                      <img
                        key={idx}
                        src={imageData}
                        alt={`Customer ${idx + 1}`}
                        className="reviewmain-image"
                        onMouseEnter={(e) => handleMouseEnter(e, imageData)}
                        onMouseLeave={handleMouseLeave}
                      />
                    ))}
                  </div>
                  <div className="reviewmain-date">{new Date(review.Date).toLocaleDateString()}</div>
                </div>
              ))
            )}
            {displayedReviews < reviews.length && (
              <div className="seessmain-more-container">
                <button onClick={handleSeeMore} className="seessmain-more-btn">
                  See More
                </button>
              </div>
            )}
            {popupImage && (
              <div
                className="popupss-image"
                style={{
                  position: 'absolute',
                  top: `${popupPosition.top}px`,
                  left: `${popupPosition.left}px`,
                  zIndex: 1000,
                }}
              >
                <img src={popupImage} alt="Popup" />
              </div>
            )}
          </div>
  
          <div className='alsolike'>
            <h2 style={{ marginLeft: "10%", fontSize: "28px" }}>IT MIGHT INTEREST YOU</h2>
            {categorydata && (
              <>
                {categorydata.includes('Men') && <HomeMen />}
                {categorydata.includes('Women') && <HomeWomen />}
              </>
            )}
          </div>
          <ToastContainer autoClose={3000} position="top-right" />

          <Footer />
        </>
      )}
    </div>
  );
  
  
};

export default Product;