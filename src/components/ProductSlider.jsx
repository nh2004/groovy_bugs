import React from "react";
import { Link } from "react-router-dom";
import "../styles/ProductSlider.css";

const ProductSlider = ({ products, onAddToCart }) => (
  <div className="product-slider">
    {products.map(product => (
      <Link to={`/product/${product.id}`} key={product.id} className="slider-card-link">
        <div className="slider-card pop">
          <div className="slider-img-wrap">
            <img src={product.image} alt={product.name} className="slider-img" />
            <span className="slider-badge">Sale</span>
          </div>
          <div className="slider-info">
            <div className="slider-title">{product.name.toUpperCase()}</div>
            <div className="slider-prices">
              <span className="slider-old-price">Rs. 2,000.00</span>
              <span className="slider-new-price">Rs. {product.price}.00</span>
            </div>
          </div>
        </div>
      </Link>
    ))}
  </div>
);

export default ProductSlider; 