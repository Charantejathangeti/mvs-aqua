// checkout.js — WhatsApp checkout flow

const WHATSAPP_NUMBER = '919876543210'; // Update with your number

document.addEventListener('DOMContentLoaded', () => {
  renderCheckoutSummary();
  const form = document.getElementById('checkout-form');
  if (form) {
    form.addEventListener('submit', handleCheckout);
  }
});

function renderCheckoutSummary() {
  const cart = getCart();
  const container = document.getElementById('checkout-items');
  if (!container) return;

  if (cart.length === 0) {
    window.location.href = 'cart.html';
    return;
  }

  container.innerHTML = cart.map(i => `
    <div class="summary-row">
      <span>${i.name} × ${i.qty}</span>
      <span>₹${(i.price * i.qty).toFixed(2)}</span>
    </div>
  `).join('');

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = subtotal > 500 ? 0 : 60;
  const total = subtotal + delivery;

  const el = id => document.getElementById(id);
  if (el('co-subtotal')) el('co-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
  if (el('co-delivery')) el('co-delivery').textContent = delivery === 0 ? 'FREE' : `₹${delivery}`;
  if (el('co-total')) el('co-total').textContent = `₹${total.toFixed(2)}`;
}

async function handleCheckout(e) {
  e.preventDefault();
  const form = e.target;
  const name = form.querySelector('#name').value.trim();
  const phone = form.querySelector('#phone').value.trim();
  const address = form.querySelector('#address').value.trim();
  const pincode = form.querySelector('#pincode').value.trim();

  if (!name || !phone || !address || !pincode) {
    showToast('Please fill all required fields', 'error');
    return;
  }

  const cart = getCart();
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = subtotal > 500 ? 0 : 60;
  const total = subtotal + delivery;

  // Save order to backend
  let orderId = 'ORD' + Date.now();
  try {
    const orderData = {
      customer_name: name,
      phone,
      address: `${address}, ${pincode}`,
      items: cart,
      subtotal,
      delivery,
      total,
      status: 'pending'
    };
    const res = await OrderAPI.create(orderData);
    if (res.order_id) orderId = res.order_id;
  } catch (e) {
    console.warn('Order save failed, proceeding with WhatsApp:', e.message);
  }

  // Build WhatsApp message
  const itemsList = cart.map(i => `  • ${i.name} × ${i.qty} = ₹${(i.price*i.qty).toFixed(2)}`).join('\n');
  const message = `🐠 *New Order - MVS Aqua*\n\n` +
    `📋 *Order ID:* ${orderId}\n` +
    `👤 *Name:* ${name}\n` +
    `📞 *Phone:* ${phone}\n` +
    `📍 *Address:* ${address}, ${pincode}\n\n` +
    `🛒 *Items:*\n${itemsList}\n\n` +
    `💰 *Subtotal:* ₹${subtotal.toFixed(2)}\n` +
    `🚚 *Delivery:* ${delivery === 0 ? 'FREE' : '₹'+delivery}\n` +
    `💳 *Total:* ₹${total.toFixed(2)}\n\n` +
    `Please confirm my order and share payment details. Thank you!`;

  const waURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  // Store order ID for confirmation page
  localStorage.setItem('mvs_last_order', orderId);
  clearCart();

  // Open WhatsApp
  window.open(waURL, '_blank');
  window.location.href = `confirmation.html?order=${orderId}`;
}
