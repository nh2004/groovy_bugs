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
  // `cart` state will now store items in the grouped format (product ID, quantity, size, etc.)
  // Each item in this array represents a unique product (by _id + size) and its total quantity.
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper to find an item in the cart state by product _id and size
  const findCartItemIndex = useCallback((productId, size) => {
    return cart.findIndex(item =>
      (item.product === productId) && // 'product' field is the actual product _id
      (item.size === size || (!item.size && !size))
    );
  }, [cart]);


  // Memoized function to load cart from API
  const loadCartFromAPI = useCallback(async () => {
    if (!userId) {
      // console.log("Skipping API cart load: userId not available.");
      return;
    }
    try {
      setLoading(true);
      const cartData = await cartAPI.getCart(userId);
      // Backend returns items as they are in the schema (with product, quantity, size etc.)
      // Map it to include a client-side `cartId` for display uniqueness if needed,
      // but the core state will be what the backend provides.
      const transformedCart = cartData.items.map(item => ({
        ...item,
        cartId: item.product + (item.size || '') // Simple client-side ID for list keys etc.
      }));
      setCart(transformedCart || []);
      // console.log("Cart loaded from API:", transformedCart);
    } catch (error) {
      console.error('Error loading cart from API:', error);
      loadCartFromLocalStorage(); // Fallback to localStorage on API error
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Memoized function to sync cart to API
  const syncCartToAPI = useCallback(async (currentCart) => {
    if (isSignedIn && userId) {
      try {
        // Prepare cart data for backend: remove client-side `cartId`
        const cartDataToSend = currentCart.map(({ cartId, ...rest }) => rest);
        await cartAPI.updateCart(userId, cartDataToSend);
        // console.log("Cart synced to API:", cartDataToSend);
      } catch (error) {
        console.error('Error syncing cart to API:', error);
        toast.error("Failed to sync cart to server. Please try again.");
      }
    }
  }, [isSignedIn, userId]);

  // Function to load cart from localStorage
  const loadCartFromLocalStorage = useCallback(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      // Ensure localStorage cart items also have a client-side `cartId` for consistency
      const transformedCart = parsedCart.map(item => ({
        ...item,
        cartId: item.product + (item.size || '')
      }));
      setCart(transformedCart);
      // console.log("Cart loaded from localStorage:", transformedCart);
    }
  }, []);

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
    if (!isSignedIn) {
      // For localStorage, store the backend-compatible format
      const cartDataToStore = cart.map(({ cartId, ...rest }) => rest);
      localStorage.setItem('cart', JSON.stringify(cartDataToStore));
      // console.log("Cart saved to localStorage (guest):", cartDataToStore);
    }
  }, [cart, isSignedIn]);


  const addToCart = async (productToAdd) => {
    if (!isLoaded) {
      toast.error("Authentication not loaded yet. Please wait.");
      return;
    }

    // Backend expects 'product' to be the _id.
    const productId = productToAdd._id || productToAdd.id;
    const itemSize = productToAdd.size;

    const existingItemIndex = findCartItemIndex(productId, itemSize);
    let updatedCart;

    if (existingItemIndex > -1) {
      // Item already in cart, increment quantity
      updatedCart = cart.map((item, index) =>
        index === existingItemIndex
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      toast.success(`Increased quantity of ${productToAdd.name} in cart!`);
    } else {
      // Item not in cart, add new
      const newItem = {
        product: productId, // CRITICAL: This matches your backend schema's `product` field
        name: productToAdd.name, // Display data (not saved to backend by reference, but useful for frontend)
        price: productToAdd.price, // Display data
        image: productToAdd.image, // Display data
        size: itemSize,
        quantity: 1, // Start with quantity 1
        cartId: productId + (itemSize || '') // Client-side ID for mapping/keys
      };
      updatedCart = [...cart, newItem];
      toast.success(`${productToAdd.name} added to cart!`);
    }

    setCart(updatedCart); // Optimistic update
    await syncCartToAPI(updatedCart);
  };

  // removeFromCart now removes an entire grouped item from the cart
  const removeFromCart = async (productId, size = undefined) => { // Accepts product ID and optional size
    const newCart = cart.filter(item =>
      !(item.product === productId && (item.size === size || (!item.size && !size)))
    );
    setCart(newCart);
    toast.info("Item removed from cart.");
    await syncCartToAPI(newCart);
  };

  // updateQuantity modifies the quantity of an existing grouped item
  const updateQuantity = async (productId, size = undefined, change) => {
    const existingItemIndex = findCartItemIndex(productId, size);

    if (existingItemIndex === -1) {
      console.warn("Attempted to update quantity for a non-existent item in cart:", productId, size);
      return;
    }

    let updatedCart;
    const currentQuantity = cart[existingItemIndex].quantity;

    if (change > 0) {
      updatedCart = cart.map((item, index) =>
        index === existingItemIndex
          ? { ...item, quantity: item.quantity + change }
          : item
      );
    } else { // change < 0 (decrement)
      if (currentQuantity + change <= 0) { // If quantity becomes 0 or less, remove item
        updatedCart = cart.filter((item, index) => index !== existingItemIndex);
        toast.info("Item quantity reduced to zero and removed.");
      } else {
        updatedCart = cart.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + change }
            : item
        );
      }
    }

    setCart(updatedCart); // Optimistic update
    await syncCartToAPI(updatedCart);
  };

  const clearCart = async () => {
    setCart([]);
    toast.info("Cart cleared!");
    await syncCartToAPI([]);
  };

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + (parseFloat(item.price) || 0) * (item.quantity || 0), 0);
  }, [cart]);

  const getCartCount = useCallback(() => {
    return cart.reduce((total, item) => total + (item.quantity || 0), 0);
  }, [cart]);

  // `getGroupedCart` is now effectively the `cart` state itself.
  // We keep it for consistency with how other components might expect a "grouped" view,
  // but it's now just returning the `cart` state directly after potentially adding `cartId` for display.
  const getGroupedCart = useCallback(() => {
    return cart.map(item => ({
      ...item,
      // For components that use `_id` or `id` for product identification, copy `item.product` to it.
      _id: item.product,
      id: item.product,
      // The `items` array is no longer needed in this approach since `quantity` is explicit.
      // If you need it for some specific reason, you'd have to regenerate it based on quantity.
      // For now, removing it simplifies the model.
      items: Array(item.quantity).fill({ product: item.product, size: item.size, cartId: item.cartId }) // Dummy array for backward compatibility if needed by specific components
    }));
  }, [cart]);


  const value = {
    cart, // The primary cart state, now holding grouped items with explicit quantities
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    getGroupedCart, // Still returns the grouped view (which is now `cart` with product _id copied)
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};