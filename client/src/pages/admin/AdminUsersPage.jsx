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
  const [showCreate, setShowCreate] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [createForm, setCreateForm] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
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
      email: user.email,
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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreatingUser(true);
    try {
      await api.post("/admin/users", createForm);
      toast.success("User account created with temporary password.");
      setShowCreate(false);
      setCreateForm({ firstName: "", lastName: "", email: "", phone: "" });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create user.");
    } finally {
      setCreatingUser(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Users</h1>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>+ Create user</button>
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
              <label>First name *</label>
              <input
                required
                value={editForm.firstName}
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
              />
            </div>
            <div>
              <label>Last name *</label>
              <input
                required
                value={editForm.lastName}
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
              />
            </div>
          </div>

          <label>Email *</label>
          <input
            type="email"
            required
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
          />

          <label>Phone</label>
          <input
            type="tel"
            value={editForm.phone}
            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            placeholder="0XX XXX XXXX"
            pattern="^(\+27|0)[0-9\s\-]{9,12}$"
            title="South African phone number: 0XX XXX XXXX or +27XX XXX XXXX"
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

      {/* Create user modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create new user"
      >
        <form onSubmit={handleCreateUser} className="admin-form">
          <div className="form-row">
            <div>
              <label>First name *</label>
              <input required value={createForm.firstName} onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })} />
            </div>
            <div>
              <label>Last name *</label>
              <input required value={createForm.lastName} onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })} />
            </div>
          </div>

          <label>Email *</label>
          <input type="email" required value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} />

          <label>Phone</label>
          <input
            type="tel"
            value={createForm.phone}
            onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
            placeholder="0XX XXX XXXX"
            pattern="^(\+27|0)[0-9\s\-]{9,12}$"
            title="South African phone number: 0XX XXX XXXX or +27XX XXX XXXX"
          />

          <p className="form-note">The account will be created with a temporary password: <strong>welcome123</strong></p>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={creatingUser}>
              {creatingUser ? "Creating..." : "Create user"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
