import React from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../context/ProductContext";

const ProductSlider = () => {
  const { getFeaturedProducts, loading } = useProducts();
  const products = getFeaturedProducts();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-white text-xl font-mono">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="bg-main-bg py-10">
      <div className="overflow-x-auto">
        <div className="flex gap-6 px-6 pb-4" style={{ width: 'max-content' }}>
          {products.map(product => (
            <Link 
              to={`/product/${product._id || product.id}`} 
              key={product._id || product.id} 
              className="no-underline text-inherit block"
            >
              <div className="group bg-gray-900 rounded-2xl min-w-72 max-w-72 flex-shrink-0 overflow-hidden transition-all duration-300 ease-out cursor-pointer border border-gray-800 hover:border-main-purple hover:transform hover:-translate-y-2 hover:scale-105 hover:shadow-2xl">
                <div className="relative aspect-square overflow-hidden bg-gray-800">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <span className="absolute left-3 top-3 bg-main-purple text-white text-sm font-bold py-1 px-3 rounded-lg tracking-wide font-mono">
                    Sale
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-3 tracking-wide font-mono uppercase">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-gray-400 line-through text-base font-mono">
                      Rs. 2,000.00
                    </span>
                    <span className="text-white text-lg font-bold font-mono">
                      Rs. {product.price}.00
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductSlider;