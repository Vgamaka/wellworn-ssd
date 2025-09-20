import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuthStore } from '../src/store/useAuthStore';
import { toast } from 'react-toastify';

const apiUrl = import.meta.env.VITE_BACKEND_API;
const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore();

    // Function to fetch cart items from the backend
    const fetchCartItems = useCallback(async () => {
        if (!user?.UserId) {
            console.error("UserId is undefined");
            setCartItems([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/api/cart/${user.UserId}`);
            const items = response.data || []; // Default to an empty array if no data
            setCartItems(items); // Update the state with the fetched items
        } catch (error) {
            console.error('Failed to fetch cart items:', error);
            setCartItems([]); // Ensure the cart is empty on error
        } finally {
            setLoading(false);
        }
    }, [user?.UserId]);

    // Automatically fetch cart items when the user logs in or the context mounts
    useEffect(() => {
        fetchCartItems();
    }, [fetchCartItems]);

    const refreshCart = async () => {
        if (!user?.UserId) {
            setCartItems([]); // Clear cart items if user is not logged in
            return;
        }
    
        try {
            const response = await axios.get(`${apiUrl}/api/cart/${user.UserId}`);
            const items = response.data || []; // Ensure it defaults to an empty array
            setCartItems(items);
        } catch (error) {
            if (error.response?.status === 404) {
                console.warn('Cart is empty or user ID is invalid');
                setCartItems([]); // Clear cart items on 404
            } else {
                console.error('Failed to refresh cart:', error);
                toast.error('Failed to refresh cart items.');
            }
        }
    };
    return (
        <CartContext.Provider value={{ cartItems, loading, refreshCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
