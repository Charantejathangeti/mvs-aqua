// product.js — Product CRUD

let products = [];

async function loadProducts() {
  const tbody = document.getElementById('products-tbody');
  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px"><div class="loader"></div></td></tr>`;
  try {
    const data = await ProductAPI.getAll();
    products = data.products || sampleProducts();
  } catch { products = sampleProducts(); }
  renderProductsTable();
}

function renderProductsTable() {
  const tbody = document.getElementById('products-tbody');
  if (!products.length) { tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#999;padding:20px">No products found</td></tr>`; return; }
  tbody.innerHTML = products.map(p => `
    <tr>
      <td>${p.id}</td>
      <td>${p.emoji||'🐟'} <strong>${p.name}</strong> ${p.featured==1?'<span class="status status-confirmed" style="font-size:0.7rem">Featured</span>':''}</td>
      <td>₹${p.price}${p.original_price?`<br><small style="text-decoration:line-through;color:#999">₹${p.original_price}</small>`:''}</td>
      <td><span class="status ${p.stock===0?'status-cancelled':p.stock<=5?'status-pending':'status-confirmed'}">${p.stock===0?'Out of Stock':p.stock+' in stock'}</span></td>
      <td>${p.category}</td>
      <td style="display:flex;gap:6px">
        <button class="btn btn-secondary btn-sm" onclick="editProduct(${p.id})">✏️ Edit</button>
        <button class="btn btn-accent btn-sm" onclick="deleteProduct(${p.id})">🗑️ Del</button>
      </td>
    </tr>`).join('');
}

function openProductModal(id = null) {
  document.getElementById('product-form').reset();
  document.getElementById('p-id').value = '';
  document.getElementById('product-modal-title').textContent = id ? 'Edit Product' : 'Add Product';
  if (id) editProduct(id);
  else document.getElementById('product-modal').style.display = 'flex';
}

function editProduct(id) {
  const p = products.find(x => x.id == id);
  if (!p) return;
  document.getElementById('p-id').value = p.id;
  document.getElementById('p-name').value = p.name;
  document.getElementById('p-category').value = p.category;
  document.getElementById('p-price').value = p.price;
  document.getElementById('p-original-price').value = p.original_price || '';
  document.getElementById('p-stock').value = p.stock;
  document.getElementById('p-emoji').value = p.emoji || '';
  document.getElementById('p-image').value = p.image || '';
  document.getElementById('p-desc').value = p.description || '';
  document.getElementById('p-care').value = p.care || '';
  document.getElementById('p-featured').value = p.featured || 0;
  document.getElementById('product-modal-title').textContent = 'Edit Product';
  document.getElementById('product-modal').style.display = 'flex';
}

async function deleteProduct(id) {
  if (!confirm('Delete this product? This cannot be undone.')) return;
  try {
    await ProductAPI.delete(id);
    toast('Product deleted', 'success');
  } catch { toast('Could not connect to backend — deleted locally', 'success'); }
  products = products.filter(p => p.id != id);
  renderProductsTable();
}

document.getElementById('product-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const id = document.getElementById('p-id').value;
  const payload = {
    name: document.getElementById('p-name').value,
    category: document.getElementById('p-category').value,
    price: parseFloat(document.getElementById('p-price').value),
    original_price: parseFloat(document.getElementById('p-original-price').value) || null,
    stock: parseInt(document.getElementById('p-stock').value),
    emoji: document.getElementById('p-emoji').value,
    image: document.getElementById('p-image').value,
    description: document.getElementById('p-desc').value,
    care: document.getElementById('p-care').value,
    featured: parseInt(document.getElementById('p-featured').value)
  };
  try {
    if (id) {
      await ProductAPI.update(id, payload);
      const idx = products.findIndex(p => p.id == id);
      if (idx >= 0) products[idx] = { ...products[idx], ...payload };
    } else {
      const res = await ProductAPI.create(payload);
      products.push({ id: res.id || Date.now(), ...payload });
    }
    toast(`Product ${id ? 'updated' : 'added'} successfully!`, 'success');
  } catch {
    toast('Saved locally (backend offline)', 'success');
    if (!id) products.push({ id: Date.now(), ...payload });
    else { const idx = products.findIndex(p => p.id == id); if (idx >= 0) products[idx] = { ...products[idx], ...payload }; }
  }
  closeModal('product-modal');
  renderProductsTable();
});

window.openProductModal = openProductModal;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.loadProducts = loadProducts;
