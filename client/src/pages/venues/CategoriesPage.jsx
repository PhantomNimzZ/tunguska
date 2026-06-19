import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import BackNav from "../../components/common/BackNav";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get("/categories").then(({ data }) => setCategories(data.data));
  }, []);

  return (
    <div className="page">
      <BackNav links={[{ label: "Venues" }]} />
      <h1>Browse venues</h1>
      <div className="category-grid">
        {categories.map((cat) => (
          <Link key={cat.id} to={`/venues/${cat.slug}`} className="category-card">
            <h2>{cat.name}</h2>
            <p>{cat.description}</p>
            <span className="venue-count">{cat._count?.venues || 0} venues</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
