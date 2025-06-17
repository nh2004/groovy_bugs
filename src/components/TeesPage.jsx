import React from "react";
import { Link } from "react-router-dom";
import products from "../data/products";
import "../styles/PostersPage.css";

const teesProducts = products.filter(p => p.category && p.category.toLowerCase().includes("tee"));

const TeesPage = () => (
  <div className="posters-page">
    <div className="posters-header">
      <div></div>
      <div className="posters-count">
        {teesProducts.length} products
      </div>
    </div>
    <div className="posters-grid">
      {teesProducts.map(product => (
        <Link to={`/product/${product.id}`} className="poster-card" key={product.id}>
          <img src={product.image} alt={product.name} className="poster-image" />
          <div className="poster-name">{product.name.toUpperCase()}</div>
          <div className="poster-price">From Rs. {product.price}.00</div>
        </Link>
      ))}
    </div>
  </div>
);

export default TeesPage; 