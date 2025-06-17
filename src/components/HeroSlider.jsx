import React, { useEffect, useRef, useState } from "react";
import "../styles/HeroSlider.css";

const images = [
  require("../images/slide1.jpg"),
  require("../images/slide2.jpg"),
  require("../images/slide3.jpg")
];

const SLIDE_INTERVAL = 3500;

const HeroSlider = () => {
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef(null);

  const goTo = (i) => setIndex(i);
  const prev = () => setIndex((prev) => (prev - 1 + images.length) % images.length);
  const next = () => setIndex((prev) => (prev + 1) % images.length);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, SLIDE_INTERVAL);
    return () => clearTimeout(timeoutRef.current);
  }, [index]);

  return (
    <section className="hero-slider-section">
      <div className="slider-wrapper">
        <div
          className="slider-track"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {images.map((img, i) => (
            <img src={img} alt="hero slide" className="slider-image" key={i} />
          ))}
        </div>
      </div>
      <div className="hero-slider-content">
        <h1>REJECT MINIMALISM</h1>
        <p>Groovy Bugs brings you the boldest Rock Band Merch, Posters, and Accessories for your room and lifestyle.</p>
      </div>
    </section>
  );
};

export default HeroSlider; 