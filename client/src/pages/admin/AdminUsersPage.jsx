import { useState, useEffect } from "react";
import api from "../../api/client";
import Modal from "../../components/common/Modal";
import toast from "react-hot-toast";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    role: "USER",
    isActive: true,
  });

  const fetchUsers = () => {
    const params = {};
    if (search) params.search = search;
    if (roleFilter) params.role = roleFilter;
    api.get("/admin/users", { params }).then(({ data }) => setUsers(data.data));
  };

  useEffect(fetchUsers, [search, roleFilter]);

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || "",
      role: user.role,
      isActive: user.isActive,
    });
    setShowEdit(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/admin/users/${editingUser.id}`, editForm);
      setShowEdit(false);
      setEditingUser(null);
      fetchUsers();
      toast.success("User updated.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update user.");
    }
  };

  const handleToggleStatus = async (user) => {
    const action = user.isActive ? "deactivate" : "reactivate";
    if (!confirm(`Are you sure you want to ${action} ${user.firstName} ${user.lastName}?`)) return;

    try {
      await api.patch(`/admin/users/${user.id}`, { isActive: !user.isActive });
      fetchUsers();
      toast.success(`User ${user.isActive ? "deactivated" : "reactivated"}.`);
    } catch {
      toast.error("Failed to update user.");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Users</h1>
      </div>

      <div className="admin-filters">
        <input
          type="text"
          className="search-input"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filter-bar">
          {["", "USER", "ADMIN"].map((r) => (
            <button
              key={r}
              className={`filter-btn ${roleFilter === r ? "active" : ""}`}
              onClick={() => setRoleFilter(r)}
            >
              {r || "All"}
            </button>
          ))}
        </div>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Bookings</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className={!u.isActive ? "row-inactive" : ""}>
              <td className="td-bold">{u.firstName} {u.lastName}</td>
              <td>{u.email}</td>
              <td>{u.phone || "—"}</td>
              <td>
                <span className={`role-badge ${u.role.toLowerCase()}`}>{u.role}</span>
              </td>
              <td>{u._count?.bookings || 0}</td>
              <td>
                <span className={`status-badge ${u.isActive ? "approved" : "declined"}`}>
                  {u.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td>{new Date(u.createdAt).toLocaleDateString("en-ZA")}</td>
              <td className="td-actions">
                <button onClick={() => handleEdit(u)} className="btn-action">Edit</button>
                <button
                  onClick={() => handleToggleStatus(u)}
                  className={`btn-action ${u.isActive ? "btn-action-warn" : "btn-action-success"}`}
                >
                  {u.isActive ? "Deactivate" : "Activate"}
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr><td colSpan={8} className="td-empty">No users found.</td></tr>
          )}
        </tbody>
      </table>

      <Modal
        isOpen={showEdit}
        onClose={() => { setShowEdit(false); setEditingUser(null); }}
        title={editingUser ? `Edit: ${editingUser.firstName} ${editingUser.lastName}` : "Edit user"}
      >
        <form onSubmit={handleSave} className="admin-form">
          <div className="form-row">
            <div>
              <label>First name</label>
              <input
                required
                value={editForm.firstName}
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
              />
            </div>
            <div>
              <label>Last name</label>
              <input
                required
                value={editForm.lastName}
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
              />
            </div>
          </div>

          <label>Phone</label>
          <input
            value={editForm.phone}
            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
          />

          <label>Role</label>
          <select
            value={editForm.role}
            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
          >
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={editForm.isActive}
              onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
            />
            <span>Account active</span>
          </label>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => { setShowEdit(false); setEditingUser(null); }}>Cancel</button>
            <button type="submit" className="btn-primary">Save changes</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
