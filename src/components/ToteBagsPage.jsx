import React from "react";
import { Link } from "react-router-dom";
import products from "../data/products";
import "../styles/PostersPage.css";

const toteBagProducts = products.filter(p => p.category && p.category.toLowerCase().includes("tote bag"));

const ToteBagsPage = () => (
  <div className="posters-page">
    <div className="posters-header">
      <div></div>
      <div className="posters-count">
        {toteBagProducts.length} products
      </div>
    </div>
    <div className="posters-grid">
      {toteBagProducts.map(product => (
        <Link to={`/product/${product.id}`} className="poster-card" key={product.id}>
          <img src={product.image} alt={product.name} className="poster-image" />
          <div className="poster-name">{product.name.toUpperCase()}</div>
          <div className="poster-price">From Rs. {product.price}.00</div>
        </Link>
      ))}
    </div>
  </div>
);

export default ToteBagsPage; 