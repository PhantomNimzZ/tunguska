import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/client";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);

  const [activeSection, setActiveSection] = useState("profile");

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await api.put("/users/profile", profileForm);
      toast.success("Profile updated.");
      // Update the auth context with new data
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      await api.put("/users/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password updated.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="page profile-page">
      <h1>Manage profile</h1>
      <p className="profile-email">{user?.email}</p>

      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeSection === "profile" ? "active" : ""}`}
          onClick={() => setActiveSection("profile")}
        >
          Personal details
        </button>
        <button
          className={`profile-tab ${activeSection === "password" ? "active" : ""}`}
          onClick={() => setActiveSection("password")}
        >
          Change password
        </button>
      </div>

      {activeSection === "profile" && (
        <div className="profile-card">
          <form onSubmit={handleProfileSave} className="profile-form">
            <div className="form-row">
              <div>
                <label>First name *</label>
                <input
                  required
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                />
              </div>
              <div>
                <label>Last name *</label>
                <input
                  required
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                />
              </div>
            </div>

            <label>Email</label>
            <input type="email" value={user?.email || ""} disabled className="input-disabled" />
            <p className="field-hint">Contact an administrator to change your email address.</p>

            <label>Phone</label>
            <input
              type="tel"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              placeholder="0XX XXX XXXX"
              pattern="^(\+27|0)[0-9\s\-]{9,12}$"
              title="South African phone number: 0XX XXX XXXX or +27XX XXX XXXX"
            />

            <div className="profile-form-actions">
              <button type="submit" className="btn-primary" disabled={savingProfile}>
                {savingProfile ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeSection === "password" && (
        <div className="profile-card">
          <form onSubmit={handlePasswordChange} className="profile-form">
            <label>Current password *</label>
            <input
              type="password"
              required
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            />

            <label>New password *</label>
            <input
              type="password"
              required
              minLength={6}
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            />

            <label>Confirm new password *</label>
            <input
              type="password"
              required
              minLength={6}
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            />

            {passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
              <p className="availability-closed">Passwords do not match.</p>
            )}

            <div className="profile-form-actions">
              <button type="submit" className="btn-primary" disabled={savingPassword || (passwordForm.newPassword !== passwordForm.confirmPassword)}>
                {savingPassword ? "Updating..." : "Update password"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="profile-danger-zone">
        <h3>Account</h3>
        <p>Signed in as <strong>{user?.email}</strong> · Role: {user?.role}</p>
        <button className="btn-danger btn-sm" onClick={logout} style={{ marginTop: "0.75rem" }}>
          Logout
        </button>
      </div>
    </div>
  );
}
