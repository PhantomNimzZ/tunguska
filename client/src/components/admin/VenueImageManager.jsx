import { useState, useEffect } from "react";
import api from "../../api/client";
import toast from "react-hot-toast";

export default function VenueImageManager({ venueId, venueName }) {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const fetchImages = () => {
    if (!venueId) return;
    api.get(`/admin/venues/${venueId}/images`).then(({ data }) => setImages(data.data));
  };

  useEffect(fetchImages, [venueId]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    try {
      await api.post(`/admin/venues/${venueId}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Image uploaded.");
      fetchImages();
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const setPrimary = async (imageId) => {
    try {
      await api.patch(`/admin/venues/${venueId}/images/${imageId}/primary`);
      toast.success("Primary image updated.");
      fetchImages();
    } catch {
      toast.error("Failed to update primary image.");
    }
  };

  const deleteImage = async (imageId) => {
    if (!confirm("Delete this image?")) return;
    try {
      await api.delete(`/admin/venues/${venueId}/images/${imageId}`);
      toast.success("Image deleted.");
      fetchImages();
    } catch {
      toast.error("Failed to delete image.");
    }
  };

  return (
    <div className="image-manager">
      <div className="image-manager-header">
        <h3>Venue images</h3>
        <label className={`btn-secondary btn-sm upload-btn ${uploading ? "uploading" : ""}`}>
          {uploading ? "Uploading..." : "+ Upload image"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleUpload}
            disabled={uploading}
            hidden
          />
        </label>
      </div>

      {images.length === 0 ? (
        <p className="td-sub">No images uploaded yet.</p>
      ) : (
        <div className="image-grid">
          {images.map((img) => (
            <div key={img.id} className={`image-card ${img.isPrimary ? "is-primary" : ""}`}>
              <img src={img.url} alt={img.altText || venueName} />
              {img.isPrimary && <span className="primary-badge">Primary</span>}
              <div className="image-card-actions">
                {!img.isPrimary && (
                  <button onClick={() => setPrimary(img.id)} className="btn-action btn-action-success">
                    Set primary
                  </button>
                )}
                <button onClick={() => deleteImage(img.id)} className="btn-action btn-action-warn">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
