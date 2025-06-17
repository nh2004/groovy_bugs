import React from "react";
import { Link } from "react-router-dom";
import products from "../data/products";
import extraPosters from "../data/extraPosters";
import "../styles/PostersPage.css";

const posterProducts = products.filter(p => p.category && p.category.toLowerCase().includes("poster"));
const allPosters = [...posterProducts, ...extraPosters];

const PostersPage = () => (
  <div className="posters-page">
    <div className="posters-header">
      <div></div>
      <div className="posters-count">
        {allPosters.length} products
      </div>
    </div>
    <div className="posters-grid">
      {allPosters.map(product => (
        <Link to={`/product/${product.id}`} className="poster-card" key={product.id}>
          <img src={product.image} alt={product.name} className="poster-image" />
          <div className="poster-name">{product.name.toUpperCase()}</div>
          <div className="poster-price">From Rs. {product.price}.00</div>
        </Link>
      ))}
    </div>
  </div>
);

export default PostersPage; 