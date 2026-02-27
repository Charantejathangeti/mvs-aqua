// script.js — Global utilities & navbar logic

// ---- Toast Notifications ----
function showToast(msg, type = 'info', duration = 3000) {
  const icons = { info: 'ℹ️', success: '✅', error: '❌', warning: '⚠️' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type]||''}</span> ${msg}`;
  document.body.appendChild(el);
  setTimeout(() => { el.style.animation = 'slideOut 0.3s ease forwards'; setTimeout(() => el.remove(), 300); }, duration);
}

// ---- Hamburger Menu ----
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.navbar-nav');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      hamburger.classList.toggle('open');
    });
  }

  // Mark active nav
  const links = document.querySelectorAll('.navbar-nav a');
  links.forEach(link => {
    if (link.href === location.href || location.pathname.endsWith(link.getAttribute('href'))) {
      link.classList.add('active');
    }
  });

  // Load offers ticker
  loadOffersTicker();
  updateCartBadge();
});

// ---- Offers Ticker ----
async function loadOffersTicker() {
  const ticker = document.querySelector('.offers-ticker-inner');
  if (!ticker) return;
  try {
    const data = await OfferAPI.getAll();
    if (data.offers && data.offers.length > 0) {
      const items = data.offers.map(o => `<span>🔥 ${o.title} — ${o.description}</span>`).join('');
      ticker.innerHTML = items + items; // double for seamless loop
    }
  } catch (e) {
    console.warn('Could not load offers:', e.message);
  }
}

// ---- Cart Badge ----
function updateCartBadge() {
  const cart = getCart();
  const badge = document.querySelector('.cart-count');
  if (badge) {
    const total = cart.reduce((sum, i) => sum + i.qty, 0);
    badge.textContent = total;
    badge.style.display = total > 0 ? 'flex' : 'none';
  }
}

// ---- Cart Storage ----
function getCart() {
  return JSON.parse(localStorage.getItem('mvs_cart') || '[]');
}
function saveCart(cart) {
  localStorage.setItem('mvs_cart', JSON.stringify(cart));
  updateCartBadge();
}
function addToCart(product) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === product.id);
  if (idx >= 0) {
    cart[idx].qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart(cart);
  showToast(`${product.name} added to cart!`, 'success');
}
function removeFromCart(id) {
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
}
function clearCart() {
  saveCart([]);
}

window.showToast = showToast;
window.getCart = getCart;
window.saveCart = saveCart;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
