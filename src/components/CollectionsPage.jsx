import React from "react";
import { Link } from "react-router-dom";
import "../styles/CollectionsPage.css";

const collections = [
  {
    name: "Posters",
    image: require("../images/collection-posters.jpg"),
    link: "/posters"
  },
  {
    name: "Merchandise",
    image: require("../images/collection-merch.jpg"),
    link: "/tees"
  },
  {
    name: "Tote Bags",
    image: require("../images/collection-tote.jpg"),
    link: "/tote-bags"
  }
];

const CollectionsPage = () => (
  <div className="collections-page">
    <h1 className="collections-title">COLLECTIONS</h1>
    <p className="collections-subtitle">
      All our product collections featuring designs from music, philosophy, esoterica, movie-culture, memes, and much more.
    </p>
    <div className="collections-grid">
      {collections.map(col => (
        <Link to={col.link} className="collection-card" key={col.name}>
          <img src={col.image} alt={col.name} className="collection-image" />
          <div className="collection-name">{col.name}</div>
        </Link>
      ))}
    </div>
  </div>
);

export default CollectionsPage; 