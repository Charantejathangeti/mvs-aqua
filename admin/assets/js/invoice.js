// invoice.js — Invoice generation

let invoices = [];

async function loadInvoices() {
  const tbody = document.getElementById('invoices-tbody');
  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px"><div class="loader"></div></td></tr>`;
  try {
    const data = await InvoiceAPI.getAll();
    invoices = data.invoices || sampleInvoices();
  } catch { invoices = sampleInvoices(); }
  renderInvoicesTable();
}

function sampleInvoices() {
  return [
    { id:'INV001', customer_name:'Rajesh Kumar', amount:320, date:'2025-01-20', order_id:'ORD001' },
    { id:'INV002', customer_name:'Priya Sharma', amount:780, date:'2025-01-21', order_id:'ORD002' }
  ];
}

function renderInvoicesTable() {
  const tbody = document.getElementById('invoices-tbody');
  if (!invoices.length) { tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#999;padding:20px">No invoices yet</td></tr>`; return; }
  tbody.innerHTML = invoices.map(inv => `
    <tr>
      <td><strong>${inv.id}</strong></td>
      <td>${inv.customer_name}</td>
      <td>₹${inv.amount}</td>
      <td>${inv.date||'—'}</td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="printInvoice('${inv.id}')">🖨️ Print</button>
        <button class="btn btn-sm btn-outline" onclick="viewInvoice('${inv.id}')">View</button>
      </td>
    </tr>`).join('');
}

function openInvoiceModal() {
  document.getElementById('invoice-form').reset();
  document.getElementById('invoice-modal').style.display = 'flex';
}

document.getElementById('invoice-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const name = document.getElementById('inv-name').value;
  const phone = document.getElementById('inv-phone').value;
  const address = document.getElementById('inv-address').value;
  const orderId = document.getElementById('inv-order').value;
  const itemsRaw = document.getElementById('inv-items').value.trim().split('\n').filter(Boolean);
  const delivery = parseFloat(document.getElementById('inv-delivery').value)||0;
  const discount = parseFloat(document.getElementById('inv-discount').value)||0;

  const items = itemsRaw.map(line => {
    const [name, qty, price] = line.split(',').map(s => s.trim());
    return { name, qty: parseInt(qty)||1, price: parseFloat(price)||0 };
  });
  const subtotal = items.reduce((s,i) => s + i.price * i.qty, 0);
  const total = subtotal + delivery - discount;
  const invoiceId = 'INV' + Date.now();
  const date = new Date().toLocaleDateString('en-IN');

  const inv = { id: invoiceId, customer_name: name, phone, address, order_id: orderId, items, subtotal, delivery, discount, amount: total, date };

  try { await InvoiceAPI.create(inv); } catch {}
  invoices.unshift(inv);
  renderInvoicesTable();
  closeModal('invoice-modal');
  toast('Invoice created!', 'success');
  setTimeout(() => printInvoiceObj(inv), 300);
});

function printInvoice(id) {
  const inv = invoices.find(i => i.id == id);
  if (inv) printInvoiceObj(inv);
}

function viewInvoice(id) {
  const inv = invoices.find(i => i.id == id);
  if (!inv) return;
  const win = window.open('', '_blank');
  win.document.write(generateInvoiceHTML(inv));
  win.document.close();
}

function printInvoiceObj(inv) {
  const win = window.open('', '_blank');
  win.document.write(generateInvoiceHTML(inv));
  win.document.close();
  setTimeout(() => win.print(), 600);
}

function generateInvoiceHTML(inv) {
  const items = (inv.items||[]).map(i => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f2f5">${i.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f2f5;text-align:center">${i.qty}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f2f5;text-align:right">₹${i.price.toFixed(2)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f2f5;text-align:right">₹${(i.price*i.qty).toFixed(2)}</td>
    </tr>`).join('');
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Invoice ${inv.id}</title>
  <style>*{box-sizing:border-box}body{font-family:Arial,sans-serif;padding:40px;max-width:700px;margin:0 auto}
  .header{background:#003366;color:white;padding:24px;border-radius:8px;margin-bottom:24px;display:flex;justify-content:space-between}
  table{width:100%;border-collapse:collapse}th{background:#003366;color:white;padding:10px 12px}
  .totals{margin-top:20px;text-align:right}.total-line{margin-bottom:6px}
  @media print{body{padding:20px}}</style></head><body>
  <div class="header">
    <div><h2 style="margin:0">🐟 MVS Aqua</h2><p style="margin:4px 0;opacity:0.8">Charan Aquarium, Hyderabad</p></div>
    <div style="text-align:right"><h3 style="margin:0">INVOICE</h3><p style="margin:4px 0;opacity:0.8">${inv.id}</p><p style="margin:0;opacity:0.8">${inv.date}</p></div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px">
    <div><strong>Billed To:</strong><br>${inv.customer_name}<br>${inv.phone||''}<br>${inv.address||''}</div>
    <div style="text-align:right"><strong>Order ID:</strong> ${inv.order_id||'—'}</div>
  </div>
  <table><thead><tr><th style="text-align:left">Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Unit Price</th><th style="text-align:right">Total</th></tr></thead>
  <tbody>${items}</tbody></table>
  <div class="totals">
    <div class="total-line">Subtotal: <strong>₹${(inv.subtotal||0).toFixed(2)}</strong></div>
    ${inv.delivery ? `<div class="total-line">Delivery: <strong>₹${inv.delivery.toFixed(2)}</strong></div>` : ''}
    ${inv.discount ? `<div class="total-line">Discount: <strong>-₹${inv.discount.toFixed(2)}</strong></div>` : ''}
    <div style="font-size:1.4rem;font-weight:800;color:#003366;border-top:2px solid #003366;padding-top:8px;margin-top:8px">
      TOTAL: ₹${(inv.amount||0).toFixed(2)}
    </div>
  </div>
  <div style="margin-top:40px;padding-top:16px;border-top:1px solid #ddd;color:#888;font-size:0.85rem;text-align:center">
    Thank you for shopping with MVS Aqua! 🐠 | WhatsApp: +91 98765 43210 | info@mvsaqua.com
  </div>
  </body></html>`;
}

window.loadInvoices = loadInvoices;
window.openInvoiceModal = openInvoiceModal;
window.printInvoice = printInvoice;
window.viewInvoice = viewInvoice;
