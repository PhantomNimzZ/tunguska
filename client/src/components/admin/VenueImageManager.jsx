import { useState, useEffect } from "react";
import api from "../../api/client";
import { getImageUrl } from "../../utils/imageUrl";
import toast from "react-hot-toast";

export default function VenueImageManager({ venueId, venueName }) {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchImages = () => {
    if (!venueId) return;
    api.get(`/admin/venues/${venueId}/images`).then(({ data }) => setImages(data.data));
  };

  useEffect(fetchImages, [venueId]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target.result);
      setPreviewFile(file);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const confirmUpload = async () => {
    if (!previewFile) return;

    const formData = new FormData();
    formData.append("image", previewFile);

    setUploading(true);
    try {
      await api.post(`/admin/venues/${venueId}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Image uploaded.");
      fetchImages();
      cancelPreview();
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const cancelPreview = () => {
    setPreview(null);
    setPreviewFile(null);
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

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/venues/${venueId}/images/${deleteTarget}`);
      toast.success("Image deleted.");
      setDeleteTarget(null);
      fetchImages();
    } catch {
      toast.error("Failed to delete image.");
    }
  };

  return (
    <div className="image-manager">
      <div className="image-manager-header">
        <h3>Venue images</h3>
        {!preview && (
          <label className="btn-secondary btn-sm upload-btn">
            + Select image
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              hidden
            />
          </label>
        )}
      </div>

      {/* Image preview before upload */}
      {preview && (
        <div className="image-preview-section">
          <img src={preview} alt="Preview" className="image-preview-img" />
          <p className="image-preview-name">{previewFile?.name}</p>
          <div className="image-preview-actions">
            <button className="btn-secondary btn-sm" onClick={cancelPreview} disabled={uploading}>Cancel</button>
            <button className="btn-primary btn-sm" onClick={confirmUpload} disabled={uploading}>
              {uploading ? "Uploading..." : "Save image"}
            </button>
          </div>
        </div>
      )}

      {/* Existing images */}
      {images.length === 0 && !preview ? (
        <p className="td-sub">No images uploaded yet.</p>
      ) : (
        <div className="image-grid">
          {images.map((img) => (
            <div key={img.id} className={`image-card ${img.isPrimary ? "is-primary" : ""}`}>
              <img src={getImageUrl(img.url)} alt={img.altText || venueName} />
              {img.isPrimary && <span className="primary-badge">Primary</span>}
              <div className="image-card-actions">
                {!img.isPrimary && (
                  <button onClick={() => setPrimary(img.id)} className="btn-action btn-action-success">
                    Set primary
                  </button>
                )}
                <button onClick={() => setDeleteTarget(img.id)} className="btn-action btn-action-warn">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="image-delete-confirm">
          <p>Delete this image?</p>
          <div className="image-preview-actions">
            <button className="btn-secondary btn-sm" onClick={() => setDeleteTarget(null)}>Cancel</button>
            <button className="btn-danger btn-sm" onClick={confirmDelete}>Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}
