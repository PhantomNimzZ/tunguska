import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/client";

export default function VenueListPage() {
  const { categorySlug, sportSlug } = useParams();
  const [venues, setVenues] = useState([]);
  const [sportTypes, setSportTypes] = useState([]);
  const [category, setCategory] = useState(null);

  useEffect(() => {
    api.get(`/categories/${categorySlug}`).then(({ data }) => {
      setCategory(data.data);
      if (data.data.sportTypes?.length > 0 && !sportSlug) {
        setSportTypes(data.data.sportTypes);
      }
    });

    const params = { categorySlug };
    if (sportSlug) params.sportSlug = sportSlug;
    api.get("/venues", { params }).then(({ data }) => setVenues(data.data));
  }, [categorySlug, sportSlug]);

  if (categorySlug === "sports" && !sportSlug && sportTypes.length > 0) {
    return (
      <div className="page">
        <h1>Select a sport</h1>
        <div className="category-grid">
          {sportTypes.map((st) => (
            <Link key={st.id} to={`/venues/sports/${st.slug}`} className="category-card">
              <h2>{st.name}</h2>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>{category?.name || "Venues"}</h1>
      <div className="venue-grid">
        {venues.map((venue) => (
          <Link key={venue.id} to={`/venue/${venue.slug}`} className="venue-card">
            <div className="venue-card-image">
              {venue.images?.[0] ? (
                <img src={venue.images[0].url} alt={venue.name} />
              ) : (
                <div className="venue-card-placeholder">No image</div>
              )}
            </div>
            <div className="venue-card-body">
              <h3>{venue.name}</h3>
              <p className="venue-location">{venue.suburb}, {venue.city || "Durban"}</p>
              <p className="venue-price">R{venue.pricePerHour}/hr</p>
            </div>
          </Link>
        ))}
        {venues.length === 0 && <p>No venues found.</p>}
      </div>
    </div>
  );
}
