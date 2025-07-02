import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useParams, Link, useLocation, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, useAuth, useUser } from "@clerk/clerk-react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProductList from "./components/ProductList";
import Footer from "./components/Footer";
import CartPage from "./components/CartPage";
import CartSidebar from "./components/CartSidebar";
import ProductDetails from "./components/ProductDetails";
import ShopPage from "./components/ShopPage";
import HeroSlider from "./components/HeroSlider";
import ProductSlider from "./components/ProductSlider";
import CollectionsPage from "./components/CollectionsPage";
import PostersPage from "./components/PostersPage";
import ToteBagsPage from "./components/ToteBagsPage";
import TeesPage from "./components/TeesPage";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import UserProfile from "./components/UserProfile";
import InfoCards from "./components/InfoCards";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();
  
  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-white text-xl">Loading...</div>
    </div>;
  }
  
  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }
  
  return children;
};

function AppContent() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const location = useLocation();
  const isAuthPage = location.pathname === "/sign-in" || location.pathname === "/sign-up";

  return (
    <ProductProvider>
      <CartProvider>
        <div className={`min-h-screen ${isAuthPage ? "login-bg" : "bg-main-bg"}`}>
          <div className="grain-overlay"></div>
          <ToastContainer 
            position="top-right" 
            autoClose={3000} 
            hideProgressBar={false} 
            newestOnTop={false} 
            closeOnClick 
            rtl={false} 
            pauseOnFocusLoss 
            draggable 
            pauseOnHover 
            theme="dark"
          />
          
          {!isAuthPage && <Navbar />}
          
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <HeroSlider />
                  <h2 className="section-title">Featured Products</h2>
                  <ProductSlider />
                  <InfoCards />
                </>
              }
            />
            <Route path="/shop" element={<CollectionsPage />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/posters" element={<PostersPage />} />
            <Route path="/tote-bags" element={<ToteBagsPage />} />
            <Route path="/tees" element={<TeesPage />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              }
            />
          </Routes>
          
          {!isAuthPage && <Footer />}
        </div>
      </CartProvider>
    </ProductProvider>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}