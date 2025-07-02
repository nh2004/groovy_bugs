import React from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../context/ProductContext";

const ProductSlider = () => {
  const { getFeaturedProducts, loading } = useProducts();
  const products = getFeaturedProducts();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-white text-xl">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="flex overflow-x-auto gap-9 py-10 px-6 scroll-smooth scrollbar-hide">
      {products.map(product => (
        <Link 
          to={`/product/${product._id || product.id}`} 
          key={product._id || product.id} 
          className="no-underline text-inherit block"
        >
          <div className="bg-main-bg rounded-2xl min-w-72 max-w-72 flex-shrink-0 shadow-none flex flex-col items-center scroll-snap-start font-mono relative transition-all duration-300 ease-out cursor-pointer p-3 box-border hover:transform hover:-translate-y-3 hover:scale-105 hover:-rotate-1 hover:z-10" style={{boxShadow: '0 12px 36px 0 #6c4f8c55, 0 0 0 8px #fff2 inset'}}>
            <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-gray-800 flex items-center justify-center">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover block"
              />
              <span className="absolute left-3 top-3 bg-main-purple text-white text-sm font-bold py-1 px-4 rounded-lg tracking-wide">
                Sale
              </span>
            </div>
            <div className="pt-4 px-1 w-full text-center">
              <div className="text-lg font-bold text-white mb-3 tracking-wide">
                {product.name.toUpperCase()}
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-gray-400 line-through text-base">
                  Rs. 2,000.00
                </span>
                <span className="text-white text-lg font-bold">
                  Rs. {product.price}.00
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ProductSlider;