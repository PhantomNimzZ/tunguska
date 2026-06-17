import { useState, useEffect } from "react";

const SLIDES = [
  {
    url: "https://images.unsplash.com/photo-1656776832783-c1671a7ad521?w=1600&q=80",
    credit: "Weyland Swart",
    caption: "Durban skyline from North Beach",
  },
  {
    url: "https://images.unsplash.com/photo-1477901701740-5304fcfcb7fa?w=1600&q=80",
    credit: "Jason Briscoe",
    caption: "Durban beachfront aerial view",
  },
  {
    url: "https://images.unsplash.com/photo-1550761717-d03b44d9cb33?w=1600&q=80",
    credit: "Marlin Clark",
    caption: "Durban North Beach at sunset",
  },
];

export default function HeroSlideshow({ children }) {
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState(new Set());

  // Preload images
  useEffect(() => {
    SLIDES.forEach((slide, i) => {
      const img = new Image();
      img.onload = () => setLoaded((prev) => new Set(prev).add(i));
      img.src = slide.url;
    });
  }, []);

  // Auto-advance every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="hero-slideshow">
      {/* Background slides */}
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className={`hero-slide ${i === current ? "active" : ""}`}
          style={{ backgroundImage: `url(${slide.url})` }}
        />
      ))}

      {/* Dark overlay */}
      <div className="hero-overlay" />

      {/* Content */}
      <div className="hero-content">
        {children}
      </div>

      {/* Slide indicators */}
      <div className="hero-indicators">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`hero-dot ${i === current ? "active" : ""}`}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Photo credit */}
      <div className="hero-credit">
        Photo: {SLIDES[current].credit}
      </div>
    </section>
  );
}
