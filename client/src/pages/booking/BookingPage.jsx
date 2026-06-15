import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/client";
import toast from "react-hot-toast";

export default function BookingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [form, setForm] = useState({ bookingDate: "", startTime: "", endTime: "", purpose: "", notes: "" });
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/venues/${slug}`).then(({ data }) => setVenue(data.data));
  }, [slug]);

  const checkAvailability = async (date) => {
    if (!date) return;
    const { data } = await api.get(`/venues/${slug}/availability`, { params: { date } });
    setAvailability(data.data);
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setForm({ ...form, bookingDate: date });
    checkAvailability(date);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/bookings", { ...form, venueId: venue.id });
      toast.success("Booking request submitted!");
      navigate("/my-bookings");
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  if (!venue) return <div className="page"><p>Loading...</p></div>;

  return (
    <div className="page">
      <h1>Book {venue.name}</h1>
      <p className="venue-price">R{venue.pricePerHour} per hour</p>

      <form onSubmit={handleSubmit} className="booking-form">
        <label>Date</label>
        <input type="date" required value={form.bookingDate} onChange={handleDateChange} min={new Date().toISOString().split("T")[0]} />

        {availability && !availability.isClosed && (
          <p className="availability-info">Open: {availability.openTime} - {availability.closeTime}</p>
        )}
        {availability?.isClosed && <p className="availability-closed">Venue is closed on this day.</p>}

        {availability?.bookedSlots?.length > 0 && (
          <div className="booked-slots">
            <p>Already booked:</p>
            {availability.bookedSlots.map((s, i) => (
              <span key={i} className="tag">{s.startTime} - {s.endTime} ({s.status})</span>
            ))}
          </div>
        )}

        <div className="form-row">
          <div><label>Start time</label><input type="time" required value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></div>
          <div><label>End time</label><input type="time" required value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></div>
        </div>

        <label>Purpose</label>
        <input value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} placeholder="e.g. Birthday party, league match" />

        <label>Additional notes</label>
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />

        <button type="submit" className="btn-primary" disabled={loading || availability?.isClosed}>
          {loading ? "Submitting..." : "Submit booking request"}
        </button>
      </form>
    </div>
  );
}
