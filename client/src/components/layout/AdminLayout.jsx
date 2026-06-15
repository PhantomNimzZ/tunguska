import { Outlet, Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link to="/" className="logo sidebar-logo">
          <span className="logo-mark">T</span>
          <span className="logo-text">Admin</span>
        </Link>

        <nav className="sidebar-nav">
          <NavLink to="/admin" end className="sidebar-link">Dashboard</NavLink>
          <NavLink to="/admin/bookings" className="sidebar-link">Bookings</NavLink>
          <NavLink to="/admin/venues" className="sidebar-link">Venues</NavLink>
          <NavLink to="/admin/users" className="sidebar-link">Users</NavLink>
        </nav>

        <div className="sidebar-footer">
          <p className="sidebar-user">{user?.firstName} {user?.lastName}</p>
          <button onClick={logout} className="btn-logout">Logout</button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
