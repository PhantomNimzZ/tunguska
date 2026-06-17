import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/client";
import BackNav from "../../components/common/BackNav";

export default function VenueListPage() {
  const { categorySlug, sportSlug } = useParams();
  const [venues, setVenues] = useState([]);
  const [sportTypes, setSportTypes] = useState([]);
  const [category, setCategory] = useState(null);
  const [sportType, setSportType] = useState(null);

  useEffect(() => {
    api.get(`/categories/${categorySlug}`).then(({ data }) => {
      setCategory(data.data);
      if (data.data.sportTypes?.length > 0 && !sportSlug) {
        setSportTypes(data.data.sportTypes);
      }
      if (sportSlug && data.data.sportTypes) {
        const st = data.data.sportTypes.find((s) => s.slug === sportSlug);
        setSportType(st || null);
      }
    });

    const params = { categorySlug };
    if (sportSlug) params.sportSlug = sportSlug;
    api.get("/venues", { params }).then(({ data }) => setVenues(data.data));
  }, [categorySlug, sportSlug]);

  // Sport type selection screen
  if (categorySlug === "sports" && !sportSlug && sportTypes.length > 0) {
    return (
      <div className="page">
        <BackNav links={[
          { label: "Venues", to: "/categories" },
          { label: "Sports" },
        ]} />
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

  // Build breadcrumb links
  const breadcrumbs = [{ label: "Venues", to: "/categories" }];
  if (category) {
    if (sportSlug) {
      breadcrumbs.push({ label: category.name, to: `/venues/${categorySlug}` });
      breadcrumbs.push({ label: sportType?.name || sportSlug });
    } else {
      breadcrumbs.push({ label: category.name });
    }
  }

  return (
    <div className="page">
      <BackNav links={breadcrumbs} />
      <h1>{sportType?.name || category?.name || "Venues"}</h1>
      <div className="venue-grid">
        {venues.map((venue) => (
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
              <p className="venue-location">{venue.suburb || venue.address}, {venue.city || "Durban"}</p>
              <div className="venue-card-footer">
                <span className="venue-price">R{venue.pricePerHour}/hr</span>
                {venue.capacity && <span className="venue-capacity">{venue.capacity} people</span>}
              </div>
            </div>
          </Link>
        ))}
        {venues.length === 0 && <p>No venues found.</p>}
      </div>
    </div>
  );
}
