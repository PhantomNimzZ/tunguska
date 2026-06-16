import { useState, useEffect } from "react";
import api from "../../api/client";
import Modal from "../../components/common/Modal";
import toast from "react-hot-toast";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [showCatForm, setShowCatForm] = useState(false);
  const [showSportForm, setShowSportForm] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [editingSport, setEditingSport] = useState(null);
  const [selectedCatId, setSelectedCatId] = useState(null);

  const [catForm, setCatForm] = useState({ name: "", slug: "", description: "", icon: "", sortOrder: 0 });
  const [sportForm, setSportForm] = useState({ name: "", slug: "", description: "", icon: "", sortOrder: 0, categoryId: "" });

  const fetchCategories = () => {
    api.get("/categories").then(({ data }) => setCategories(data.data));
  };

  useEffect(fetchCategories, []);

  // ── Category handlers ──────────────────────────

  const openNewCategory = () => {
    setEditingCat(null);
    setCatForm({ name: "", slug: "", description: "", icon: "", sortOrder: categories.length + 1 });
    setShowCatForm(true);
  };

  const openEditCategory = (cat) => {
    setEditingCat(cat);
    setCatForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      icon: cat.icon || "",
      sortOrder: cat.sortOrder,
    });
    setShowCatForm(true);
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCat) {
        await api.put(`/admin/categories/${editingCat.id}`, catForm);
        toast.success("Category updated.");
      } else {
        await api.post("/admin/categories", catForm);
        toast.success("Category created.");
      }
      setShowCatForm(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save category.");
    }
  };

  const updateCatName = (name) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    setCatForm((prev) => ({ ...prev, name, slug: editingCat ? prev.slug : slug }));
  };

  // ── Sport type handlers ────────────────────────

  const openNewSport = (categoryId) => {
    setEditingSport(null);
    const cat = categories.find((c) => c.id === categoryId);
    const count = cat?.sportTypes?.length || 0;
    setSportForm({ name: "", slug: "", description: "", icon: "", sortOrder: count + 1, categoryId });
    setShowSportForm(true);
  };

  const openEditSport = (sport, categoryId) => {
    setEditingSport(sport);
    setSportForm({
      name: sport.name,
      slug: sport.slug,
      description: sport.description || "",
      icon: sport.icon || "",
      sortOrder: sport.sortOrder,
      categoryId,
    });
    setShowSportForm(true);
  };

  const saveSportType = async (e) => {
    e.preventDefault();
    try {
      if (editingSport) {
        await api.put(`/admin/sport-types/${editingSport.id}`, sportForm);
        toast.success("Sport type updated.");
      } else {
        await api.post("/admin/sport-types", sportForm);
        toast.success("Sport type created.");
      }
      setShowSportForm(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save sport type.");
    }
  };

  const updateSportName = (name) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    setSportForm((prev) => ({ ...prev, name, slug: editingSport ? prev.slug : slug }));
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Categories & Sport Types</h1>
        <button className="btn-primary" onClick={openNewCategory}>+ Add category</button>
      </div>

      <div className="categories-admin-grid">
        {categories.map((cat) => (
          <div key={cat.id} className="category-admin-card">
            <div className="category-admin-header">
              <div>
                <h3>{cat.name}</h3>
                <span className="td-sub">/{cat.slug} · {cat._count?.venues || 0} venues</span>
              </div>
              <div className="td-actions">
                <button onClick={() => openEditCategory(cat)} className="btn-action">Edit</button>
              </div>
            </div>

            {cat.description && <p className="category-admin-desc">{cat.description}</p>}

            {cat.sportTypes && cat.sportTypes.length > 0 && (
              <div className="sport-types-list">
                <h4>Sport types</h4>
                {cat.sportTypes.map((st) => (
                  <div key={st.id} className="sport-type-row">
                    <span>{st.name}</span>
                    <button onClick={() => openEditSport(st, cat.id)} className="btn-action">Edit</button>
                  </div>
                ))}
              </div>
            )}

            {cat.slug === "sports" && (
              <button
                className="btn-secondary btn-sm"
                onClick={() => openNewSport(cat.id)}
              >
                + Add sport type
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Category form modal */}
      <Modal
        isOpen={showCatForm}
        onClose={() => setShowCatForm(false)}
        title={editingCat ? `Edit: ${editingCat.name}` : "Create new category"}
      >
        <form onSubmit={saveCategory} className="admin-form">
          <label>Category name *</label>
          <input
            required
            value={catForm.name}
            onChange={(e) => updateCatName(e.target.value)}
            placeholder="e.g. Swimming Pools"
          />

          <label>URL slug</label>
          <input
            value={catForm.slug}
            onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
          />

          <label>Description</label>
          <textarea
            rows={2}
            value={catForm.description}
            onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
            placeholder="Brief description of this venue category"
          />

          <div className="form-row">
            <div>
              <label>Icon identifier</label>
              <input
                value={catForm.icon}
                onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })}
                placeholder="e.g. building, trophy"
              />
            </div>
            <div>
              <label>Sort order</label>
              <input
                type="number"
                value={catForm.sortOrder}
                onChange={(e) => setCatForm({ ...catForm, sortOrder: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowCatForm(false)}>Cancel</button>
            <button type="submit" className="btn-primary">{editingCat ? "Update" : "Create"}</button>
          </div>
        </form>
      </Modal>

      {/* Sport type form modal */}
      <Modal
        isOpen={showSportForm}
        onClose={() => setShowSportForm(false)}
        title={editingSport ? `Edit: ${editingSport.name}` : "Add sport type"}
      >
        <form onSubmit={saveSportType} className="admin-form">
          <label>Sport name *</label>
          <input
            required
            value={sportForm.name}
            onChange={(e) => updateSportName(e.target.value)}
            placeholder="e.g. Basketball"
          />

          <label>URL slug</label>
          <input
            value={sportForm.slug}
            onChange={(e) => setSportForm({ ...sportForm, slug: e.target.value })}
          />

          <label>Description</label>
          <textarea
            rows={2}
            value={sportForm.description}
            onChange={(e) => setSportForm({ ...sportForm, description: e.target.value })}
          />

          <div className="form-row">
            <div>
              <label>Icon identifier</label>
              <input
                value={sportForm.icon}
                onChange={(e) => setSportForm({ ...sportForm, icon: e.target.value })}
              />
            </div>
            <div>
              <label>Sort order</label>
              <input
                type="number"
                value={sportForm.sortOrder}
                onChange={(e) => setSportForm({ ...sportForm, sortOrder: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowSportForm(false)}>Cancel</button>
            <button type="submit" className="btn-primary">{editingSport ? "Update" : "Create"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
