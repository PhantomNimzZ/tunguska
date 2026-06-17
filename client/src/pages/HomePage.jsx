import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import HeroSlideshow from "../components/common/HeroSlideshow";

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [featuredVenues, setFeaturedVenues] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/categories").then(({ data }) => setCategories(data.data));
    api.get("/venues").then(({ data }) => setFeaturedVenues(data.data.slice(0, 6)));
  }, []);

  return (
    <div className="home-page">
      {/* ── Hero ─────────────────────────────────── */}
      <HeroSlideshow>
        <span className="hero-eyebrow">eThekwini Municipality</span>
        <h1>Book community venues across Durban</h1>
        <p className="hero-subtitle">
          Find and reserve halls, sports fields, parks, and swimming pools
          for your next event, match, or gathering.
        </p>
        <div className="hero-actions">
          <Link to="/categories" className="btn-primary btn-lg">Browse all venues</Link>
          <Link to="/register" className="btn-outline btn-lg">Create free account</Link>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-num">{featuredVenues.length}+</span>
            <span className="hero-stat-label">Venues</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-num">{categories.length}</span>
            <span className="hero-stat-label">Categories</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-num">24/7</span>
            <span className="hero-stat-label">Online booking</span>
          </div>
        </div>
      </HeroSlideshow>

      {/* ── Categories ───────────────────────────── */}
      <section className="section">
        <div className="section-inner">
          <span className="section-eyebrow">Venue types</span>
          <h2 className="section-title">What are you looking for?</h2>
          <div className="home-category-grid">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/venues/${cat.slug}`}
                className="home-category-card"
              >
                <div className={`home-category-icon icon-${cat.slug}`}>
                  {cat.slug === "halls" && "🏛️"}
                  {cat.slug === "sports" && "⚽"}
                  {cat.slug === "parks" && "🌳"}
                  {cat.slug === "swimming-pools" && "🏊"}
                </div>
                <h3>{cat.name}</h3>
                <p>{cat.description}</p>
                <span className="home-category-count">
                  {cat._count?.venues || 0} venue{(cat._count?.venues || 0) !== 1 ? "s" : ""}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────── */}
      <section className="section section-alt">
        <div className="section-inner">
          <span className="section-eyebrow">Simple process</span>
          <h2 className="section-title">How it works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Browse venues</h3>
              <p>Explore community halls, sports fields, parks, and more across eThekwini. Filter by category, sport type, or location.</p>
            </div>
            <div className="step-connector" />
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Pick your date</h3>
              <p>Check real-time availability, choose your date and time slot, and submit a booking request in minutes.</p>
            </div>
            <div className="step-connector" />
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Get confirmed</h3>
              <p>The municipality reviews your request and confirms your booking. You'll receive a notification once it's approved.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured venues ──────────────────────── */}
      {featuredVenues.length > 0 && (
        <section className="section">
          <div className="section-inner">
            <span className="section-eyebrow">Popular spaces</span>
            <h2 className="section-title">Featured venues</h2>
            <div className="venue-grid">
              {featuredVenues.map((venue) => (
                <Link key={venue.id} to={`/venue/${venue.slug}`} className="venue-card">
                  <div className="venue-card-image">
                    {venue.images?.[0] ? (
                      <img src={venue.images[0].url} alt={venue.name} />
                    ) : (
                      <div className="venue-card-placeholder">
                        <span>{venue.category?.name || "Venue"}</span>
                      </div>
                    )}
                    <span className="venue-card-category">{venue.category?.name}</span>
                  </div>
                  <div className="venue-card-body">
                    <h3>{venue.name}</h3>
                    <p className="venue-location">{venue.suburb || venue.address}, Durban</p>
                    <div className="venue-card-footer">
                      <span className="venue-price">R{venue.pricePerHour}/hr</span>
                      {venue.capacity && (
                        <span className="venue-capacity">{venue.capacity} people</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="section-cta">
              <Link to="/categories" className="btn-outline">View all venues</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA banner ───────────────────────────── */}
      <section className="cta-banner">
        <div className="section-inner">
          <h2>Ready to book your venue?</h2>
          <p>Create a free account and start booking municipal venues across eThekwini today.</p>
          <Link to="/register" className="btn-primary btn-lg">Get started</Link>
        </div>
      </section>
    </div>
  );
}
