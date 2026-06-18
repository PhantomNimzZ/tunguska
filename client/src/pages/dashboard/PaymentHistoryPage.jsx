import { Link } from "react-router-dom";

export default function PaymentHistoryPage() {
  return (
    <div className="page placeholder-page">
      <div className="placeholder-card">
        <div className="placeholder-icon">💳</div>
        <h1>Payment history</h1>
        <p>Payment tracking and history will be available once the payment gateway is integrated in the production release.</p>
        <p className="placeholder-sub">In the meantime, you can view payment status on your individual bookings.</p>
        <Link to="/my-bookings" className="btn-primary">View my bookings</Link>
      </div>
    </div>
  );
}
