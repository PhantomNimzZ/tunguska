import { useState, useEffect } from "react";
import api from "../../api/client";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

const AMENITY_OPTIONS = [
  "parking", "wifi", "kitchen", "stage", "sound-system", "tables-chairs",
  "floodlights", "changing-rooms", "spectator-seating", "clubhouse",
  "braai-area", "security", "disabled-access", "air-conditioning",
];

const defaultHours = DAYS.map((day) => ({
  dayOfWeek: day,
  openTime: "08:00",
  closeTime: "22:00",
  isClosed: day === "SUNDAY",
}));

export default function VenueForm({ venue, onSave, onCancel }) {
  const isEdit = Boolean(venue);

  const [categories, setCategories] = useState([]);
  const [sportTypes, setSportTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    address: "",
    suburb: "",
    city: "Durban",
    latitude: "",
    longitude: "",
    capacity: "",
    pricePerHour: "",
    amenities: [],
    rules: "",
    categoryId: "",
    sportTypeId: "",
    operatingHours: defaultHours,
  });

  // Load categories on mount
  useEffect(() => {
    api.get("/categories").then(({ data }) => setCategories(data.data));
  }, []);

  // Load sport types when category changes
  useEffect(() => {
    const selectedCat = categories.find((c) => c.id === form.categoryId);
    if (selectedCat?.slug === "sports") {
      api.get(`/categories/${selectedCat.slug}/sport-types`).then(({ data }) =>
        setSportTypes(data.data)
      );
    } else {
      setSportTypes([]);
      setForm((prev) => ({ ...prev, sportTypeId: "" }));
    }
  }, [form.categoryId, categories]);

  // Populate form when editing
  useEffect(() => {
    if (venue) {
      setForm({
        name: venue.name || "",
        slug: venue.slug || "",
        description: venue.description || "",
        address: venue.address || "",
        suburb: venue.suburb || "",
        city: venue.city || "Durban",
        latitude: venue.latitude ?? "",
        longitude: venue.longitude ?? "",
        capacity: venue.capacity ?? "",
        pricePerHour: venue.pricePerHour ?? "",
        amenities: venue.amenities || [],
        rules: venue.rules || "",
        categoryId: venue.categoryId || "",
        sportTypeId: venue.sportTypeId || "",
        operatingHours: venue.operatingHours?.length > 0
          ? DAYS.map((day) => {
              const existing = venue.operatingHours.find((h) => h.dayOfWeek === day);
              return existing
                ? { dayOfWeek: day, openTime: existing.openTime, closeTime: existing.closeTime, isClosed: existing.isClosed }
                : { dayOfWeek: day, openTime: "08:00", closeTime: "22:00", isClosed: false };
            })
          : defaultHours,
      });
    }
  }, [venue]);

  // Auto-generate slug from name
  const updateName = (name) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    setForm((prev) => ({ ...prev, name, slug }));
  };

  const toggleAmenity = (amenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const updateHours = (dayIndex, field, value) => {
    setForm((prev) => ({
      ...prev,
      operatingHours: prev.operatingHours.map((h, i) =>
        i === dayIndex ? { ...h, [field]: field === "isClosed" ? !h.isClosed : value } : h
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...form,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        capacity: form.capacity ? parseInt(form.capacity) : null,
        pricePerHour: parseFloat(form.pricePerHour),
        sportTypeId: form.sportTypeId || null,
      };

      if (isEdit) {
        await api.put(`/admin/venues/${venue.id}`, payload);
      } else {
        await api.post("/admin/venues", payload);
      }

      onSave();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save venue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      {error && <div className="form-error">{error}</div>}

      <section className="form-section">
        <h3>Basic information</h3>

        <label>Venue name *</label>
        <input
          required
          value={form.name}
          onChange={(e) => updateName(e.target.value)}
          placeholder="e.g. KwaMashu Community Hall"
        />

        {form.slug && (
          <p className="slug-preview">URL: /venue/<strong>{form.slug}</strong></p>
        )}

        <label>Description</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Describe the venue, what it offers, and what it's best suited for."
        />

        <div className="form-row">
          <div>
            <label>Category *</label>
            <select
              required
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          {sportTypes.length > 0 && (
            <div>
              <label>Sport type *</label>
              <select
                required
                value={form.sportTypeId}
                onChange={(e) => setForm({ ...form, sportTypeId: e.target.value })}
              >
                <option value="">Select sport</option>
                {sportTypes.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </section>

      <section className="form-section">
        <h3>Location</h3>

        <label>Address *</label>
        <input
          required
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          placeholder="123 Main Road, KwaMashu"
        />

        <div className="form-row">
          <div>
            <label>Suburb</label>
            <input
              value={form.suburb}
              onChange={(e) => setForm({ ...form, suburb: e.target.value })}
              placeholder="e.g. KwaMashu"
            />
          </div>
          <div>
            <label>City</label>
            <input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </div>
        </div>

        <div className="form-row">
          <div>
            <label>Latitude</label>
            <input
              type="number"
              step="any"
              value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })}
              placeholder="-29.8587"
            />
          </div>
          <div>
            <label>Longitude</label>
            <input
              type="number"
              step="any"
              value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })}
              placeholder="31.0218"
            />
          </div>
        </div>
      </section>

      <section className="form-section">
        <h3>Pricing & capacity</h3>

        <div className="form-row">
          <div>
            <label>Price per hour (ZAR) *</label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.pricePerHour}
              onChange={(e) => setForm({ ...form, pricePerHour: e.target.value })}
              placeholder="250.00"
            />
          </div>
          <div>
            <label>Capacity (people)</label>
            <input
              type="number"
              min="0"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              placeholder="300"
            />
          </div>
        </div>
      </section>

      <section className="form-section">
        <h3>Amenities</h3>
        <div className="amenity-checkboxes">
          {AMENITY_OPTIONS.map((amenity) => (
            <label key={amenity} className="checkbox-label">
              <input
                type="checkbox"
                checked={form.amenities.includes(amenity)}
                onChange={() => toggleAmenity(amenity)}
              />
              <span>{amenity.replace(/-/g, " ")}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="form-section">
        <h3>Usage rules</h3>
        <textarea
          rows={3}
          value={form.rules}
          onChange={(e) => setForm({ ...form, rules: e.target.value })}
          placeholder="e.g. No alcohol without prior approval. Venue must be cleaned after use."
        />
      </section>

      <section className="form-section">
        <h3>Operating hours</h3>
        <div className="hours-grid">
            {form.operatingHours.map((h, i) => (
              <div key={h.dayOfWeek} className={`hours-row ${h.isClosed ? "closed" : ""}`}>
                <span className="hours-day">{h.dayOfWeek.slice(0, 3)}</span>
                <label className="checkbox-label compact">
                  <input
                    type="checkbox"
                    checked={h.isClosed}
                    onChange={() => updateHours(i, "isClosed")}
                  />
                  <span>Closed</span>
                </label>
                {!h.isClosed && (
                  <>
                    <input
                      type="time"
                      value={h.openTime}
                      onChange={(e) => updateHours(i, "openTime", e.target.value)}
                    />
                    <span className="hours-separator">to</span>
                    <input
                      type="time"
                      value={h.closeTime}
                      onChange={(e) => updateHours(i, "closeTime", e.target.value)}
                    />
                  </>
                )}
              </div>
            ))}
          </div>
      </section>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Saving..." : isEdit ? "Update venue" : "Create venue"}
        </button>
      </div>
    </form>
  );
}
