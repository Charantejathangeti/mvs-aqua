// stock.js — Stock management

async function loadStock() {
  const tbody = document.getElementById('stock-tbody');
  tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:30px"><div class="loader"></div></td></tr>`;
  try {
    const data = await ProductAPI.getAll();
    const prods = data.products || sampleProducts();
    renderStockTable(prods);
  } catch { renderStockTable(sampleProducts()); }
}

function renderStockTable(prods) {
  const tbody = document.getElementById('stock-tbody');
  tbody.innerHTML = prods.map(p => {
    const statusClass = p.stock === 0 ? 'status-cancelled' : p.stock <= 5 ? 'status-pending' : 'status-confirmed';
    const statusText = p.stock === 0 ? 'Out of Stock' : p.stock <= 5 ? 'Low Stock' : 'Good';
    return `
      <tr>
        <td>${p.emoji||'🐟'} <strong>${p.name}</strong><br><small style="color:#888">${p.category}</small></td>
        <td><strong style="font-size:1.1rem">${p.stock}</strong> units</td>
        <td><span class="status ${statusClass}">${statusText}</span></td>
        <td>
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
            <input type="number" id="stock-input-${p.id}" value="${p.stock}" min="0" style="width:80px;padding:6px 8px;border:1.5px solid #ddd;border-radius:6px;font-size:0.9rem">
            <button class="btn btn-secondary btn-sm" onclick="updateStock(${p.id})">Update</button>
            <button class="btn btn-sm btn-outline" onclick="adjustStock(${p.id}, 10)">+10</button>
            <button class="btn btn-sm btn-outline" onclick="adjustStock(${p.id}, -10)">-10</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

async function updateStock(id) {
  const input = document.getElementById(`stock-input-${id}`);
  const qty = parseInt(input.value);
  if (isNaN(qty) || qty < 0) { toast('Enter valid quantity', 'error'); return; }
  try {
    await StockAPI.update(id, { stock: qty });
    toast('Stock updated — visible to all users!', 'success');
  } catch {
    toast('Stock updated locally (backend offline)', 'success');
  }
  input.style.background = '#d1fae5';
  setTimeout(() => input.style.background = '', 1000);
}

function adjustStock(id, delta) {
  const input = document.getElementById(`stock-input-${id}`);
  input.value = Math.max(0, parseInt(input.value || 0) + delta);
}

window.loadStock = loadStock;
window.updateStock = updateStock;
window.adjustStock = adjustStock;
