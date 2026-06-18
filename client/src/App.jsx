import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Layout
import MainLayout from "./components/layout/MainLayout";
import AdminLayout from "./components/layout/AdminLayout";

// Auth pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Public pages
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";

// User pages
import DashboardPage from "./pages/dashboard/DashboardPage";
import ProfilePage from "./pages/dashboard/ProfilePage";
import PaymentHistoryPage from "./pages/dashboard/PaymentHistoryPage";
import CategoriesPage from "./pages/venues/CategoriesPage";
import VenueListPage from "./pages/venues/VenueListPage";
import VenueDetailPage from "./pages/venues/VenueDetailPage";
import BookingPage from "./pages/booking/BookingPage";
import MyBookingsPage from "./pages/booking/MyBookingsPage";

// Admin pages
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminVenuesPage from "./pages/admin/AdminVenuesPage";
import AdminBookingsPage from "./pages/admin/AdminBookingsPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";

// Route guards
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== "ADMIN") return <Navigate to="/dashboard" />;
  return children;
}

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/venues/:categorySlug" element={<VenueListPage />} />
        <Route path="/venues/:categorySlug/:sportSlug" element={<VenueListPage />} />
        <Route path="/venue/:slug" element={<VenueDetailPage />} />

        {/* Authenticated user routes */}
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/payment-history" element={<PrivateRoute><PaymentHistoryPage /></PrivateRoute>} />
        <Route path="/book/:slug" element={<PrivateRoute><BookingPage /></PrivateRoute>} />
        <Route path="/my-bookings" element={<PrivateRoute><MyBookingsPage /></PrivateRoute>} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="venues" element={<AdminVenuesPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
      </Route>

      {/* 404 catch-all */}
      <Route element={<MainLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
