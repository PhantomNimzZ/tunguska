import { useState, useEffect, useMemo } from "react";
import api from "../../api/client";
import Modal from "../../components/common/Modal";
import toast from "react-hot-toast";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ status: "PAID", method: "", reference: "" });

  const fetchBookings = () => {
    const params = filter ? { status: filter } : {};
    api.get("/admin/bookings", { params }).then(({ data }) => setBookings(data.data));
  };

  useEffect(fetchBookings, [filter]);

  const filteredBookings = useMemo(() => {
    if (!search) return bookings;
    const term = search.toLowerCase();
    return bookings.filter((b) =>
      b.venue.name.toLowerCase().includes(term) ||
      `${b.user.firstName} ${b.user.lastName}`.toLowerCase().includes(term) ||
      (b.user.email || "").toLowerCase().includes(term)
    );
  }, [bookings, search]);

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

  const openPayment = (booking) => {
    setSelectedBooking(booking);
    setPaymentForm({
      status: booking.payment?.status || "UNPAID",
      method: booking.payment?.method || "",
      reference: booking.payment?.reference || "",
    });
    setShowPayment(true);
  };

  const savePayment = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/admin/bookings/${selectedBooking.id}/payment`, paymentForm);
      toast.success("Payment status updated.");
      setShowPayment(false);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update payment.");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Bookings</h1>
      </div>

      <div className="admin-filters">
        <input
          type="text"
          className="search-input"
          placeholder="Search by venue or user name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filter-bar">
          {["", "PENDING", "APPROVED", "DECLINED", "CANCELLED"].map((s) => (
            <button key={s} className={`filter-btn ${filter === s ? "active" : ""}`} onClick={() => setFilter(s)}>
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Venue</th>
            <th>User</th>
            <th>Date</th>
            <th>Time</th>
            <th>Amount</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredBookings.map((b) => (
            <tr key={b.id}>
              <td className="td-bold">{b.venue.name}</td>
              <td>
                <div>{b.user.firstName} {b.user.lastName}</div>
                <div className="td-sub">{b.user.email}</div>
              </td>
              <td>{new Date(b.bookingDate).toLocaleDateString("en-ZA")}</td>
              <td>{b.startTime} – {b.endTime}</td>
              <td>R{b.totalAmount.toFixed(2)}</td>
              <td>
                <button
                  className={`status-badge clickable ${(b.payment?.status || "unpaid").toLowerCase()}`}
                  onClick={() => openPayment(b)}
                  title="Click to update payment"
                >
                  {b.payment?.status || "UNPAID"}
                </button>
              </td>
              <td>
                <span className={`status-badge ${b.status.toLowerCase()}`}>{b.status}</span>
              </td>
              <td className="td-actions">
                {b.status === "PENDING" && (
                  <>
                    <button onClick={() => approve(b.id)} className="btn-action btn-action-success">Approve</button>
                    <button onClick={() => decline(b.id)} className="btn-action btn-action-warn">Decline</button>
                  </>
                )}
                {b.status !== "PENDING" && <span className="td-sub">—</span>}
              </td>
            </tr>
          ))}
          {filteredBookings.length === 0 && (
            <tr><td colSpan={8} className="td-empty">No bookings found{search ? " matching your search" : ""}.</td></tr>
          )}
        </tbody>
      </table>

      {/* Payment modal */}
      <Modal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        title={selectedBooking ? `Payment: ${selectedBooking.venue.name}` : "Update payment"}
      >
        {selectedBooking && (
          <form onSubmit={savePayment} className="admin-form">
            <div className="payment-summary">
              <p><strong>{selectedBooking.user.firstName} {selectedBooking.user.lastName}</strong></p>
              <p>{new Date(selectedBooking.bookingDate).toLocaleDateString("en-ZA")} · {selectedBooking.startTime} – {selectedBooking.endTime}</p>
              <p className="payment-amount">R{selectedBooking.totalAmount.toFixed(2)}</p>
            </div>

            <label>Payment status *</label>
            <select
              value={paymentForm.status}
              onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value })}
            >
              <option value="UNPAID">Unpaid</option>
              <option value="PAID">Paid</option>
              <option value="REFUNDED">Refunded</option>
            </select>

            <label>Payment method</label>
            <select
              value={paymentForm.method}
              onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
            >
              <option value="">Select method</option>
              <option value="cash">Cash</option>
              <option value="eft">EFT / Bank transfer</option>
              <option value="card">Card</option>
            </select>

            <label>Reference number</label>
            <input
              value={paymentForm.reference}
              onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
              placeholder="e.g. EFT ref or receipt number"
            />

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowPayment(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Update payment</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
