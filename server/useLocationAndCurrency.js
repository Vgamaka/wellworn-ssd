// import { useState, useEffect } from 'react';
// import axios from 'axios';

// export const useLocationAndCurrency = () => {
//   const [userLocation, setUserLocation] = useState('');
//   const [exchangeRate, setExchangeRate] = useState(1);
//   const cacheExpiry = 2 * 60 * 1000; // 2 minutes in milliseconds
//   const fetchUserLocation = async () => {
//     const cachedLocation = localStorage.getItem('userLocation');
//     const cachedTimestamp = localStorage.getItem('locationTimestamp');
  
//     if (!cachedLocation || !cachedTimestamp || Date.now() - cachedTimestamp >= cacheExpiry) {
//       try {
//         console.log('Fetching user location from server...');
//         const response = await axios.get('http://localhost:3001/get-user-location');
//         console.log('Server Response:', response.data);
//         const location = response.data.country_name || 'Unknown';
//         console.log('Fetched Location:', location);
//         setUserLocation(location);
//         localStorage.setItem('userLocation', location);
//         localStorage.setItem('locationTimestamp', Date.now());
//       } catch (error) {
//         console.error('Error fetching user location:', error.message);
//         setUserLocation('Other'); // Fallback location
//       }
//     } else {
//       console.log('Using cached user location...');
//       setUserLocation(cachedLocation);
//     }
//   };
  
  
//   // Fetch the exchange rate (LKR to USD)
//   const fetchExchangeRate = async () => {
//     const cachedRate = localStorage.getItem('exchangeRate');
//     const cachedRateTimestamp = localStorage.getItem('exchangeRateTimestamp');

//     console.log('Cached Exchange Rate:', cachedRate);
//     console.log('Cached Rate Timestamp:', cachedRateTimestamp);
//     console.log(
//       'Cache Valid:',
//       cachedRateTimestamp && Date.now() - cachedRateTimestamp < cacheExpiry
//     );

//     if (!cachedRate || !cachedRateTimestamp || Date.now() - cachedRateTimestamp >= cacheExpiry) {
//       try {
//         console.log('Fetching exchange rate...');
//         const response = await axios.get('https://api.exchangerate-api.com/v4/latest/LKR'); // Base currency is LKR
//         const rate = response.data.rates.USD; // Convert LKR to USD
//         console.log('Fetched Exchange Rate (LKR to USD):', rate);
//         setExchangeRate(rate);
//         localStorage.setItem('exchangeRate', rate);
//         localStorage.setItem('exchangeRateTimestamp', Date.now());
//       } catch (error) {
//         console.error('Error fetching exchange rate:', error);
//       }
//     } else {
//       console.log('Using cached exchange rate...');
//       setExchangeRate(parseFloat(cachedRate));
//     }
//   };

//   // Clear the cache and refetch location and exchange rate
//   const clearCache = () => {
//     console.log('Clearing Cache...');
//     localStorage.removeItem('userLocation');
//     localStorage.removeItem('locationTimestamp');
//     localStorage.removeItem('exchangeRate');
//     localStorage.removeItem('exchangeRateTimestamp');
//     console.log('Cache Cleared. Fetching Fresh Data...');
//     fetchUserLocation(); // Force refresh location
//     fetchExchangeRate(); // Force refresh exchange rate
//   };

//   // Initial fetch for location and exchange rate
//   useEffect(() => {
//     fetchUserLocation();
//   }, []);

//   useEffect(() => {
//     fetchExchangeRate();
//   }, []);

//   return { userLocation, exchangeRate, clearCache };
// };
