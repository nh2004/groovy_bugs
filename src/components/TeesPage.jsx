import React from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../context/ProductContext";

const TeesPage = () => {
  const { getProductsByCategory, loading } = useProducts();
  const teesProducts = getProductsByCategory("tee");

  if (loading) {
    return (
      <div className="bg-main-bg min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl font-mono">Loading tees...</div>
      </div>
    );
  }

  return (
    <div className="bg-main-bg min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-black text-white font-mono tracking-wider uppercase">
            TEES
          </h1>
          <div className="text-gray-400 font-mono">
            {teesProducts.length} products
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {teesProducts.map(product => (
            <Link 
              to={`/product/${product._id || product.id}`} 
              key={product._id || product.id}
              className="group bg-gray-900 rounded-2xl overflow-hidden transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl no-underline border border-gray-800 hover:border-main-purple"
            >
              <div className="aspect-square overflow-hidden bg-gray-800">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-white mb-2 font-mono uppercase tracking-wide">
                  {product.name}
                </h3>
                <p className="text-gray-400 font-mono">
                  From Rs. {product.price}.00
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeesPage;