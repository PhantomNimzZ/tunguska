import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="page auth-page">
      <div className="auth-card">
        <h1>Create account</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div><label>First name</label><input required value={form.firstName} onChange={update("firstName")} /></div>
            <div><label>Last name</label><input required value={form.lastName} onChange={update("lastName")} /></div>
          </div>
          <label>Email</label>
          <input type="email" required value={form.email} onChange={update("email")} />
          <label>Phone</label>
          <input type="tel" value={form.phone} onChange={update("phone")} />
          <label>Password</label>
          <input type="password" required minLength={6} value={form.password} onChange={update("password")} />
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? "Creating..." : "Sign up"}</button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}
