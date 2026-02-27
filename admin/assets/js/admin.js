// admin.js — Core admin logic, auth, navigation

const ADMIN_CREDS = { username: 'admin', password: 'admin123' }; // Change in production!

let isLoggedIn = false;
let currentSection = 'dashboard';

// ---- Auth ----
document.addEventListener('DOMContentLoaded', () => {
  const token = sessionStorage.getItem('mvs_admin_token');
  if (token === 'authenticated') {
    showAdmin();
  }
  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('last-updated').textContent = 'Last refresh: ' + new Date().toLocaleTimeString();
});

function handleLogin(e) {
  e.preventDefault();
  const user = document.getElementById('login-user').value.trim();
  const pass = document.getElementById('login-pass').value;
  if (user === ADMIN_CREDS.username && pass === ADMIN_CREDS.password) {
    sessionStorage.setItem('mvs_admin_token', 'authenticated');
    showAdmin();
  } else {
    toast('Invalid credentials', 'error');
  }
}

function showAdmin() {
  isLoggedIn = true;
  document.getElementById('login-gate').style.display = 'none';
  showSection('dashboard');
  loadDashboard();
  setInterval(refreshDashboard, 30000); // Auto-refresh every 30s
}

function logout() {
  sessionStorage.removeItem('mvs_admin_token');
  location.reload();
}

// ---- Navigation ----
function showSection(name) {
  document.querySelectorAll('.section-content').forEach(s => s.style.display = 'none');
  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));

  const el = document.getElementById(`section-${name}`);
  if (el) el.style.display = 'block';
  const nav = document.getElementById(`nav-${name}`);
  if (nav) nav.classList.add('active');

  const titles = { dashboard:'📊 Dashboard', products:'🐠 Products', stock:'📦 Stock', offers:'🎁 Offers', orders:'🛒 Orders', invoices:'🧾 Invoices' };
  document.getElementById('page-title').textContent = titles[name] || name;
  currentSection = name;

  // Load section data
  if (name === 'products') loadProducts();
  else if (name === 'stock') loadStock();
  else if (name === 'offers') loadOffers();
  else if (name === 'orders') loadOrders();
  else if (name === 'invoices') loadInvoices();
}

// ---- Dashboard ----
async function loadDashboard() {
  try {
    const [pd, od] = await Promise.allSettled([ProductAPI.getAll(), OrderAPI.getAll()]);
    const products = pd.value?.products || sampleProducts();
    const orders = od.value?.orders || sampleOrders();

    const revenue = orders.reduce((s, o) => s + (parseFloat(o.total) || 0), 0);
    const lowStock = products.filter(p => p.stock <= 5).length;

    document.getElementById('stat-products').textContent = products.length;
    document.getElementById('stat-orders').textContent = orders.length;
    document.getElementById('stat-revenue').textContent = `₹${revenue.toLocaleString()}`;
    document.getElementById('stat-lowstock').textContent = lowStock;

    // Recent orders table
    const recentOrders = orders.slice(0, 5);
    document.getElementById('recent-orders').innerHTML = recentOrders.length ? `
      <table class="admin-table">
        <thead><tr><th>ID</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>${recentOrders.map(o => `
          <tr>
            <td>#${o.id}</td>
            <td>${o.customer_name}</td>
            <td>₹${o.total}</td>
            <td><span class="status status-${o.status||'pending'}">${o.status||'pending'}</span></td>
          </tr>`).join('')}</tbody>
      </table>` : '<p style="color:#999;text-align:center;padding:20px">No orders yet</p>';

    // Low stock
    const lowItems = products.filter(p => p.stock <= 5);
    document.getElementById('low-stock-list').innerHTML = lowItems.length ? lowItems.map(p => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #f0f2f5">
        <span>${p.emoji||'🐟'} ${p.name}</span>
        <span class="${p.stock===0 ? 'status status-cancelled' : 'status status-pending'}">${p.stock === 0 ? 'OUT' : p.stock+' left'}</span>
      </div>`).join('') :
      '<p style="color:#22c55e;text-align:center;padding:20px">✅ All items sufficiently stocked!</p>';

  } catch(e) { console.error('Dashboard load error', e); }
}

function refreshDashboard() {
  document.getElementById('last-updated').textContent = 'Last refresh: ' + new Date().toLocaleTimeString();
  if (currentSection === 'dashboard') loadDashboard();
}

// ---- Utilities ----
function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

function filterTable(tableId, inputId) {
  const val = document.getElementById(inputId).value.toLowerCase();
  const rows = document.querySelectorAll(`#${tableId} tbody tr`);
  rows.forEach(r => r.style.display = r.textContent.toLowerCase().includes(val) ? '' : 'none');
}

function filterTableSelect(tableId, select, colIdx) {
  const val = select.value.toLowerCase();
  const rows = document.querySelectorAll(`#${tableId} tbody tr`);
  rows.forEach(r => {
    const cell = r.cells[colIdx];
    r.style.display = !val || (cell && cell.textContent.toLowerCase().includes(val)) ? '' : 'none';
  });
}

// ---- Sample data (fallback when backend not connected) ----
function sampleProducts() {
  return [
    { id:1, name:'Betta Fish', price:120, original_price:150, stock:10, category:'fish', emoji:'🐟', featured:1 },
    { id:2, name:'Neon Tetra (10pc)', price:200, stock:20, category:'fish', emoji:'🐠', featured:1 },
    { id:3, name:'Java Fern', price:80, stock:5, category:'plants', emoji:'🌿', featured:0 },
    { id:4, name:'LED Aquarium Light', price:450, stock:3, category:'accessories', emoji:'💡', featured:1 },
    { id:5, name:'Tetra Fish Food', price:95, stock:0, category:'food', emoji:'🥣', featured:0 }
  ];
}

function sampleOrders() {
  return [
    { id:'ORD001', customer_name:'Rajesh Kumar', total:320, status:'delivered', created_at:'2025-01-20' },
    { id:'ORD002', customer_name:'Priya Sharma', total:780, status:'shipped', created_at:'2025-01-21' },
    { id:'ORD003', customer_name:'Anand Rao', total:150, status:'confirmed', created_at:'2025-01-22' },
    { id:'ORD004', customer_name:'Meena Patel', total:520, status:'pending', created_at:'2025-01-23' }
  ];
}

window.showSection = showSection;
window.closeModal = closeModal;
window.toast = toast;
window.filterTable = filterTable;
window.filterTableSelect = filterTableSelect;
window.logout = logout;
window.sampleProducts = sampleProducts;
window.sampleOrders = sampleOrders;
