import { Link, useNavigate } from "react-router-dom";

export default function BackNav({ links }) {
  const navigate = useNavigate();

  return (
    <nav className="back-nav">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>
      {links && links.length > 0 && (
        <div className="breadcrumbs">
          <Link to="/" className="breadcrumb">Home</Link>
          {links.map((link, i) => (
            <span key={i}>
              <span className="breadcrumb-sep">/</span>
              {link.to ? (
                <Link to={link.to} className="breadcrumb">{link.label}</Link>
              ) : (
                <span className="breadcrumb current">{link.label}</span>
              )}
            </span>
          ))}
        </div>
      )}
    </nav>
  );
}
