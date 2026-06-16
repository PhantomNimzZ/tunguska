import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import toast from "react-hot-toast";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    api.get("/admin/stats").then(({ data }) => setStats(data.data));
    api.get("/admin/bookings", { params: { status: "PENDING" } }).then(({ data }) =>
      setPendingBookings(data.data.slice(0, 5))
    );
    api.get("/admin/bookings").then(({ data }) =>
      setRecentBookings(data.data.slice(0, 8))
    );
  }, []);

  const approveBooking = async (id) => {
    try {
      await api.patch(`/admin/bookings/${id}/approve`);
      toast.success("Booking approved");
      setPendingBookings((prev) => prev.filter((b) => b.id !== id));
      setStats((prev) => prev ? { ...prev, pendingBookings: prev.pendingBookings - 1 } : prev);
    } catch {
      toast.error("Failed to approve booking.");
    }
  };

  const declineBooking = async (id) => {
    const reason = prompt("Reason for declining:");
    if (reason === null) return;
    try {
      await api.patch(`/admin/bookings/${id}/decline`, { reason });
      toast.success("Booking declined");
      setPendingBookings((prev) => prev.filter((b) => b.id !== id));
      setStats((prev) => prev ? { ...prev, pendingBookings: prev.pendingBookings - 1 } : prev);
    } catch {
      toast.error("Failed to decline booking.");
    }
  };

  if (!stats) return <div className="admin-page"><p>Loading dashboard...</p></div>;

  return (
    <div className="admin-page">
      <h1>Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h2>{stats.totalUsers}</h2>
          <p>Registered users</p>
        </div>
        <div className="stat-card">
          <h2>{stats.totalVenues}</h2>
          <p>Active venues</p>
        </div>
        <div className="stat-card">
          <h2>{stats.totalBookings}</h2>
          <p>Total bookings</p>
        </div>
        <div className={`stat-card ${stats.pendingBookings > 0 ? "accent" : ""}`}>
          <h2>{stats.pendingBookings}</h2>
          <p>Pending approval</p>
        </div>
        <div className="stat-card">
          <h2>R{stats.totalRevenue.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</h2>
          <p>Revenue collected</p>
        </div>
      </div>

      <div className="dashboard-sections">
        {/* Pending approvals */}
        {pendingBookings.length > 0 && (
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Pending approvals</h2>
              <Link to="/admin/bookings" className="section-link">View all</Link>
            </div>
            <div className="pending-list">
              {pendingBookings.map((b) => (
                <div key={b.id} className="pending-card">
                  <div className="pending-info">
                    <div className="pending-primary">
                      <strong>{b.venue.name}</strong>
                      <span className="pending-date">
                        {new Date(b.bookingDate).toLocaleDateString("en-ZA")} · {b.startTime} – {b.endTime}
                      </span>
                    </div>
                    <div className="pending-secondary">
                      {b.user.firstName} {b.user.lastName} · R{b.totalAmount.toFixed(2)}
                      {b.purpose && <span className="td-sub"> · {b.purpose}</span>}
                    </div>
                  </div>
                  <div className="pending-actions">
                    <button onClick={() => approveBooking(b.id)} className="btn-action btn-action-success">Approve</button>
                    <button onClick={() => declineBooking(b.id)} className="btn-action btn-action-warn">Decline</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent bookings */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Recent bookings</h2>
            <Link to="/admin/bookings" className="section-link">View all</Link>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Venue</th>
                <th>User</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b) => (
                <tr key={b.id}>
                  <td className="td-bold">{b.venue.name}</td>
                  <td>{b.user.firstName} {b.user.lastName}</td>
                  <td>{new Date(b.bookingDate).toLocaleDateString("en-ZA")}</td>
                  <td>R{b.totalAmount.toFixed(2)}</td>
                  <td><span className={`status-badge ${b.status.toLowerCase()}`}>{b.status}</span></td>
                  <td><span className={`status-badge ${(b.payment?.status || "unpaid").toLowerCase()}`}>{b.payment?.status || "UNPAID"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
