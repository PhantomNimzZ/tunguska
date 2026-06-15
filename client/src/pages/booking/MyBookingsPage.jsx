import { useState, useEffect } from "react";
import api from "../../api/client";
import toast from "react-hot-toast";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api.get("/bookings").then(({ data }) => setBookings(data.data));
  }, []);

  const cancelBooking = async (id) => {
    if (!confirm("Cancel this booking?")) return;
    try {
      await api.patch(`/bookings/${id}/cancel`);
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: "CANCELLED" } : b));
      toast.success("Booking cancelled.");
    } catch (err) {
      toast.error("Failed to cancel booking.");
    }
  };

  return (
    <div className="page">
      <h1>My bookings</h1>
      <div className="bookings-list">
        {bookings.map((b) => (
          <div key={b.id} className={`booking-card status-${b.status.toLowerCase()}`}>
            <div className="booking-card-header">
              <h3>{b.venue.name}</h3>
              <span className={`status-badge ${b.status.toLowerCase()}`}>{b.status}</span>
            </div>
            <p>{new Date(b.bookingDate).toLocaleDateString("en-ZA")} · {b.startTime} - {b.endTime}</p>
            <p>R{b.totalAmount.toFixed(2)} · Payment: {b.payment?.status || "N/A"}</p>
            {(b.status === "PENDING" || b.status === "APPROVED") && (
              <button onClick={() => cancelBooking(b.id)} className="btn-danger-sm">Cancel</button>
            )}
          </div>
        ))}
        {bookings.length === 0 && <p>You have no bookings yet.</p>}
      </div>
    </div>
  );
}
