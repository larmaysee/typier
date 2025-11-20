"use client";

import { useEffect, useState } from "react";

interface BackgroundSliderProps {
  images: string[];
  interval?: number; // milliseconds between slides
}

export function BackgroundSlider({ images, interval = 5000 }: BackgroundSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        setIsTransitioning(false);
      }, 500); // Half of transition duration
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  return (
    <div className="fixed inset-0 -z-10">
      {/* Background overlay for better text readability */}
      <div className="absolute inset-0 z-10" />

      {/* Slider images */}
      {images.map((image, index) => (
        <div
          key={image}
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${
            index === currentIndex && !isTransitioning ? "opacity-100" : "opacity-0"
          }`}
          style={{
            backgroundImage: `url(${image})`,
          }}
        />
      ))}
    </div>
  );
}
