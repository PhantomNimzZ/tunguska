import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="page dashboard-page">
      <h1>Welcome, {user?.firstName}</h1>
      <div className="dashboard-grid">
        <Link to="/my-bookings" className="dashboard-card">
          <h3>My bookings</h3>
          <p>View and manage your venue bookings</p>
        </Link>
        <Link to="/categories" className="dashboard-card">
          <h3>Book a venue</h3>
          <p>Browse halls, sports fields, and more</p>
        </Link>
      </div>
    </div>
  );
}
