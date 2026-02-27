// orders.js — Order management

let orders = [];

async function loadOrders() {
  const tbody = document.getElementById('orders-tbody');
  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px"><div class="loader"></div></td></tr>`;
  try {
    const data = await OrderAPI.getAll();
    orders = data.orders || sampleOrders();
  } catch { orders = sampleOrders(); }
  renderOrdersTable();
}

function renderOrdersTable() {
  const tbody = document.getElementById('orders-tbody');
  if (!orders.length) { tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#999;padding:20px">No orders found</td></tr>`; return; }
  tbody.innerHTML = orders.map(o => `
    <tr>
      <td><strong>#${o.id}</strong></td>
      <td>${o.customer_name}<br><small style="color:#888">${o.phone||''}</small></td>
      <td><strong>₹${o.total}</strong></td>
      <td>
        <select onchange="updateOrderStatus('${o.id}', this.value)" style="padding:4px 8px;border-radius:6px;border:1px solid #ddd;font-size:0.82rem">
          ${['pending','confirmed','processing','shipped','out_for_delivery','delivered','cancelled'].map(s => `<option value="${s}" ${o.status===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </td>
      <td style="font-size:0.85rem">${o.created_at||'—'}</td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="viewOrder('${o.id}')">View</button>
        <a class="btn btn-sm btn-success" href="https://wa.me/${o.phone||'919876543210'}" target="_blank">💬</a>
      </td>
    </tr>`).join('');
}

async function updateOrderStatus(id, status) {
  try {
    await OrderAPI.update(id, { status });
    const o = orders.find(x => x.id == id);
    if (o) o.status = status;
    toast(`Order #${id} → ${status}`, 'success');
  } catch {
    toast('Status updated locally (backend offline)', 'success');
    const o = orders.find(x => x.id == id);
    if (o) o.status = status;
  }
}

function viewOrder(id) {
  const o = orders.find(x => x.id == id);
  if (!o) return;
  const items = (o.items || []).map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td>₹${i.price}</td><td>₹${i.price*i.qty}</td></tr>`).join('') ||
    `<tr><td colspan="4" style="color:#999">No item details</td></tr>`;
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:2000;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.innerHTML = `
    <div class="modal" style="max-width:600px">
      <div class="modal-header">
        <h3>Order #${o.id}</h3>
        <span class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</span>
      </div>
      <p><strong>Customer:</strong> ${o.customer_name}</p>
      <p><strong>Phone:</strong> ${o.phone||'—'}</p>
      <p><strong>Address:</strong> ${o.address||'—'}</p>
      <p><strong>Status:</strong> <span class="status status-${o.status}">${o.status}</span></p>
      <hr style="margin:12px 0">
      <table class="admin-table" style="margin-bottom:14px">
        <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
        <tbody>${items}</tbody>
      </table>
      <p><strong>Subtotal:</strong> ₹${o.subtotal||o.total}</p>
      <p><strong>Delivery:</strong> ₹${o.delivery||0}</p>
      <p style="font-size:1.1rem"><strong>Total:</strong> ₹${o.total}</p>
      <div style="display:flex;gap:10px;margin-top:16px">
        <a class="btn btn-success" href="https://wa.me/${o.phone}" target="_blank">💬 WhatsApp Customer</a>
        <button class="btn btn-primary" onclick="window.print()">🖨️ Print</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

window.loadOrders = loadOrders;
window.updateOrderStatus = updateOrderStatus;
window.viewOrder = viewOrder;
