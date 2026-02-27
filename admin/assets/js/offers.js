// offers.js — Offers management

let offers = [];

async function loadOffers() {
  const container = document.getElementById('offers-list');
  container.innerHTML = `<div style="text-align:center;padding:20px"><div class="loader"></div></div>`;
  try {
    const data = await OfferAPI.getAll();
    offers = data.offers || sampleOffers();
  } catch { offers = sampleOffers(); }
  renderOffers();
}

function sampleOffers() {
  return [
    { id:1, title:'Free Delivery', description:'On orders above ₹500', discount_pct:0, code:'', emoji:'🚚', active:1 },
    { id:2, title:'First Order Discount', description:'Get 20% off on your first purchase', discount_pct:20, code:'FIRST20', emoji:'🎁', active:1 }
  ];
}

function renderOffers() {
  const container = document.getElementById('offers-list');
  if (!offers.length) { container.innerHTML = '<p style="color:#999;text-align:center;padding:20px">No offers yet. Add one!</p>'; return; }
  container.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px">
      ${offers.map(o => `
        <div style="border:1.5px solid #e8f0ff;border-radius:10px;padding:18px;background:${o.active?'white':'#f9f9f9'}">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
            <span style="font-size:2rem">${o.emoji||'🎁'}</span>
            <span class="status ${o.active?'status-confirmed':'status-cancelled'}">${o.active?'Active':'Inactive'}</span>
          </div>
          <h4 style="color:var(--primary);margin-bottom:4px">${o.title}</h4>
          <p style="color:#666;font-size:0.88rem;margin-bottom:8px">${o.description||''}</p>
          ${o.discount_pct ? `<div class="status status-pending" style="display:inline-block;margin-bottom:6px">${o.discount_pct}% OFF</div>` : ''}
          ${o.code ? `<p style="font-size:0.85rem">Code: <strong>${o.code}</strong></p>` : ''}
          <div style="display:flex;gap:8px;margin-top:12px">
            <button class="btn btn-secondary btn-sm" onclick="editOffer(${o.id})">✏️ Edit</button>
            <button class="btn btn-accent btn-sm" onclick="deleteOffer(${o.id})">🗑️ Delete</button>
            <button class="btn btn-sm" style="background:${o.active?'#fee2e2':'#d1fae5'};color:${o.active?'#991b1b':'#065f46'}" onclick="toggleOffer(${o.id})">${o.active?'Deactivate':'Activate'}</button>
          </div>
        </div>`).join('')}
    </div>`;
}

function openOfferModal() {
  document.getElementById('offer-form').reset();
  document.getElementById('o-id').value = '';
  document.getElementById('offer-modal').style.display = 'flex';
}

function editOffer(id) {
  const o = offers.find(x => x.id == id);
  if (!o) return;
  document.getElementById('o-id').value = o.id;
  document.getElementById('o-title').value = o.title;
  document.getElementById('o-desc').value = o.description || '';
  document.getElementById('o-pct').value = o.discount_pct || '';
  document.getElementById('o-code').value = o.code || '';
  document.getElementById('o-emoji').value = o.emoji || '';
  document.getElementById('o-active').value = o.active || 0;
  document.getElementById('offer-modal').style.display = 'flex';
}

async function deleteOffer(id) {
  if (!confirm('Delete this offer?')) return;
  try { await OfferAPI.delete(id); } catch {}
  offers = offers.filter(o => o.id != id);
  renderOffers();
  toast('Offer deleted', 'success');
}

async function toggleOffer(id) {
  const o = offers.find(x => x.id == id);
  if (!o) return;
  o.active = o.active ? 0 : 1;
  try { await OfferAPI.update(id, { active: o.active }); } catch {}
  renderOffers();
  toast(`Offer ${o.active ? 'activated' : 'deactivated'}`, 'success');
}

document.getElementById('offer-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const id = document.getElementById('o-id').value;
  const payload = {
    title: document.getElementById('o-title').value,
    description: document.getElementById('o-desc').value,
    discount_pct: parseInt(document.getElementById('o-pct').value) || 0,
    code: document.getElementById('o-code').value,
    emoji: document.getElementById('o-emoji').value || '🎁',
    active: parseInt(document.getElementById('o-active').value)
  };
  try {
    if (id) { await OfferAPI.update(id, payload); const idx = offers.findIndex(o => o.id == id); if (idx >= 0) offers[idx] = {...offers[idx],...payload}; }
    else { const res = await OfferAPI.create(payload); offers.push({ id: res.id||Date.now(), ...payload }); }
    toast('Offer saved — visible to all users!', 'success');
  } catch {
    toast('Saved locally (backend offline)', 'success');
    if (!id) offers.push({ id: Date.now(), ...payload });
    else { const idx = offers.findIndex(o => o.id == id); if (idx >= 0) offers[idx] = {...offers[idx],...payload}; }
  }
  closeModal('offer-modal');
  renderOffers();
});

window.loadOffers = loadOffers;
window.openOfferModal = openOfferModal;
window.editOffer = editOffer;
window.deleteOffer = deleteOffer;
window.toggleOffer = toggleOffer;
