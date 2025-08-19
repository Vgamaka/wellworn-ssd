import React, { createContext, useContext, useState } from 'react';

const CheckoutContext = createContext();

export const useCheckout = () => useContext(CheckoutContext);

export const CheckoutProvider = ({ children }) => {
  const [checkoutData, setCheckoutData] = useState(null); 
  const [checkoutSource, setCheckoutSource] = useState(null); // Track source of checkout

  const setCheckoutInfo = (data, source) => {
    console.log("Setting checkout data:", data);
    setCheckoutData(data);
    setCheckoutSource(source); // Set source (e.g., 'cart' or 'product')
  };

  return (
    <CheckoutContext.Provider value={{ checkoutData, checkoutSource, setCheckoutInfo }}>
      {children}
    </CheckoutContext.Provider>
  );
};
