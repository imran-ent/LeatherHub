/**
 * Resolves product image URLs for both single-host and split deploys.
 * - Absolute http(s) or data: URIs pass through.
 * - /uploads/... and /images/... are prefixed with VITE_API_URL when set.
 */
export function getImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  const base = import.meta.env.VITE_API_URL || '';
  if (path.startsWith('/uploads') || path.startsWith('/images')) {
    return base ? `${base}${path}` : path;
  }
  return path;
}
