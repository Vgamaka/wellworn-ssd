// cacheUtils.js

import axios from 'axios';

const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const getCachedData = (key) => {
  const cachedData = localStorage.getItem(key);
  const cachedTimestamp = localStorage.getItem(`${key}_timestamp`);
  if (cachedData && cachedTimestamp && Date.now() - cachedTimestamp < CACHE_EXPIRY) {
    return JSON.parse(cachedData);
  }
  return null;
};

export const setCachedData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
  localStorage.setItem(`${key}_timestamp`, Date.now());
};

export const fetchLocation = async () => {
  const cachedLocation = getCachedData('userLocation');
  if (cachedLocation) return cachedLocation;

  try {
    const response = await axios.get('https://ipapi.co/json/');
    const locationData = response.data.country_name;
    setCachedData('userLocation', locationData);
    return locationData;
  } catch (error) {
    console.error('Error fetching user location:', error);
    throw error;
  }
};

export const fetchExchangeRate = async () => {
  const cachedRate = getCachedData('exchangeRate');
  if (cachedRate) return cachedRate;

  try {
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
    const exchangeRate = response.data.rates.LKR;
    setCachedData('exchangeRate', exchangeRate);
    return exchangeRate;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    throw error;
  }
};
