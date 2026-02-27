// api.js — All API calls to backend

const API_BASE = window.API_BASE || 'https://api.mvsaqua.com'; // Update with your backend URL

const API = {
  async get(endpoint) {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
  },
  async post(endpoint, data) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
  },
  async put(endpoint, data) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async delete(endpoint) {
    const res = await fetch(`${API_BASE}${endpoint}`, { method: 'DELETE' });
    return res.json();
  }
};

// ---- Products ----
const ProductAPI = {
  getAll: (params = '') => API.get(`/product.php?${params}`),
  getOne: (id) => API.get(`/product.php?id=${id}`),
  create: (data) => API.post('/product.php', data),
  update: (id, data) => API.put(`/product.php?id=${id}`, data),
  delete: (id) => API.delete(`/product.php?id=${id}`)
};

// ---- Orders ----
const OrderAPI = {
  getAll: () => API.get('/order.php'),
  getOne: (id) => API.get(`/order.php?id=${id}`),
  create: (data) => API.post('/order.php', data),
  update: (id, data) => API.put(`/order.php?id=${id}`, data)
};

// ---- Offers ----
const OfferAPI = {
  getAll: () => API.get('/offers.php'),
  create: (data) => API.post('/offers.php', data),
  update: (id, data) => API.put(`/offers.php?id=${id}`, data),
  delete: (id) => API.delete(`/offers.php?id=${id}`)
};

// ---- Stock ----
const StockAPI = {
  getAll: () => API.get('/stock.php'),
  update: (id, data) => API.put(`/stock.php?id=${id}`, data)
};

// ---- Invoice ----
const InvoiceAPI = {
  getAll: () => API.get('/invoice.php'),
  getOne: (id) => API.get(`/invoice.php?id=${id}`),
  create: (data) => API.post('/invoice.php', data)
};

// ---- Tracking ----
const TrackingAPI = {
  track: (orderId) => API.get(`/tracking.php?order_id=${orderId}`)
};

window.ProductAPI = ProductAPI;
window.OrderAPI = OrderAPI;
window.OfferAPI = OfferAPI;
window.StockAPI = StockAPI;
window.InvoiceAPI = InvoiceAPI;
window.TrackingAPI = TrackingAPI;
