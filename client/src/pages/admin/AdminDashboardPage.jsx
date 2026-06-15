import { useState, useEffect } from "react";
import api from "../../api/client";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/stats").then(({ data }) => setStats(data.data));
  }, []);

  if (!stats) return <p>Loading...</p>;

  return (
    <div className="admin-page">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card"><h2>{stats.totalUsers}</h2><p>Users</p></div>
        <div className="stat-card"><h2>{stats.totalVenues}</h2><p>Venues</p></div>
        <div className="stat-card"><h2>{stats.totalBookings}</h2><p>Total bookings</p></div>
        <div className="stat-card accent"><h2>{stats.pendingBookings}</h2><p>Pending approval</p></div>
        <div className="stat-card"><h2>R{stats.totalRevenue.toFixed(2)}</h2><p>Revenue collected</p></div>
      </div>
    </div>
  );
}
