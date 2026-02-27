// cart.js — Cart page logic

document.addEventListener('DOMContentLoaded', renderCart);

function renderCart() {
  const cart = getCart();
  const container = document.getElementById('cart-items');
  const emptyState = document.getElementById('cart-empty');
  const summary = document.getElementById('cart-summary');

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    if (summary) summary.style.display = 'none';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (summary) summary.style.display = 'block';

  container.innerHTML = cart.map(item => `
    <div class="cart-item" id="cart-item-${item.id}">
      <div class="cart-item-img">
        ${item.image ? `<img src="${item.image}" alt="${item.name}">` : '🐠'}
      </div>
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${item.price}</div>
        <div class="qty-control">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
          <span class="qty-display" id="qty-${item.id}">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
        </div>
      </div>
      <div>
        <div class="cart-item-price">₹${(item.price * item.qty).toFixed(2)}</div>
        <div class="cart-remove mt-2" onclick="removeItem(${item.id})" title="Remove">🗑️</div>
      </div>
    </div>
  `).join('');

  updateSummary();
}

function changeQty(id, delta) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === id);
  if (idx < 0) return;
  cart[idx].qty = Math.max(1, cart[idx].qty + delta);
  saveCart(cart);
  renderCart();
}

function removeItem(id) {
  removeFromCart(id);
  renderCart();
  showToast('Item removed from cart', 'info');
}

function updateSummary() {
  const cart = getCart();
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const delivery = subtotal > 500 ? 0 : 60;
  const total = subtotal + delivery;

  const el = (id) => document.getElementById(id);
  if (el('subtotal')) el('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
  if (el('delivery')) el('delivery').textContent = delivery === 0 ? 'FREE' : `₹${delivery}`;
  if (el('total')) el('total').textContent = `₹${total.toFixed(2)}`;
}

window.changeQty = changeQty;
window.removeItem = removeItem;
