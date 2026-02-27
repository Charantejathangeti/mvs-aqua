// tracking.js — Order tracking page

document.addEventListener('DOMContentLoaded', () => {
  // Pre-fill from URL params
  const params = new URLSearchParams(location.search);
  const orderId = params.get('order');
  if (orderId) {
    const input = document.getElementById('track-input');
    if (input) { input.value = orderId; trackOrder(); }
  }

  const form = document.getElementById('track-form');
  if (form) form.addEventListener('submit', (e) => { e.preventDefault(); trackOrder(); });
});

async function trackOrder() {
  const input = document.getElementById('track-input');
  const result = document.getElementById('track-result');
  if (!input || !result) return;

  const orderId = input.value.trim();
  if (!orderId) { showToast('Enter an Order ID', 'warning'); return; }

  result.innerHTML = `<div style="text-align:center;padding:30px"><div class="loader"></div><p style="margin-top:12px">Tracking your order...</p></div>`;

  try {
    const data = await TrackingAPI.track(orderId);
    if (!data.order) { result.innerHTML = `<div class="alert alert-error">Order not found. Please check your Order ID.</div>`; return; }

    const steps = [
      { key: 'pending', label: 'Order Placed', icon: '📋' },
      { key: 'confirmed', label: 'Confirmed', icon: '✅' },
      { key: 'processing', label: 'Processing', icon: '📦' },
      { key: 'shipped', label: 'Shipped', icon: '🚚' },
      { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🛵' },
      { key: 'delivered', label: 'Delivered', icon: '🎉' }
    ];

    const currentIdx = steps.findIndex(s => s.key === data.order.status);

    result.innerHTML = `
      <div class="card" style="padding:28px">
        <h3 style="color:var(--primary);margin-bottom:4px">Order #${data.order.id}</h3>
        <p style="color:#666;margin-bottom:24px">Customer: ${data.order.customer_name}</p>
        <div class="tracking-steps">
          ${steps.map((s, i) => `
            <div class="track-step ${i <= currentIdx ? 'done' : ''} ${i === currentIdx ? 'active' : ''}">
              <div class="track-icon">${s.icon}</div>
              <div class="track-label">${s.label}</div>
            </div>
          `).join('')}
        </div>
        ${data.tracking_number ? `<div class="alert alert-info mt-3">Tracking Number: <strong>${data.tracking_number}</strong> | Courier: ${data.courier || 'Standard'}</div>` : ''}
        <div class="mt-3">
          <strong>Items Ordered:</strong>
          <ul style="margin-top:8px;padding-left:20px">
            ${(data.order.items||[]).map(i => `<li>${i.name} × ${i.qty} — ₹${(i.price*i.qty).toFixed(2)}</li>`).join('')}
          </ul>
        </div>
        <div class="summary-total mt-2">Total Paid: ₹${data.order.total}</div>
      </div>
    `;

    // Inject step CSS dynamically if not in stylesheet
    if (!document.getElementById('track-css')) {
      const style = document.createElement('style');
      style.id = 'track-css';
      style.textContent = `
        .tracking-steps { display:flex; gap:0; margin-bottom:24px; flex-wrap:wrap; }
        .track-step { flex:1; text-align:center; position:relative; min-width:80px; }
        .track-step:not(:last-child)::after {
          content:''; position:absolute; top:18px; left:50%; width:100%;
          height:3px; background:#ddd; z-index:0;
        }
        .track-step.done:not(:last-child)::after { background:var(--secondary); }
        .track-icon { width:40px; height:40px; border-radius:50%; background:#eee; font-size:1.2rem;
          display:flex; align-items:center; justify-content:center; margin:0 auto 8px; position:relative; z-index:1; }
        .track-step.done .track-icon { background:var(--secondary); }
        .track-step.active .track-icon { background:var(--primary); box-shadow:0 0 0 4px rgba(0,51,102,0.2); }
        .track-label { font-size:0.78rem; color:#666; font-weight:600; }
        .track-step.done .track-label, .track-step.active .track-label { color:var(--primary); }
      `;
      document.head.appendChild(style);
    }
  } catch (err) {
    result.innerHTML = `<div class="alert alert-error">Could not fetch tracking info. Please try again.</div>`;
  }
}

window.trackOrder = trackOrder;
