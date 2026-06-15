import { useState, useEffect } from "react";
import api from "../../api/client";

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState([]);

  useEffect(() => {
    api.get("/venues").then(({ data }) => setVenues(data.data));
  }, []);

  return (
    <div className="admin-page">
      <h1>Venues</h1>
      <table className="admin-table">
        <thead><tr><th>Name</th><th>Category</th><th>Price/hr</th><th>Status</th></tr></thead>
        <tbody>
          {venues.map((v) => (
            <tr key={v.id}>
              <td>{v.name}</td>
              <td>{v.category?.name}{v.sportType ? ` / ${v.sportType.name}` : ""}</td>
              <td>R{v.pricePerHour}</td>
              <td>{v.isActive ? "Active" : "Inactive"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
