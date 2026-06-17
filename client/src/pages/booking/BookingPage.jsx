import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/client";
import BackNav from "../../components/common/BackNav";
import toast from "react-hot-toast";

export default function BookingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [form, setForm] = useState({ bookingDate: "", startTime: "", endTime: "", purpose: "", notes: "" });
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);

  // Local date string (fixes timezone issue with toISOString)
  const today = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }, []);

  const currentTime = useMemo(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  }, []);

  const isToday = form.bookingDate === today;

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
    setForm({ ...form, bookingDate: date, startTime: "", endTime: "" });
    checkAvailability(date);
  };

  // Client-side time validation
  const timeError = useMemo(() => {
    if (!form.startTime || !form.endTime || !availability) return null;
    if (availability.isClosed) return "Venue is closed on this day.";
    if (form.startTime >= form.endTime) return "End time must be after start time.";
    if (form.startTime < availability.openTime) return `Start time cannot be before ${availability.openTime}.`;
    if (form.endTime > availability.closeTime) return `End time cannot be after ${availability.closeTime}.`;
    if (isToday && form.startTime <= currentTime) return `Start time must be after the current time (${currentTime}).`;
    return null;
  }, [form.startTime, form.endTime, availability, isToday, currentTime]);

  // Calculate estimated cost
  const estimatedCost = useMemo(() => {
    if (!form.startTime || !form.endTime || !venue || timeError) return null;
    const [sh, sm] = form.startTime.split(":").map(Number);
    const [eh, em] = form.endTime.split(":").map(Number);
    const hours = (eh - sh) + (em - sm) / 60;
    if (hours <= 0) return null;
    return (hours * venue.pricePerHour).toFixed(2);
  }, [form.startTime, form.endTime, venue, timeError]);

  const canSubmit = form.bookingDate && form.startTime && form.endTime && !timeError && !availability?.isClosed;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
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
      <BackNav links={[
        { label: "Venues", to: "/categories" },
        { label: venue.name, to: `/venue/${venue.slug}` },
        { label: "Book" },
      ]} />
      <h1>Book {venue.name}</h1>
      <p className="venue-price">R{venue.pricePerHour} per hour</p>

      <form onSubmit={handleSubmit} className="booking-form">
        <label>Date</label>
        <input type="date" required value={form.bookingDate} onChange={handleDateChange} min={today} />

        {availability && !availability.isClosed && (
          <p className="availability-info">
            Open: {availability.openTime} – {availability.closeTime}
            {isToday && <span> · Booking from {currentTime} onwards</span>}
          </p>
        )}
        {availability?.isClosed && <p className="availability-closed">Venue is closed on this day.</p>}

        {availability?.bookedSlots?.length > 0 && (
          <div className="booked-slots">
            <p>Already booked:</p>
            {availability.bookedSlots.map((s, i) => (
              <span key={i} className="tag">{s.startTime} – {s.endTime} ({s.status})</span>
            ))}
          </div>
        )}

        <div className="form-row">
          <div>
            <label>Start time</label>
            <input
              type="time"
              required
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              min={isToday && currentTime > (availability?.openTime || "00:00") ? currentTime : availability?.openTime}
              max={availability?.closeTime}
            />
          </div>
          <div>
            <label>End time</label>
            <input
              type="time"
              required
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              min={form.startTime || availability?.openTime}
              max={availability?.closeTime}
            />
          </div>
        </div>

        {timeError && <p className="availability-closed">{timeError}</p>}

        {estimatedCost && !timeError && (
          <p className="estimated-cost">Estimated cost: <strong>R{estimatedCost}</strong></p>
        )}

        <label>Purpose</label>
        <input value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} placeholder="e.g. Birthday party, league match" />

        <label>Additional notes</label>
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />

        <button type="submit" className="btn-primary" disabled={loading || !canSubmit}>
          {loading ? "Submitting..." : "Submit booking request"}
        </button>
      </form>
    </div>
  );
}
