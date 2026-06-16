export default function BookingDetail({ booking, onClose }) {
  if (!booking) return null;

  const b = booking;

  return (
    <div className="booking-detail">
      <div className="detail-section">
        <h3>Booking information</h3>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Status</span>
            <span className={`status-badge ${b.status.toLowerCase()}`}>{b.status}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Date</span>
            <span>{new Date(b.bookingDate).toLocaleDateString("en-ZA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Time</span>
            <span>{b.startTime} – {b.endTime}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Amount</span>
            <span className="detail-amount">R{b.totalAmount.toFixed(2)}</span>
          </div>
          {b.purpose && (
            <div className="detail-item full-width">
              <span className="detail-label">Purpose</span>
              <span>{b.purpose}</span>
            </div>
          )}
          {b.notes && (
            <div className="detail-item full-width">
              <span className="detail-label">Notes</span>
              <span>{b.notes}</span>
            </div>
          )}
          {b.declineReason && (
            <div className="detail-item full-width">
              <span className="detail-label">Decline reason</span>
              <span className="detail-decline">{b.declineReason}</span>
            </div>
          )}
          <div className="detail-item">
            <span className="detail-label">Created</span>
            <span>{new Date(b.createdAt).toLocaleDateString("en-ZA")}</span>
          </div>
        </div>
      </div>

      <div className="detail-section">
        <h3>Venue</h3>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Name</span>
            <span className="td-bold">{b.venue.name}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Address</span>
            <span>{b.venue.address}{b.venue.suburb ? `, ${b.venue.suburb}` : ""}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Rate</span>
            <span>R{b.venue.pricePerHour}/hr</span>
          </div>
        </div>
      </div>

      <div className="detail-section">
        <h3>User</h3>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Name</span>
            <span className="td-bold">{b.user.firstName} {b.user.lastName}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Email</span>
            <span>{b.user.email}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Phone</span>
            <span>{b.user.phone || "Not provided"}</span>
          </div>
        </div>
      </div>

      <div className="detail-section">
        <h3>Payment</h3>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Status</span>
            <span className={`status-badge ${(b.payment?.status || "unpaid").toLowerCase()}`}>
              {b.payment?.status || "UNPAID"}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Method</span>
            <span>{b.payment?.method ? b.payment.method.toUpperCase() : "—"}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Reference</span>
            <span>{b.payment?.reference || "—"}</span>
          </div>
          {b.payment?.paidAt && (
            <div className="detail-item">
              <span className="detail-label">Paid on</span>
              <span>{new Date(b.payment.paidAt).toLocaleDateString("en-ZA")}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
