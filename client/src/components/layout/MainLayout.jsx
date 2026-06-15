import { Outlet, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/client";

export default function MainLayout() {
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    api.get("/categories").then(({ data }) => setCategories(data.data)).catch(() => {});
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="app-layout">
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="logo">
            <span className="logo-mark">T</span>
            <span className="logo-text">Tunguska</span>
          </Link>

          <nav className="nav">
            <Link to="/" className="nav-link">Home</Link>

            {/* Book venue dropdown */}
            <div className="dropdown" ref={dropdownRef}>
              <button
                className="nav-link dropdown-trigger"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                Book a venue ▾
              </button>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/venues/${cat.slug}`}
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/my-bookings" className="nav-link">My bookings</Link>
                {user.role === "ADMIN" && (
                  <Link to="/admin" className="nav-link nav-admin">Admin</Link>
                )}
                <button onClick={logout} className="nav-link btn-logout">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="btn-primary">Sign up</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <p>© 2026 Project Tunguska — eThekwini Municipal Venue Bookings</p>
      </footer>
    </div>
  );
}
