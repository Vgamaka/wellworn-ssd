import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CurrencyContext = createContext();

const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const getCachedData = (key) => {
  const cachedData = localStorage.getItem(key);
  const cachedTimestamp = localStorage.getItem(`${key}_timestamp`);
  if (cachedData && cachedTimestamp && Date.now() - cachedTimestamp < CACHE_EXPIRY) {
    return JSON.parse(cachedData);
  }
  return null;
};

const setCachedData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
  localStorage.setItem(`${key}_timestamp`, Date.now());
};

export const CurrencyProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState('Sri Lanka');
  const [currency, setCurrency] = useState('LKR');
  const [exchangeRate, setExchangeRate] = useState(1);

const initializeCurrency = async (bypassCache = false) => {
  console.log("Initializing currency...");
  if (!bypassCache) {
    const cachedLocation = getCachedData('userLocation');
    const cachedCurrency = getCachedData('currency');
    const cachedRate = getCachedData('exchangeRate');

    console.log("Cached location:", cachedLocation);
    console.log("Cached currency:", cachedCurrency);
    console.log("Cached exchange rate:", cachedRate);

    if (cachedLocation && cachedCurrency && cachedRate) {
      setUserLocation(cachedLocation);
      setCurrency(cachedCurrency);
      setExchangeRate(cachedRate);
      return;
    }
  }

  try {
    console.log("Fetching location data...");
    const locationResponse = await axios.get(
      'https://wellworn-4.onrender.com/api/get-user-location?bypassCache=true'
    );    console.log("API call made to /api/get-user-location");

    const location = locationResponse.data.country_name || 'Sri Lanka';
    if (location !== 'Sri Lanka') {
      console.log("Fetching exchange rate...");
      const rateResponse = await axios.get(
        'https://wellworn-4.onrender.com/api/get-exchange-rate?bypassCache=true'
      );      console.log("API call made to /api/get-exchange-rate");

      const rate = rateResponse.data.rate || 1;
      setCurrency('USD');
      setExchangeRate(rate);
      setCachedData('exchangeRate', rate);
      setCachedData('currency', 'USD');
    } else {
      setCurrency('LKR');
      setExchangeRate(1);
      setCachedData('currency', 'LKR');
    }

    setUserLocation(location);
    setCachedData('userLocation', location);
  } catch (error) {
    console.error('Error initializing currency:', error);
  }
};

  
  useEffect(() => {
    initializeCurrency(); // Initialize on component mount
  }, []);



  const clearCacheAndRefresh = () => {
    localStorage.removeItem('userLocation');
    localStorage.removeItem('userLocation_timestamp');
    localStorage.removeItem('currency');
    localStorage.removeItem('currency_timestamp');
    localStorage.removeItem('exchangeRate');
    localStorage.removeItem('exchangeRate_timestamp');
    initializeCurrency(true); // Force refresh
  };

  return (
    <CurrencyContext.Provider value={{ userLocation, currency, exchangeRate, clearCacheAndRefresh }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
