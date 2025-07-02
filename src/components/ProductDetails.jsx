import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { useCart } from "../context/CartContext";

const posterSizes = [
  { value: "A5", label: "A5 - 17 Posters" },
  { value: "A4", label: "A4 - 17 Posters" },
  { value: "A3", label: "A3 - 17 Posters" }
];

const ProductDetails = () => {
  const { id } = useParams();
  const { getProductById } = useProducts();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState(posterSizes[0].value);

  const product = getProductById(id);

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-96 text-white text-xl bg-main-bg">
        <div className="text-center">
          <p className="font-mono text-2xl mb-4">Product not found.</p>
          <button className="bg-main-purple text-white border-none rounded-2xl py-3 px-6 font-mono font-bold hover:bg-purple-600 transition-colors duration-200">
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const isPoster = product.category && product.category.toLowerCase().includes("poster");

  const handleAddToCart = () => {
    addToCart({ 
      ...product, 
      quantity, 
      size: isPoster ? size : undefined,
      cartId: Date.now() 
    });
  };

  return (
    <section className="bg-main-bg min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Product Image */}
          <div className="flex items-center justify-center">
            <div className="relative max-w-lg w-full">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-auto object-contain bg-gray-800 rounded-2xl border-4 border-gray-700 shadow-2xl"
                style={{ aspectRatio: '4/5' }}
              />
              {product.featured && (
                <span className="absolute top-4 left-4 bg-main-purple text-white text-sm font-bold py-2 px-4 rounded-lg tracking-wide font-mono">
                  FEATURED
                </span>
              )}
            </div>
          </div>
          
          {/* Product Info */}
          <div className="text-white space-y-6">
            <div>
              <h1 className="font-black text-5xl font-mono text-white mb-4 tracking-wide uppercase">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-white font-mono">
                  ₹{product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-400 line-through font-mono">
                    ₹{product.originalPrice}
                  </span>
                )}
              </div>
            </div>
            
            <div className="text-lg text-gray-300 leading-relaxed font-mono">
              {product.description}
            </div>
            
            {/* Size Selection for Posters */}
            {isPoster && (
              <div className="space-y-3">
                <label htmlFor="size-select" className="block text-white font-medium font-mono text-lg">
                  Size
                </label>
                <select
                  id="size-select"
                  value={size}
                  onChange={e => setSize(e.target.value)}
                  className="w-full py-3 px-4 rounded-lg border-2 border-main-purple bg-gray-800 text-white text-base font-mono focus:border-purple-400 focus:outline-none"
                >
                  {posterSizes.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Quantity Selection */}
            <div className="space-y-3">
              <label htmlFor="quantity-input" className="block text-white font-medium font-mono text-lg">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                  className="bg-main-purple text-white border-none rounded-lg w-12 h-12 text-xl font-bold cursor-pointer transition-colors duration-200 flex items-center justify-center hover:bg-purple-600 font-mono"
                >
                  -
                </button>
                <input
                  id="quantity-input"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-20 text-center text-lg border-2 border-main-purple rounded-lg bg-gray-800 text-white py-3 px-2 font-mono focus:border-purple-400 focus:outline-none"
                />
                <button 
                  onClick={() => setQuantity(q => q + 1)} 
                  className="bg-main-purple text-white border-none rounded-lg w-12 h-12 text-xl font-bold cursor-pointer transition-colors duration-200 flex items-center justify-center hover:bg-purple-600 font-mono"
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Add to Cart Button */}
            <button 
              className="bg-accent-pink text-white border-none rounded-2xl py-4 px-12 text-xl font-bold cursor-pointer transition-all duration-200 hover:bg-pink-600 hover:transform hover:scale-105 font-mono tracking-wider uppercase shadow-lg"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
            
            {/* Product Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8 border-t border-gray-700">
              <div className="text-center p-4 bg-gray-900 rounded-lg">
                <h4 className="font-bold text-white mb-2 font-mono">Free Shipping</h4>
                <p className="text-sm text-gray-400 font-mono">On orders over ₹1500</p>
              </div>
              <div className="text-center p-4 bg-gray-900 rounded-lg">
                <h4 className="font-bold text-white mb-2 font-mono">Premium Quality</h4>
                <p className="text-sm text-gray-400 font-mono">300gsm matte finish</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetails;