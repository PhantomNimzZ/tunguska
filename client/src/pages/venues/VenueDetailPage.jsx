import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/client";

export default function VenueDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [venue, setVenue] = useState(null);

  useEffect(() => {
    api.get(`/venues/${slug}`).then(({ data }) => setVenue(data.data));
  }, [slug]);

  if (!venue) return <div className="page"><p>Loading...</p></div>;

  return (
    <div className="page venue-detail">
      <h1>{venue.name}</h1>
      <p className="venue-location">{venue.address}</p>
      <p className="venue-price">R{venue.pricePerHour} per hour</p>
      {venue.capacity && <p>Capacity: {venue.capacity} people</p>}
      {venue.description && <p>{venue.description}</p>}

      {venue.amenities?.length > 0 && (
        <div className="amenities">
          <h3>Amenities</h3>
          <div className="amenity-tags">
            {venue.amenities.map((a) => <span key={a} className="tag">{a.replace("-", " ")}</span>)}
          </div>
        </div>
      )}

      {user ? (
        <Link to={`/book/${venue.slug}`} className="btn-primary">Book this venue</Link>
      ) : (
        <Link to="/login" className="btn-primary">Login to book</Link>
      )}
    </div>
  );
}
