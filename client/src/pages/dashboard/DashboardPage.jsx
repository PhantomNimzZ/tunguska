import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import api from "../../api/client";

export default function DashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api.get("/bookings").then(({ data }) => setBookings(data.data.slice(0, 3)));
  }, []);

  const upcoming = bookings.filter(
    (b) => (b.status === "APPROVED" || b.status === "PENDING") && new Date(b.bookingDate) >= new Date()
  );

  return (
    <div className="page dashboard-page">
      <h1>Welcome, {user?.firstName}</h1>
      <p className="dashboard-subtitle">Here's a summary of your account.</p>

      <div className="dashboard-grid">
        <Link to="/my-bookings" className="dashboard-card">
          <div className="dashboard-card-icon">📅</div>
          <h3>My bookings</h3>
          <p>View and manage your venue bookings</p>
          {upcoming.length > 0 && (
            <span className="dashboard-card-badge">{upcoming.length} upcoming</span>
          )}
        </Link>
        <Link to="/profile" className="dashboard-card">
          <div className="dashboard-card-icon">👤</div>
          <h3>Manage profile</h3>
          <p>Update your name, contact details, and password</p>
        </Link>
        <Link to="/payment-history" className="dashboard-card">
          <div className="dashboard-card-icon">💳</div>
          <h3>Payment history</h3>
          <p>View payment status for all your bookings</p>
        </Link>
      </div>

      {upcoming.length > 0 && (
        <div className="dashboard-upcoming">
          <h2>Upcoming bookings</h2>
          <div className="bookings-list">
            {upcoming.map((b) => (
              <div key={b.id} className={`booking-card status-${b.status.toLowerCase()}`}>
                <div className="booking-card-header">
                  <h3>{b.venue.name}</h3>
                  <span className={`status-badge ${b.status.toLowerCase()}`}>{b.status}</span>
                </div>
                <p>{new Date(b.bookingDate).toLocaleDateString("en-ZA", { weekday: "short", year: "numeric", month: "short", day: "numeric" })} · {b.startTime} – {b.endTime}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
