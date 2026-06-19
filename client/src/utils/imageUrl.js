// In development, images are proxied through Vite (/uploads/...)
// In production, images are served from the Render backend
const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "";

export function getImageUrl(path) {
  if (!path) return null;
  // If already a full URL (e.g. https://...), return as-is
  if (path.startsWith("http")) return path;
  // Prepend the API origin for production
  return `${API_ORIGIN}${path}`;
}
