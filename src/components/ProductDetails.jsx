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
      <div className="flex items-center justify-center min-h-96 text-white text-xl">
        Product not found.
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
    <section className="flex flex-row items-center justify-center gap-16 bg-transparent rounded-none py-10 px-8 max-w-6xl mx-auto my-8 shadow-none animate-fade-in">
      <div className="flex-1 flex items-center justify-center min-w-80 max-w-130">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full max-w-130 h-auto object-contain bg-gray-800 block mx-auto shadow-none border-6 border-gray-100 shadow-sm"
          style={{ aspectRatio: '4/5' }}
        />
      </div>
      
      <div className="flex-1 text-white flex flex-col gap-5 items-start justify-center min-w-80 max-w-135 w-full">
        <h2 className="font-black text-5xl font-bold text-white mb-3 tracking-wide uppercase text-shadow-none text-left w-full">
          {product.name}
        </h2>
        
        <div className="text-xl font-bold text-white text-left w-full">
          ₹{product.price}
        </div>
        
        <div className="text-lg text-gray-300 mb-6 max-w-175 ml-0 mr-0 text-left w-full">
          {product.description}
        </div>
        
        {isPoster && (
          <div className="mb-5 flex flex-col items-start gap-2 text-left w-full">
            <label htmlFor="size-select" className="text-white font-medium">Size</label>
            <select
              id="size-select"
              value={size}
              onChange={e => setSize(e.target.value)}
              className="py-2 px-5 rounded-lg border-2 border-main-purple bg-gray-800 text-white text-base font-inherit mt-1"
            >
              {posterSizes.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}
        
        <div className="mb-5 flex flex-col items-start gap-2 text-left w-full">
          <label htmlFor="quantity-input" className="text-white font-medium">Quantity</label>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setQuantity(q => Math.max(1, q - 1))} 
              className="bg-main-purple text-white border-none rounded-lg w-9 h-9 text-lg font-bold cursor-pointer transition-colors duration-200 flex items-center justify-center hover:bg-white hover:text-main-purple"
            >
              -
            </button>
            <input
              id="quantity-input"
              type="number"
              min="1"
              value={quantity}
              onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-12 text-center text-lg border-2 border-main-purple rounded-lg bg-gray-800 text-white py-1 px-1"
            />
            <button 
              onClick={() => setQuantity(q => q + 1)} 
              className="bg-main-purple text-white border-none rounded-lg w-9 h-9 text-lg font-bold cursor-pointer transition-colors duration-200 flex items-center justify-center hover:bg-white hover:text-main-purple"
            >
              +
            </button>
          </div>
        </div>
        
        <button 
          className="bg-accent-pink text-white border-none rounded-2xl py-3 px-8 text-lg font-bold cursor-pointer max-w-44 transition-colors duration-200 self-start hover:bg-white hover:text-accent-pink"
          onClick={handleAddToCart}
        >
          Add to Cart
        </button>
      </div>
    </section>
  );
};

export default ProductDetails;