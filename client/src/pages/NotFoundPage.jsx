import { Link, useLocation } from "react-router-dom";

export default function NotFoundPage() {
  const location = useLocation();

  return (
    <div className="page placeholder-page">
      <div className="placeholder-card">
        <div className="not-found-code">404</div>
        <h1>Page not found</h1>
        <p>The page <strong>{location.pathname}</strong> doesn't exist or may have been moved.</p>
        <div className="not-found-actions">
          <Link to="/" className="btn-primary">Go to homepage</Link>
          <Link to="/categories" className="btn-outline">Browse venues</Link>
        </div>
      </div>
    </div>
  );
}
