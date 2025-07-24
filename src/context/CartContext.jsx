import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { cartAPI } from '../services/api';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const { isSignedIn, userId, isLoaded } = useAuth();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);

    // Helper to find an item in the cart state by product _id and size
    const findCartItemIndex = useCallback((productId, size) => {
        return cart.findIndex(item =>
            (item.product === productId) &&
            (item.size === size || (!item.size && !size))
        );
    }, [cart]);

    // --- FIX START ---
    // Declare loadCartFromLocalStorage BEFORE loadCartFromAPI
    // Function to load cart from localStorage
    const loadCartFromLocalStorage = useCallback(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            const transformedCart = parsedCart.map(item => ({
                ...item,
                cartId: item.product + (item.size || '')
            }));
            setCart(transformedCart);
            // console.log("Cart loaded from localStorage:", transformedCart);
        } else {
            setCart([]); // Ensure cart is empty if nothing in localStorage
        }
    }, []);

    // Memoized function to load cart from API
    const loadCartFromAPI = useCallback(async () => {
        if (!userId) {
            // console.log("Skipping API cart load: userId not available.");
            return;
        }
        try {
            setLoading(true);
            const cartData = await cartAPI.getCart(userId);
            const transformedCart = cartData.items.map(item => ({
                product: item.product,
                name: item.name,
                price: item.price,
                image: item.image,
                quantity: item.quantity,
                size: item.size,
                cartId: item.product + (item.size || '')
            }));
            setCart(transformedCart || []);
            // console.log("Cart loaded from API:", transformedCart);
        } catch (error) {
            console.error('Error loading cart from API:', error);
            toast.error("Failed to load cart from server. Using local cart if available.", { theme: "dark" });
            loadCartFromLocalStorage(); // Fallback to localStorage on API error
        } finally {
            setLoading(false);
        }
    }, [userId, loadCartFromLocalStorage]); // Add loadCartFromLocalStorage to dependencies
    // --- FIX END ---


    // Memoized function to sync cart to API
    const syncCartToAPI = useCallback(async (currentCart) => {
        if (isSignedIn && userId) {
            try {
                const cartDataToSend = currentCart.map(item => ({
                    product: item.product,
                    quantity: item.quantity,
                    size: item.size,
                    name: item.name,
                    price: item.price,
                    image: item.image,
                }));
                await cartAPI.updateCart(userId, cartDataToSend);
                // console.log("Cart synced to API:", cartDataToSend);
            } catch (error) {
                console.error('Error syncing cart to API:', error);
                toast.error("Failed to sync cart to server. Please try again.", { theme: "dark" });
            }
        }
    }, [isSignedIn, userId]);

    // Effect to load cart on sign-in/out or initial load
    useEffect(() => {
        if (isLoaded) {
            if (isSignedIn && userId) {
                loadCartFromAPI(); // Signed in: API is primary
            } else {
                loadCartFromLocalStorage(); // Signed out: localStorage is primary
            }
        }
    }, [isSignedIn, userId, isLoaded, loadCartFromAPI, loadCartFromLocalStorage]);

    // Effect to save cart to localStorage for guest users
    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            const cartDataToStore = cart.map(({ cartId, ...rest }) => rest);
            localStorage.setItem('cart', JSON.stringify(cartDataToStore));
            // console.log("Cart saved to localStorage (guest):", cartDataToStore);
        }
    }, [cart, isSignedIn, isLoaded]);


    const addToCart = async (productToAdd, quantityToAdd = 1) => {
        if (!isLoaded) {
            toast.error("Authentication not loaded yet. Please wait.", { theme: "dark" });
            return;
        }

        const productId = productToAdd._id || productToAdd.id;
        const itemSize = productToAdd.size;

        const existingItemIndex = findCartItemIndex(productId, itemSize);
        let updatedCart;

        if (existingItemIndex > -1) {
            updatedCart = cart.map((item, index) =>
                index === existingItemIndex
                    ? { ...item, quantity: item.quantity + quantityToAdd }
                    : item
            );
            toast.success(`Increased quantity of ${productToAdd.name} in cart!`, { theme: "dark" });
        } else {
            const newItem = {
                product: productId,
                name: productToAdd.name,
                price: productToAdd.price,
                image: productToAdd.image,
                size: itemSize,
                quantity: quantityToAdd,
                cartId: productId + (itemSize || '')
            };
            updatedCart = [...cart, newItem];
            toast.success(`${productToAdd.name} added to cart!`, { theme: "dark" });
        }

        setCart(updatedCart);
        await syncCartToAPI(updatedCart);
    };

    const removeFromCart = async (productId, size = undefined) => {
        const newCart = cart.filter(item =>
            !(item.product === productId && (item.size === size || (!item.size && !size)))
        );
        setCart(newCart);
        toast.info("Item removed from cart.", { theme: "dark" });
        await syncCartToAPI(newCart);
    };

    const updateQuantity = async (productId, size = undefined, change) => {
        const existingItemIndex = findCartItemIndex(productId, size);

        if (existingItemIndex === -1) {
            console.warn("Attempted to update quantity for a non-existent item in cart:", productId, size);
            return;
        }

        let updatedCart;
        const currentQuantity = cart[existingItemIndex].quantity;

        if (currentQuantity + change <= 0) {
            updatedCart = cart.filter((item, index) => index !== existingItemIndex);
            toast.info("Item quantity reduced to zero and removed.", { theme: "dark" });
        } else {
            updatedCart = cart.map((item, index) =>
                index === existingItemIndex
                    ? { ...item, quantity: item.quantity + change }
                    : item
            );
        }

        setCart(updatedCart);
        await syncCartToAPI(updatedCart);
    };

    const clearCart = async () => {
        setCart([]);
        toast.info("Cart cleared!", { theme: "dark" });
        await syncCartToAPI([]);
    };

    const getCartTotal = useCallback(() => {
        return cart.reduce((total, item) => total + (parseFloat(item.price) || 0) * (item.quantity || 0), 0);
    }, [cart]);

    const getCartCount = useCallback(() => {
        return cart.reduce((total, item) => total + (item.quantity || 0), 0);
    }, [cart]);

    const getGroupedCart = useCallback(() => {
        return cart.map(item => ({
            ...item,
            _id: item.product,
            id: item.product,
        }));
    }, [cart]);


    const value = {
        cart,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        getGroupedCart,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};