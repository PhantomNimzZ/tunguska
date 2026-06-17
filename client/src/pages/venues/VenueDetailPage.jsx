import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/client";
import BackNav from "../../components/common/BackNav";

const DAY_ORDER = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const DAY_SHORT = { MONDAY: "Mon", TUESDAY: "Tue", WEDNESDAY: "Wed", THURSDAY: "Thu", FRIDAY: "Fri", SATURDAY: "Sat", SUNDAY: "Sun" };

export default function VenueDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [venue, setVenue] = useState(null);

  useEffect(() => {
    api.get(`/venues/${slug}`).then(({ data }) => setVenue(data.data));
  }, [slug]);

  if (!venue) return <div className="page"><p>Loading...</p></div>;

  const sortedHours = venue.operatingHours
    ? DAY_ORDER.map((day) => venue.operatingHours.find((h) => h.dayOfWeek === day)).filter(Boolean)
    : [];

  // Build breadcrumbs
  const breadcrumbs = [{ label: "Venues", to: "/categories" }];
  if (venue.category) {
    breadcrumbs.push({ label: venue.category.name, to: `/venues/${venue.category.slug}` });
  }
  if (venue.sportType) {
    breadcrumbs.push({ label: venue.sportType.name, to: `/venues/${venue.category?.slug}/${venue.sportType.slug}` });
  }
  breadcrumbs.push({ label: venue.name });

  return (
    <div className="page venue-detail-page">
      <BackNav links={breadcrumbs} />
      {/* Image gallery */}
      {venue.images?.length > 0 && (
        <div className="venue-detail-gallery">
          <img
            src={venue.images.find((i) => i.isPrimary)?.url || venue.images[0].url}
            alt={venue.name}
            className="venue-detail-hero-img"
          />
        </div>
      )}

      <div className="venue-detail-layout">
        <div className="venue-detail-main">
          <div className="venue-detail-header">
            <div>
              <span className="venue-detail-category">{venue.category?.name}{venue.sportType ? ` · ${venue.sportType.name}` : ""}</span>
              <h1>{venue.name}</h1>
              <p className="venue-detail-address">{venue.address}{venue.suburb ? `, ${venue.suburb}` : ""}</p>
            </div>
          </div>

          {venue.description && (
            <div className="venue-detail-section">
              <h2>About this venue</h2>
              <p>{venue.description}</p>
            </div>
          )}

          {venue.amenities?.length > 0 && (
            <div className="venue-detail-section">
              <h2>Amenities</h2>
              <div className="amenity-tags">
                {venue.amenities.map((a) => (
                  <span key={a} className="tag">{a.replace(/-/g, " ")}</span>
                ))}
              </div>
            </div>
          )}

          {venue.rules && (
            <div className="venue-detail-section">
              <h2>Usage rules</h2>
              <p className="venue-rules-text">{venue.rules}</p>
            </div>
          )}

          {sortedHours.length > 0 && (
            <div className="venue-detail-section">
              <h2>Operating hours</h2>
              <div className="venue-hours-list">
                {sortedHours.map((h) => (
                  <div key={h.dayOfWeek} className={`venue-hours-row ${h.isClosed ? "closed" : ""}`}>
                    <span className="venue-hours-day">{DAY_SHORT[h.dayOfWeek]}</span>
                    <span>{h.isClosed ? "Closed" : `${h.openTime} – ${h.closeTime}`}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="venue-detail-sidebar">
          <div className="venue-detail-card">
            <div className="venue-detail-price">
              <span className="price-amount">R{venue.pricePerHour}</span>
              <span className="price-unit">/hour</span>
            </div>
            {venue.capacity && (
              <p className="venue-detail-capacity">Up to {venue.capacity} people</p>
            )}
            {user ? (
              <Link to={`/book/${venue.slug}`} className="btn-primary btn-block">Book this venue</Link>
            ) : (
              <Link to="/login" className="btn-primary btn-block">Login to book</Link>
            )}
            <p className="venue-detail-note">Bookings require municipal approval</p>
          </div>
        </div>
      </div>
    </div>
  );
}
