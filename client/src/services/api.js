// In dev Vite proxies /api → :5000. In prod set VITE_API_URL to your Render/Railway URL.
// Example: VITE_API_URL=https://leather-hub-api.onrender.com
const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api';
const TOKEN_KEY = 'leather-hub-token';

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.message || 'Something went wrong');
    error.status = res.status;
    throw error;
  }

  return data;
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export const productService = {
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== '' && value !== undefined && value !== null) {
        query.set(key, value);
      }
    });
    return request(`/products?${query.toString()}`);
  },

  getProduct: (id) => request(`/products/${id}`),
};

export const authService = {
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request('/auth/me'),
};

export const orderService = {
  placeOrder: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  myOrders: () => request('/orders'),
  getOrder: (id) => request(`/orders/${id}`),
  submitPayment: (id, upiRef) =>
    request(`/orders/${id}/payment`, { method: 'POST', body: JSON.stringify({ upiRef }) }),
  track: (orderNumber, email) =>
    request('/orders/track', { method: 'POST', body: JSON.stringify({ orderNumber, email }) }),
};

export const adminService = {
  stats: () => request('/admin/stats'),
  orders: (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) q.set(k, v);
    });
    return request(`/admin/orders?${q.toString()}`);
  },
  getOrder: (id) => request(`/admin/orders/${id}`),
  updateStatus: (id, status) =>
    request(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  verifyPayment: (id, verified) =>
    request(`/admin/orders/${id}/payment`, { method: 'PUT', body: JSON.stringify({ verified }) }),
  products: (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) q.set(k, v);
    });
    return request(`/admin/products?${q.toString()}`);
  },
  createProduct: (data) => request('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),
  uploadImage: async (file) => {
    const form = new FormData();
    form.append('image', file);
    const token = localStorage.getItem(TOKEN_KEY);
    const res = await fetch(`${API_BASE}/admin/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Upload failed');
    return data;
  },
};

export const cartService = {
  getCart: () => request('/cart'),
  addItem: (productId, quantity) =>
    request('/cart/items', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
  updateQuantity: (productId, quantity) =>
    request(`/cart/items/${productId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  removeItem: (productId) => request(`/cart/items/${productId}`, { method: 'DELETE' }),
  clearCart: () => request('/cart', { method: 'DELETE' }),
  merge: (items) => request('/cart/merge', { method: 'POST', body: JSON.stringify({ items }) }),
};

export const userService = {
  updateProfile: (data) => request('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
  getAddresses: () => request('/users/addresses'),
  addAddress: (data) => request('/users/addresses', { method: 'POST', body: JSON.stringify(data) }),
  updateAddress: (id, data) => request(`/users/addresses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAddress: (id) => request(`/users/addresses/${id}`, { method: 'DELETE' }),
};