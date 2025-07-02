import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load cart from localStorage or API when user signs in
  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && userId) {
        loadCartFromAPI();
      } else {
        loadCartFromLocalStorage();
      }
    }
  }, [isSignedIn, userId, isLoaded]);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    if (!isSignedIn) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isSignedIn]);

  const loadCartFromLocalStorage = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const loadCartFromAPI = async () => {
    try {
      setLoading(true);
      const cartData = await cartAPI.getCart(userId);
      setCart(cartData.items || []);
    } catch (error) {
      console.error('Error loading cart:', error);
      loadCartFromLocalStorage(); // Fallback to localStorage
    } finally {
      setLoading(false);
    }
  };

  const syncCartToAPI = async (newCart) => {
    if (isSignedIn && userId) {
      try {
        await cartAPI.updateCart(userId, newCart);
      } catch (error) {
        console.error('Error syncing cart to API:', error);
      }
    }
  };

  const addToCart = async (product) => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      toast.error("Please Sign In first!");
      return;
    }

    const newCart = [...cart, { ...product, cartId: Date.now() }];
    setCart(newCart);
    setIsCartOpen(true);
    toast.success("Product added to cart!");
    
    await syncCartToAPI(newCart);
  };

  const removeFromCart = async (cartId) => {
    const newCart = cart.filter(item => item.cartId !== cartId);
    setCart(newCart);
    await syncCartToAPI(newCart);
  };

  const updateQuantity = async (cartId, change) => {
    if (change > 0) {
      // Add one more of the same product
      const productToAdd = cart.find(item => item.cartId === cartId);
      if (productToAdd) {
        const newCart = [...cart, { ...productToAdd, cartId: Date.now() }];
        setCart(newCart);
        await syncCartToAPI(newCart);
      }
    } else {
      // Remove one occurrence
      const itemIndex = cart.findIndex(item => item.cartId === cartId);
      if (itemIndex !== -1) {
        const newCart = [...cart.slice(0, itemIndex), ...cart.slice(itemIndex + 1)];
        setCart(newCart);
        await syncCartToAPI(newCart);
      }
    }
  };

  const clearCart = async () => {
    setCart([]);
    await syncCartToAPI([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price || 0), 0);
  };

  const getCartCount = () => {
    return cart.length;
  };

  const getGroupedCart = () => {
    const grouped = cart.reduce((acc, item) => {
      const key = `${item._id || item.id}-${item.size || 'default'}`;
      if (!acc[key]) {
        acc[key] = { ...item, quantity: 0, items: [] };
      }
      acc[key].quantity++;
      acc[key].items.push(item);
      return acc;
    }, {});
    return Object.values(grouped);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const value = {
    cart,
    isCartOpen,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    getGroupedCart,
    toggleCart,
    setIsCartOpen
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};