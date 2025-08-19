import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './paymentscss.scss';
import axios from 'axios';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import cod from '../../src/assets/cod.png';
import koko from '../../src/assets/koko.png';
import Webxpay from '../../src/assets/webxpay-removebg.png';
import { useAuthStore } from "../../src/store/useAuthStore";
import { useCheckout } from '../../Frontend/order/CheckoutContext';
import { createRoot } from 'react-dom/client';
import OrderConfirmationModal from './OrderConfirmationModal';
import { PropagateLoader } from 'react-spinners';
import LOGOO from '../../src/assets/logoorange.png';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import ReactDOM from 'react-dom';
import { useCart } from '../CartContext'; // Import the CartContext

const exchangeRatesAPI = 'https://openexchangerates.org/api/latest.json?app_id=39818b11430a4381b1d642a587531ee4';

function Checkout() {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const { checkoutData } = useCheckout();
  const navigate = useNavigate();
  const [validCouponApplied, setValidCouponApplied] = useState(false);
  const [errors, setErrors] = useState({});
  const [subtotal, setSubtotal] = useState(0);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);
  const [expandedPayment, setExpandedPayment] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [additionalDetailsExpanded, setAdditionalDetailsExpanded] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  const [exchangeRates, setExchangeRates] = useState({});
  const [currency, setCurrency] = useState('LKR');
  const [orderDetails, setOrderDetails] = useState({});
  const { checkoutSource } = useCheckout();
  const { refreshCart } = useCart(); // Get refreshCart from CartContext
  const [codAvailable, setCodAvailable] = useState(true);
  const [kokoAvailable, setKokoAvailable] = useState(true);
  

  const apiUrl = import.meta.env.VITE_BACKEND_API;

  
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await axios.get(exchangeRatesAPI);
        setExchangeRates(response.data.rates);
      } catch (error) {
        console.error('Failed to fetch exchange rates', error);
      }
    };
    fetchExchangeRates();
  }, []);
  useEffect(() => {
    if (!checkoutData) {
      refreshCart();
      navigate('/');
      return;
    }
  
    const initialSubtotal = Array.isArray(checkoutData)
      ? checkoutData.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0)
      : parseFloat(checkoutData.price) * checkoutData.quantity;
  
    setSubtotal(initialSubtotal);
    setLoading(false);
  
    const fetchUserLocationAndCurrency = async () => {
      try {
        const response = await axios.get('https://ipapi.co/json/');
        const userCountry = response.data.country_name;
        handleCurrencyChange(userCountry);
        setFormData(prevState => ({ ...prevState, country: userCountry }));
      } catch (error) {
        console.error('Failed to fetch user country', error);
      }
    };
  
    fetchUserLocationAndCurrency();
  }, [checkoutData, navigate]);
  

  const handleDownloadPDF = async () => {
    const element = document.createElement("div");
    document.body.appendChild(element);

    const root = createRoot(element);
    root.render(<Letterhead order={orderDetails} />);

    setTimeout(async () => {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      pdf.addImage(imgData, 'PNG', 0, 0);
      pdf.save('order-confirmation.pdf');

      ReactDOM.unmountComponentAtNode(element);
      document.body.removeChild(element);
    }, 500);
  };

  const handleContinueShopping = () => {
    refreshCart();
    navigate('/');
  };

  useEffect(() => {
    setLoading(false);
    if (!checkoutData || checkoutData.length === 0) {
      refreshCart();
      navigate('/');
    }
  }, [checkoutData, navigate]);

  const userId = user?.UserId;
  console.log("customerid: ", userId);

  const [formData, setFormData] = useState({
    country: '',
    email: '',
    firstName: '',
    lastName: '',
    contactNumber: '',
    State: '',
    address: '',
    address02: '',
    city: '',
    postalCode: '',
    additionalDetails: '',
    shippingMethod: '',
    paymentMethod: '',
    couponCode: '',
    saveAsDefault: false
  });

  const validateAddress = async (country, State, city, postalCode) => {
    const apiKey = 'AIzaSyDjX57bsRB-wSNPEg9NuF-BZFXMbXA1CPQ';
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)},${encodeURIComponent(State)},${encodeURIComponent(country)}&components=postal_code:${encodeURIComponent(postalCode)}&key=${apiKey}`;

    console.log('Validating address with URL:', url);

    try {
      const response = await axios.get(url);
      console.log('Geocoding API response:', response.data);

      const { results, status, error_message } = response.data;
      if (status === 'OK' && results.length > 0) {
        return true;
      } else {
        console.error('Geocoding API error:', error_message || 'No results found');
        return false;
      }
    } catch (error) {
      console.error('Error validating address:', error);
      return false;
    }
  };

  const updatePrices = (newCurrency, conversionRate) => {
    const convertedSubtotal = Array.isArray(checkoutData)
      ? checkoutData.reduce((acc, item) => acc + (parseFloat(item.price) * conversionRate * item.quantity), 0)
      : parseFloat(checkoutData.price) * conversionRate * checkoutData.quantity;
  
    const convertedShippingPrice = selectedShippingMethod 
      ? selectedShippingMethod.price * conversionRate 
      : 0;
    
    const convertedDiscount = discount * conversionRate;
    const convertedTotal = convertedSubtotal + convertedShippingPrice - convertedDiscount;
  
    setSubtotal(convertedSubtotal);
    setDiscount(convertedDiscount);
    setTotal(convertedTotal);
  
    if (selectedShippingMethod) {
      setSelectedShippingMethod(prev => ({
        ...prev,
        price: prev.price * conversionRate,
      }));
    }
  };
  
  

  const handleCurrencyChange = (country) => {
    let newCurrency = 'LKR';
    let conversionRate = 1;

    if (country === 'USA' || country === 'India') {
      newCurrency = 'USD';
      conversionRate = exchangeRates['USD'] / exchangeRates['LKR'];
      setCodAvailable(false);
      setKokoAvailable(false); // Disable Koko Pay
    } else {
        // For Sri Lankan customers
        setCodAvailable(true); // Enable COD
        setKokoAvailable(true); // Enable Koko Pay
    }

    setCurrency(newCurrency);
    updatePrices(newCurrency, conversionRate);
    fetchShippingMethods(country);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    if (name === 'country') {
      handleCurrencyChange(value);
    }
  };

  const fetchShippingMethods = (country) => {
    axios.get(`https://wellworn-4.onrender.com/api/shippingMethods?country=${country}`)
      .then(response => {
        setShippingMethods(response.data);
        if (response.data.length > 0) {
          const firstMethod = response.data[0];
          setSelectedShippingMethod(firstMethod);
          setFormData(prev => ({ ...prev, shippingMethod: firstMethod.methodName }));
          const initialSubtotal = Array.isArray(checkoutData)
            ? checkoutData.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0)
            : parseFloat(checkoutData.price) * checkoutData.quantity;
          setSubtotal(initialSubtotal);
          setTotal(initialSubtotal + firstMethod.price);
        } else {
          setSelectedShippingMethod(null);
          setFormData(prev => ({ ...prev, shippingMethod: '' }));
          const initialSubtotal = Array.isArray(checkoutData)
            ? checkoutData.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0)
            : parseFloat(checkoutData.price) * checkoutData.quantity;
          setTotal(initialSubtotal);
        }
      })
      .catch(err => console.error('Failed to fetch shipping methods', err));
  };

  const handleExpandPayment = (method) => {
    if (method === 'cod' && total > 10000) {
      toast.error('Cash on Delivery is only available for orders below 10,000 LKR.');
      return;
    }
    
    setFormData(prevState => ({
      ...prevState,
      paymentMethod: method
    }));
    setExpandedPayment(method === expandedPayment ? null : method);
  };
  

  const handleCouponCodeChange = (e) => {
    setCouponCode(e.target.value);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.country) newErrors.country = 'Country is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.contactNumber) newErrors.contactNumber = 'Contact number is required';
    if (!formData.State) newErrors.State = 'State is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.postalCode) newErrors.postalCode = 'Postal code is required';
    if (!formData.shippingMethod) newErrors.shippingMethod = 'Shipping method is required';
    if (!formData.paymentMethod) newErrors.paymentMethod = 'Payment method is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedClick = async () => {
    console.log('Proceed button clicked');
    if (!validateForm()) {
        return;
    }

    setIsLoading(true);

    console.log('Form data:', formData);

    const isValid = await validateAddress(
        formData.country,
        formData.State,
        formData.city,
        formData.postalCode
    );

    console.log('Address validation result:', isValid);

    if (!isValid) {
        const validationErrorMessage = 'The address provided is invalid. Please check the details.';
        setValidationError(validationErrorMessage);
        toast.error(validationErrorMessage);
        setIsLoading(false);
        return;
    }

    console.log('Proceeding with order creation...');

    try {
        let totalAmount = subtotal + (selectedShippingMethod ? selectedShippingMethod.price : 0) + discount;

        if (currency === 'USD') {
            const conversionRate = exchangeRates['LKR'] / exchangeRates['USD'];
            totalAmount = totalAmount * conversionRate;
            console.log(`Converted USD Price to LKR: ${totalAmount}`);
        }

        const orderDate = new Date(); // Save in UTC
        const formattedOrderDate = new Intl.DateTimeFormat('en-GB', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Colombo', // For Sri Lankan time
        }).format(orderDate);
    
        const orderData = {
          ...formData,
          customerId: user?.UserId,
          items: Array.isArray(checkoutData) ? checkoutData : [checkoutData],
          couponCode,
          discount,
          total: totalAmount,
          currency: 'LKR',
          orderDate, // Save the raw UTC date in the database
        };
    
        console.log('Sending order data to server:', orderData);

        // Step 3: Validate Product Quantities and Place Order
        const validationResponse = await axios.post(`https://wellworn-4.onrender.com/api/validateAndPlaceOrder`, {
            items: Array.isArray(checkoutData) ? checkoutData : [checkoutData],
        });

        if (!validationResponse.data.success) {
            // Parse unavailable products and show detailed error messages
            validationResponse.data.unavailableProducts.forEach((product) => {
                toast.error(`Product ${product.productName}: ${product.message}`);
            });
            setIsLoading(false);
            return;
        }

        const response = await axios.post(`https://wellworn-4.onrender.com/api/addOrder`, orderData);

        console.log('Order creation response:', response.data);

        if (response.data && response.data.order && response.data.order.orderId) {
            console.log('Order ID generated successfully:', response.data.order.orderId);
        }

        toast.success("Order placed successfully");
        console.log('Checkout Data:', checkoutData); // Debugging
        const formattedCheckoutData = (Array.isArray(checkoutData) ? checkoutData : [checkoutData]).map(item => ({
          ...item,
          image: Array.isArray(item.image) ? item.image : [item.image], // Ensure image is always an array
      }));
      
      const emailDetails = {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          orderId: response.data.order.orderId,
          orderDate: formattedOrderDate, // Use the formatted date for display
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
          products: formattedCheckoutData,
          total: subtotal + (selectedShippingMethod?.price || 0) + discount,
      };
      
      console.log("Checkout Data for Email:", JSON.stringify(emailDetails, null, 2)); // Debugging

        // Send order confirmation email
        try {
          await axios.post(`${import.meta.env.VITE_BACKEND_API}/api/sendEmail`, emailDetails);
          console.log('Order confirmation email sent successfully');
        } catch (emailError) {
            console.error('Error sending confirmation email:', emailError);
            toast.error('Failed to send order confirmation email.');
        }

        // Clear cart if the checkout was initiated from the cart
        if (checkoutSource === 'cart') {
            try {
                const customerId = user?.UserId?.toString().trim();
                await axios.delete(`https://wellworn-4.onrender.com/api/cart/clear/${user?.UserId}`);
                console.log("Cart cleared successfully");
                toast.info("Cart cleared successfully!");
                refreshCart(); // Refresh the cart after clearing it
            } catch (error) {
                console.error("Error clearing cart:", error);
                toast.error("Failed to clear the cart.");
            }
        }

        setOrderDetails({
            orderId: response.data.order.orderId,
            ...formData,
            total: totalAmount,
        });
        refreshCart(); // Refresh the cart after item deletion
        setOrderPlaced(true);

        if (couponCode) {
            try {
                const deactivationResponse = await axios.post(`https://wellworn-4.onrender.com/api/deactivateCoupon`, { code: couponCode });
                toast.info('Coupon deactivated');
            } catch (deactivationError) {
                toast.error('Failed to deactivate coupon');
            }
        }
    } catch (error) {
        // Handle any unexpected errors
        console.error('Error submitting order:', error.response ? error.response.data : error.message);
        if (error.response && error.response.data && error.response.data.unavailableProducts) {
            error.response.data.unavailableProducts.forEach((product) => {
                toast.error(`Product ${product.productName}: ${product.message}`);
            });
        } else {
            toast.error('Error submitting order. Please try again.');
        }
    }

    setIsLoading(false);
};

  // const initiateKokoPayment = async (orderData) => {
  //   try {
  //     const dataString = generateDataString(orderData);
  //     const signature = generateSignature(dataString, 'YOUR_RSA_PRIVATE_KEY');

  //     const requestBody = {
  //       _mId: 'YOUR_MERCHANT_ID',
  //       api_key: 'YOUR_API_KEY',
  //       _returnUrl: `https://wellworn-4.onrender.com/returnSuccess`,
  //       _cancelUrl: `https://wellworn-4.onrender.com/returnCanceled`,
  //       _responseUrl: `https://wellworn-4.onrender.com/returnResponse`,
  //       _amount: orderData.total.toFixed(2),
  //       _currency: currency,
  //       _reference: orderData.id,
  //       _orderId: orderData.id,
  //       _pluginName: 'customapi',
  //       _pluginVersion: '1.0.1',
  //       _description: orderData.ProductName,
  //       _firstName: orderData.firstName,
  //       _lastName: orderData.lastName,
  //       _email: orderData.email,
  //       dataString: dataString,
  //       signature: signature
  //     };

  //     const response = await axios.post('https://prodapi.paykoko.com/api/merchants/orderCreate', requestBody, {
  //       headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  //     });

  //     return response.data;
  //   } catch (error) {
  //     console.error('Failed to initiate Koko payment:', error);
  //     toast.error('Failed to initiate Koko payment');
  //     return null;
  //   }
  // };

  // const handleShippingChange = (method) => {
  //   setSelectedShippingMethod(method);
  //   setFormData(prev => ({ ...prev, shippingMethod: method.methodName }));
  //   updatePrices(currency, formData.country);
  // };
  const handleShippingChange = (method) => {
    setSelectedShippingMethod(method); // Set the new shipping method
    setFormData(prev => ({ ...prev, shippingMethod: method.methodName }));
  
    // Recalculate the total based on the selected shipping method
    const updatedSubtotal = Array.isArray(checkoutData)
      ? checkoutData.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0)
      : parseFloat(checkoutData.price) * checkoutData.quantity;
  
    const newTotal = updatedSubtotal + method.price + discount;
    setTotal(newTotal); // Update total
  };
  
  const toggleAdditionalDetails = () => {
    setAdditionalDetailsExpanded(!additionalDetailsExpanded);
  };

  const countries = ['Sri Lanka', 'USA', 'India'];

  const applyCoupon = async () => {
    if (validCouponApplied) {
      toast.error('A valid coupon has already been applied.');
      return;
    }

    try {
      const response = await axios.post(`https://wellworn-4.onrender.com/api/validateCoupon`, { code: couponCode, country: formData.country });
      if (response.data) {
        const { discountType, discountValue } = response.data;
        let newDiscount = discountType === 'PERCENTAGE' ? (subtotal * discountValue / 100) : discountValue;
        setDiscount(-newDiscount);
        setTotal((prevTotal) => prevTotal - newDiscount);
        setValidCouponApplied(true);
        toast.success('Coupon applied successfully!');
      }
    } catch (error) {
      toast.error('Invalid or expired coupon');
    }
  };

  const currencySymbol = currency === 'USD' ? 'USD' : 'LKR';
  return (
    <>
      <Header />
      {loading && (
        <div className="loader-container">
          <div className="loader-overlay">
            <img src={LOGOO} alt="Logo" className="loader-logo" />
            <PropagateLoader color={'#ff3c00'} loading={true} />
          </div>
        </div>
      )}

      {!loading && (
        <div className="checkout-container">
          <div className="form-section">
            <h2>Shipping Details</h2>
            <div className="form-group country-group">
              <select name="country" value={formData.country} onChange={handleInputChange}>
                <option value="">Select Country</option>
                {countries.map((country, index) => (
                  <option key={index} value={country}>{country}</option>
                ))}
              </select>
              {errors.country && <p className="error">{errors.country}</p>}
            </div>
            <div className="form-group">
              <input type="email" name="email" placeholder='Email' value={formData.email} onChange={handleInputChange} required />
              <p className="email-notice">This email will be used to send order confirmations and tracking updates.</p>
              {errors.email && <p className="error">{errors.email}</p>}
            </div>
            <div className="form-group name-group">
              <div className="half-width">
                <input type="text" name="firstName" placeholder='First Name' value={formData.firstName} onChange={handleInputChange} required />
                {errors.firstName && <p className="error">{errors.firstName}</p>}
              </div>
              <div className="half-width">
                <input type="text" name="lastName" placeholder='Last Name' value={formData.lastName} onChange={handleInputChange} required />
                {errors.lastName && <p className="error">{errors.lastName}</p>}
              </div>
            </div>

            <div className="form-group">
              <PhoneInput
                country={'lk'}
                value={formData.contactNumber}
                onChange={contactNumber => setFormData(prevState => ({ ...prevState, contactNumber }))}
                inputProps={{
                  name: 'contactNumber',
                  required: true,
                  autoFocus: true
                }}
                containerStyle={{
                  marginTop: '-2%',
                  marginBottom: '0%',
                  width: '100%',
                }}
                inputStyle={{
                  width: 'calc(100% - 40px)',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  fontSize: '16px',
                  marginLeft: '40px',
                }}
              />
              {errors.contactNumber && <p className="error">{errors.contactNumber}</p>}
            </div>
            <div className="form-group">
              <input type="text" name="State" placeholder='State / Province' value={formData.State} onChange={handleInputChange} required />
              {errors.State && <p className="error">{errors.State}</p>}
            </div>
            <div className="form-group">
              <input type="text" name="address" placeholder='Address' value={formData.address} onChange={handleInputChange} required />
              {errors.address && <p className="error">{errors.address}</p>}
            </div>
            <div className="form-group">
              <input type="text" name="address02" placeholder='Address-line 02 (Apartment,suite,etc.)' value={formData.address2} onChange={handleInputChange} />
            </div>
            <div className="form-group name-group">
              <div className="half-width">
                <input type="text" name="city" placeholder='City' value={formData.city} onChange={handleInputChange} required />
                {errors.city && <p className="error">{errors.city}</p>}
              </div>
              <div className="half-width">
                <input type="text" name="postalCode" placeholder='Postal Code' value={formData.postalCode} onChange={handleInputChange} required />
                {errors.postalCode && <p className="error">{errors.postalCode}</p>}
              </div>
            </div>
            <div className="additional-details">
              <button onClick={toggleAdditionalDetails} className="details-button">+</button>
              <span>Add Additional Details</span>
            </div>
            {additionalDetailsExpanded && (
              <div className="form-group">
                <textarea
                  name="additionalDetails"
                  placeholder="Additional Details"
                  value={formData.additionalDetails}
                  onChange={handleInputChange}
                ></textarea>
              </div>
            )}
            <hr />
            <h2 className="section-title">Shipping Method</h2>
            <div className="shipping-method">
              {shippingMethods.map(method => (
                <div className="method" key={method._id}>
                  <input type="radio"
                    id={method._id}
                    name="shippingMethod"
                    checked={formData.shippingMethod === method.methodName}
                    onChange={() => handleShippingChange(method)}
                    required />
                  <label htmlFor={method._id}>{method.methodName} - {currencySymbol} {method.price.toFixed(2)}</label>
                </div>
              ))}
              {errors.shippingMethod && <p className="error">{errors.shippingMethod}</p>}
            </div>
            <h2 className="section-title">Payment Method</h2>
{kokoAvailable && (
    <div className={`payment-method ${expandedPayment === 'koko' ? 'expanded' : ''}`} onClick={() => handleExpandPayment('koko')}>
        <div className="method-title">
            <input
                type="radio"
                id="koko"
                name="paymentMethod"
                checked={formData.paymentMethod === 'koko'}
                onChange={() => handleExpandPayment('koko')}
                required
            />
            <label htmlFor="koko">Koko | Buy Now Pay Later</label>
        </div>
        <div className="expand-content">
            <img src={koko} alt="Product" />
            <p>Upon selecting Proceed, you will be directed to Koko: Buy Now Pay Later to securely finalize your purchase.</p>
        </div>
    </div>
)}

<div className={`payment-method ${expandedPayment === 'webxpay' ? 'expanded' : ''}`} onClick={() => handleExpandPayment('webxpay')}>
    <div className="method-title">
        <input
            type="radio"
            id="webxpay"
            name="paymentMethod"
            checked={formData.paymentMethod === 'webxpay'}
            onChange={() => handleExpandPayment('webxpay')}
            required
        />
        <label htmlFor="webxpay">WEBXPAY</label>
    </div>
    <div className="expand-content">
        <img src={Webxpay} alt="Product" style={{ height: '150px', width: '400px' }} />
        <p>Upon selecting Proceed, you will be redirected to WEBXPAY for a secure completion of your purchase.</p>
    </div>
</div>

{codAvailable && (
    <div className={`payment-method ${expandedPayment === 'cod' ? 'expanded' : ''}`} onClick={() => handleExpandPayment('cod')}>
        <div className="method-title">
            <input
                type="radio"
                id="cod"
                name="paymentMethod"
                checked={formData.paymentMethod === 'cod'}
                onChange={() => handleExpandPayment('cod')}
                required
            />
            <label htmlFor="cod">Cash on Delivery</label>
        </div>
        <div className="expand-content">
            <img src={cod} alt="Product" style={{ height: '150px', width: '400px' }} />
            <p>Pay with cash upon delivery of your order.</p>
        </div>
    </div>
)}


            {errors.paymentMethod && <p className="error">{errors.paymentMethod}</p>}
            <div className="coupon-code">
              <h2 className="section-title">Coupon Code/Gift Card</h2>
              <div className="form-group">
                <label>Coupon Code:</label>
                <input type="text" value={couponCode} onChange={handleCouponCodeChange} />
              </div>
              <div className="form-group">
                <button className="apply-btn" onClick={applyCoupon}>Apply</button>
              </div>
            </div>
          </div>

          <div className="order-summary" id="order-summary">
            <h2>Order Summary</h2>
            {(Array.isArray(checkoutData) ? checkoutData : [checkoutData]).map((item, index) => (
              <div key={index} className="product-summary">
<div className="product-image-container">
  <img src={item.image} alt={item.ProductName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  <div className="quantity-badge">{item.quantity}</div>
</div>
                <div className="product-details">
                  <div className="title-and-price">
                    <h2  className="title-and-priceee" >{item.ProductName}</h2>
                    <span className="price"> {parseFloat(item.price).toFixed(2)}</span>
                  </div>
                  <div className="attributes">
                    <span className="size">{item.size}</span>
                    <span className="color">{item.color}</span>
                  </div>
                  <div className="subtotal">
                    <span>Subtotal</span>
                    <span>{currencySymbol} {(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
            <div className="order-costs">
              <p><span>Shipping:</span> <span className="right-align">{currencySymbol} {selectedShippingMethod ? selectedShippingMethod.price.toFixed(2) : '0.00'}</span></p>
              <p><span>Discount:</span> <span className="right-align">{currencySymbol} {discount.toFixed(2)}</span></p>
              <p><span>Total:</span> <span className="right-align">{currencySymbol} {total.toFixed(2)}</span></p>
            </div>
            <div className='error'></div>
            <button className='proceed-btn' onClick={handleProceedClick} disabled={isLoading || orderPlaced}>
              {isLoading ? "Processing..." : "Proceed"}
            </button>
            
            {orderPlaced && (
              <OrderConfirmationModal
                isOpen={orderPlaced}
                orderDetails={orderDetails}
                checkoutSource={checkoutSource}
                onContinue={handleContinueShopping}
                onDownload={handleDownloadPDF}
            />
            )}
          </div>
        </div>
      )}
      <Footer />
      <ToastContainer />
    </>
  );
}

export default Checkout;
