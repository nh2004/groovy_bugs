import React, { useState } from "react";
import "../styles/ProductDetails.css";

const posterSizes = [
  { value: "A5", label: "A5 - 17 Posters" },
  { value: "A4", label: "A4 - 17 Posters" },
  { value: "A3", label: "A3 - 17 Posters" }
];

const ProductDetails = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState(posterSizes[0].value);

  if (!product) {
    return <div className="product-details-empty">Product not found.</div>;
  }
  const isPoster = product.category && product.category.toLowerCase().includes("poster");

  const handleAddToCart = () => {
    onAddToCart({ ...product, quantity, size: isPoster ? size : undefined });
  };

  return (
    <section className="product-details-section fade-in">
      <div className="product-details-img-wrap">
        <img src={product.image} alt={product.name} className="product-details-img-full" />
      </div>
      <div className="product-details-info">
        <h2 className="product-details-title">{product.name}</h2>
        <div className="product-details-price">₹{product.price}</div>
        <div className="product-details-desc">{product.description}</div>
        {isPoster && (
          <div className="product-details-field">
            <label htmlFor="size-select">Size</label>
            <select
              id="size-select"
              value={size}
              onChange={e => setSize(e.target.value)}
              className="product-details-select"
            >
              {posterSizes.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}
        <div className="product-details-field">
          <label htmlFor="quantity-input">Quantity</label>
          <div className="product-details-qty-box">
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="qty-btn">-</button>
            <input
              id="quantity-input"
              type="number"
              min="1"
              value={quantity}
              onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
              className="qty-input"
            />
            <button onClick={() => setQuantity(q => q + 1)} className="qty-btn">+</button>
          </div>
        </div>
        <button className="add-cart-btn" onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
    </section>
  );
};

export default ProductDetails; 