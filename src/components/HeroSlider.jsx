import React, { useEffect, useRef, useState } from "react";

const images = [
  "/images/slide1.jpg",
  "/images/slide2.jpg", 
  "/images/slide3.jpg"
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
    <section className="relative h-screen overflow-hidden bg-main-bg">
      {/* Slider Wrapper */}
      <div className="relative w-full h-full">
        <div
          className="flex w-full h-full transition-transform duration-1000 ease-in-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {images.map((img, i) => (
            <img 
              src={img} 
              alt={`hero slide ${i + 1}`} 
              className="w-full h-full object-cover flex-shrink-0" 
              key={i} 
            />
          ))}
        </div>
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      
      {/* Hero Content */}
      <div className="absolute inset-0 flex items-center justify-center text-center z-10">
        <div className="max-w-4xl px-6">
          <h1 className="text-6xl md:text-8xl font-black text-white mb-6 font-display tracking-wider uppercase animate-fade-in">
            REJECT MINIMALISM
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed font-mono animate-fade-in">
            Groovy Bugs brings you the boldest Rock Band Merch, Posters, and Accessories for your room and lifestyle.
          </p>
        </div>
      </div>
      
      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i === index ? 'bg-main-purple scale-125' : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
          />
        ))}
      </div>
      
      {/* Navigation Arrows */}
      <button
        onClick={prev}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all duration-200 z-20"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={next}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all duration-200 z-20"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  );
};

export default HeroSlider;