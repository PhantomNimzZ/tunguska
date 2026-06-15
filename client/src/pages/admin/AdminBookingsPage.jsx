import { useState, useEffect } from "react";
import api from "../../api/client";
import toast from "react-hot-toast";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("");

  const fetchBookings = () => {
    const params = filter ? { status: filter } : {};
    api.get("/admin/bookings", { params }).then(({ data }) => setBookings(data.data));
  };

  useEffect(fetchBookings, [filter]);

  const approve = async (id) => {
    await api.patch(`/admin/bookings/${id}/approve`);
    toast.success("Booking approved");
    fetchBookings();
  };

  const decline = async (id) => {
    const reason = prompt("Reason for declining:");
    if (reason === null) return;
    await api.patch(`/admin/bookings/${id}/decline`, { reason });
    toast.success("Booking declined");
    fetchBookings();
  };

  return (
    <div className="admin-page">
      <h1>Bookings</h1>
      <div className="filter-bar">
        {["", "PENDING", "APPROVED", "DECLINED", "CANCELLED"].map((s) => (
          <button key={s} className={`filter-btn ${filter === s ? "active" : ""}`} onClick={() => setFilter(s)}>
            {s || "All"}
          </button>
        ))}
      </div>
      <table className="admin-table">
        <thead><tr><th>Venue</th><th>User</th><th>Date</th><th>Time</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id}>
              <td>{b.venue.name}</td>
              <td>{b.user.firstName} {b.user.lastName}</td>
              <td>{new Date(b.bookingDate).toLocaleDateString("en-ZA")}</td>
              <td>{b.startTime} - {b.endTime}</td>
              <td>R{b.totalAmount.toFixed(2)}</td>
              <td><span className={`status-badge ${b.status.toLowerCase()}`}>{b.status}</span></td>
              <td>
                {b.status === "PENDING" && (
                  <>
                    <button onClick={() => approve(b.id)} className="btn-success-sm">Approve</button>
                    <button onClick={() => decline(b.id)} className="btn-danger-sm">Decline</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
