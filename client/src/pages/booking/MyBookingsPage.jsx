import { useState, useEffect } from "react";
import api from "../../api/client";
import Modal from "../../components/common/Modal";
import toast from "react-hot-toast";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    api.get("/bookings").then(({ data }) => setBookings(data.data));
  }, []);

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await api.patch(`/bookings/${cancelTarget.id}/cancel`);
      setBookings((prev) => prev.map((b) => b.id === cancelTarget.id ? { ...b, status: "CANCELLED" } : b));
      toast.success("Booking cancelled.");
      setCancelTarget(null);
    } catch (err) {
      toast.error("Failed to cancel booking.");
    } finally {
      setCancelling(false);
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
            <p>{new Date(b.bookingDate).toLocaleDateString("en-ZA", { weekday: "short", year: "numeric", month: "short", day: "numeric" })} · {b.startTime} – {b.endTime}</p>
            <p>R{b.totalAmount.toFixed(2)} · Payment: {b.payment?.status || "N/A"}</p>
            {(b.status === "PENDING" || b.status === "APPROVED") && (
              <button onClick={() => setCancelTarget(b)} className="btn-danger-sm">Cancel booking</button>
            )}
          </div>
        ))}
        {bookings.length === 0 && <p>You have no bookings yet.</p>}
      </div>

      {/* Cancel confirmation modal */}
      <Modal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel booking"
      >
        {cancelTarget && (
          <div className="confirm-modal">
            <p>Are you sure you want to cancel your booking at <strong>{cancelTarget.venue.name}</strong>?</p>
            <p className="confirm-detail">
              {new Date(cancelTarget.bookingDate).toLocaleDateString("en-ZA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} · {cancelTarget.startTime} – {cancelTarget.endTime}
            </p>
            <p className="confirm-warning">This action cannot be undone.</p>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setCancelTarget(null)} disabled={cancelling}>
                Keep booking
              </button>
              <button className="btn-danger" onClick={confirmCancel} disabled={cancelling}>
                {cancelling ? "Cancelling..." : "Yes, cancel booking"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
