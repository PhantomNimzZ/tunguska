import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="page home-page">
      <section className="hero">
        <h1>Book municipal venues across eThekwini</h1>
        <p>Community halls, sports fields, parks, and more — all in one place.</p>
        <div className="hero-actions">
          <Link to="/categories" className="btn-primary">Browse venues</Link>
          <Link to="/register" className="btn-secondary">Create account</Link>
        </div>
      </section>
    </div>
  );
}
