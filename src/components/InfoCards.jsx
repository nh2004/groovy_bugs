import React from "react";
import "../styles/InfoCards.css";

const cards = [
  {
    image: "/images/playlist-wall.jpg",
    heading: "pure customization",
    desc: "display your playlist with poster prints each customized to your choice and taste"
  },
  {
    image: "/images/thick-high-quality-poster-paper.jpg",
    heading: "build",
    desc: "heavy-end machinery for our vibrant prints. matte finish poster paper w/ a thickness of 300gsm and an extra matte laminate for that premium texture"
  },
  {
    image: "/images/creation-wall.jpg",
    heading: "creation",
    desc: "every single order of ours is unique in its own kind of way"
  }
];

const InfoCards = () => (
  <div className="info-cards-section">
    <div className="info-cards-grid">
      {cards.map((card, i) => (
        <div className="info-card" key={i}>
          <img src={card.image} alt={card.heading} className="info-card-img" />
          <div className="info-card-content">
            <div className="info-card-heading">{card.heading}</div>
            <div className="info-card-desc">{card.desc}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default InfoCards; 