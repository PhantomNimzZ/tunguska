import { useState, useEffect } from "react";
import api from "../../api/client";
import Modal from "../../components/common/Modal";
import VenueForm from "../../components/admin/VenueForm";
import toast from "react-hot-toast";

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);

  const fetchVenues = () => {
    api.get("/admin/venues").then(({ data }) => setVenues(data.data));
  };

  useEffect(fetchVenues, []);

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

  const handleDelete = async (venue) => {
    if (!confirm(`Are you sure you want to deactivate "${venue.name}"? This can be reversed.`)) return;

    try {
      await api.delete(`/admin/venues/${venue.id}`);
      fetchVenues();
      toast.success("Venue deactivated.");
    } catch {
      toast.error("Failed to deactivate venue.");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Venues</h1>
        <button className="btn-primary" onClick={handleCreate}>+ Add venue</button>
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
          {venues.map((v) => (
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
                <button
                  onClick={() => handleToggleStatus(v)}
                  className={`btn-action ${v.isActive ? "btn-action-warn" : "btn-action-success"}`}
                >
                  {v.isActive ? "Deactivate" : "Activate"}
                </button>
              </td>
            </tr>
          ))}
          {venues.length === 0 && (
            <tr><td colSpan={7} className="td-empty">No venues found. Create one to get started.</td></tr>
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
    </div>
  );
}
