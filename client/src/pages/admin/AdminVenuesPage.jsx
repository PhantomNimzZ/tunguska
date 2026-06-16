import { useState, useEffect, useMemo } from "react";
import api from "../../api/client";
import Modal from "../../components/common/Modal";
import VenueForm from "../../components/admin/VenueForm";
import VenueImageManager from "../../components/admin/VenueImageManager";
import toast from "react-hot-toast";

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [showImages, setShowImages] = useState(false);
  const [imageVenue, setImageVenue] = useState(null);

  const fetchVenues = () => {
    api.get("/admin/venues").then(({ data }) => setVenues(data.data));
  };

  useEffect(fetchVenues, []);

  const filteredVenues = useMemo(() => {
    return venues.filter((v) => {
      const matchesSearch = !search ||
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        (v.suburb || "").toLowerCase().includes(search.toLowerCase()) ||
        v.address.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !categoryFilter ||
        v.category?.slug === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [venues, search, categoryFilter]);

  const categories = useMemo(() => {
    const cats = new Map();
    venues.forEach((v) => {
      if (v.category) cats.set(v.category.slug, v.category.name);
    });
    return Array.from(cats, ([slug, name]) => ({ slug, name }));
  }, [venues]);

  const handleCreate = () => {
    setEditingVenue(null);
    setShowForm(true);
  };

  const handleEdit = async (venueSlug) => {
    const { data } = await api.get(`/venues/${venueSlug}`);
    setEditingVenue(data.data);
    setShowForm(true);
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingVenue(null);
    fetchVenues();
    toast.success(editingVenue ? "Venue updated." : "Venue created.");
  };

  const handleToggleStatus = async (venue) => {
    const action = venue.isActive ? "deactivate" : "reactivate";
    if (!confirm(`Are you sure you want to ${action} "${venue.name}"?`)) return;

    try {
      await api.put(`/admin/venues/${venue.id}`, { isActive: !venue.isActive });
      fetchVenues();
      toast.success(`Venue ${venue.isActive ? "deactivated" : "reactivated"}.`);
    } catch {
      toast.error("Failed to update venue status.");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Venues</h1>
        <button className="btn-primary" onClick={handleCreate}>+ Add venue</button>
      </div>

      <div className="admin-filters">
        <input
          type="text"
          className="search-input"
          placeholder="Search by name, suburb, or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filter-bar">
          <button
            className={`filter-btn ${categoryFilter === "" ? "active" : ""}`}
            onClick={() => setCategoryFilter("")}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              className={`filter-btn ${categoryFilter === c.slug ? "active" : ""}`}
              onClick={() => setCategoryFilter(c.slug)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Address</th>
            <th>Price/hr</th>
            <th>Capacity</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredVenues.map((v) => (
            <tr key={v.id} className={!v.isActive ? "row-inactive" : ""}>
              <td className="td-bold">{v.name}</td>
              <td>{v.category?.name}{v.sportType ? ` / ${v.sportType.name}` : ""}</td>
              <td>{v.suburb || v.address}</td>
              <td>R{v.pricePerHour}</td>
              <td>{v.capacity || "—"}</td>
              <td>
                <span className={`status-badge ${v.isActive ? "approved" : "declined"}`}>
                  {v.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="td-actions">
                <button onClick={() => handleEdit(v.slug)} className="btn-action">Edit</button>
                <button onClick={() => { setImageVenue(v); setShowImages(true); }} className="btn-action">Images</button>
                <button
                  onClick={() => handleToggleStatus(v)}
                  className={`btn-action ${v.isActive ? "btn-action-warn" : "btn-action-success"}`}
                >
                  {v.isActive ? "Deactivate" : "Activate"}
                </button>
              </td>
            </tr>
          ))}
          {filteredVenues.length === 0 && (
            <tr><td colSpan={7} className="td-empty">No venues found{search ? " matching your search" : ""}.</td></tr>
          )}
        </tbody>
      </table>

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingVenue(null); }}
        title={editingVenue ? `Edit: ${editingVenue.name}` : "Create new venue"}
      >
        <VenueForm
          venue={editingVenue}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingVenue(null); }}
        />
      </Modal>

      <Modal
        isOpen={showImages}
        onClose={() => { setShowImages(false); setImageVenue(null); }}
        title={imageVenue ? `Images: ${imageVenue.name}` : "Venue images"}
      >
        {imageVenue && (
          <VenueImageManager venueId={imageVenue.id} venueName={imageVenue.name} />
        )}
      </Modal>
    </div>
  );
}
