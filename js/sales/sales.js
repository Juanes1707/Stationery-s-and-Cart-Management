// ============================================================
// sales.js - Registro de ventas y ventas abiertas
// ============================================================

function getOpenSales() {
  try { return JSON.parse(localStorage.getItem('ventasAbiertas')) || []; }
  catch (e) { return []; }
}
function saveOpenSales(list) {
  localStorage.setItem('ventasAbiertas', JSON.stringify(list));
}

// ── Modal para nombrar la venta abierta ─────────────────────
function showHoldSaleModal(callback) {
  document.getElementById('holdSaleModal')?.remove();
  const modal = document.createElement('div');
  modal.id        = 'holdSaleModal';
  modal.className = 'sale-details-modal';
  modal.innerHTML = `
    <div class="sale-details-content modal-narrow">
      <span class="close-btn">&times;</span>
      <h3 style="margin-bottom:8px;">🔖 Guardar venta</h3>
      <p style="font-size:0.88rem; color:#666; margin-bottom:14px;">
        Asigna un nombre para identificar esta venta y retomar la más tarde.
      </p>
      <input id="holdSaleLabel" placeholder="Ej: Cliente Juan / Mesa 3"
        style="width:100%; padding:9px 11px; border:1px solid #ddd; border-radius:7px;
               font-size:0.95rem; box-sizing:border-box; margin-bottom:16px;">
      <div style="display:flex; gap:8px; justify-content:flex-end;">
        <button id="holdSaleCancel" class="confirm-btn confirm-btn--no">Cancelar</button>
        <button id="holdSaleConfirm" class="confirm-btn confirm-btn--yes" style="background:#2e7d32;">Guardar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelector('.close-btn').addEventListener('click', close);
  document.getElementById('holdSaleCancel').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.getElementById('holdSaleConfirm').addEventListener('click', () => {
    const label = document.getElementById('holdSaleLabel').value.trim();
    close();
    callback(label);
  });
  setTimeout(() => document.getElementById('holdSaleLabel')?.focus(), 50);
}

// ── Guardar carrito como venta abierta ──────────────────────
function holdCurrentSale() {
  if (state.cart.length === 0) {
    showToast('El carrito está vacío. Agrega productos primero.', 'error');
    return;
  }
  showHoldSaleModal((label) => {
    const openSales = getOpenSales();
    const activeId  = state.activeOpenSaleId || Date.now();
    state.activeOpenSaleId = activeId;
    const openSale = {
      id: activeId, label: label || `Venta #${activeId}`,
      date: new Date().toLocaleString('es-CO'), items: [...state.cart]
    };
    const idx = openSales.findIndex(s => s.id === activeId);
    if (idx >= 0) openSales[idx] = openSale; else openSales.push(openSale);
    saveOpenSales(openSales);
    state.cart = []; state.activeOpenSaleId = null;
    saveCart(); renderCart();
    showToast(`Venta "${openSale.label}" guardada.`);
  });
}

// ── Retomar venta abierta ───────────────────────────────────
function resumeOpenSale(openSaleId) {
  const openSales = getOpenSales();
  const idx       = openSales.findIndex(s => s.id === openSaleId);
  if (idx === -1) return;
  const openSale  = openSales[idx];
  const doResume  = () => {
    state.cart = [...openSale.items];
    state.activeOpenSaleId = openSale.id;
    openSales.splice(idx, 1);
    saveOpenSales(openSales); saveCart(); renderCart();
    navigate('home');
    showToast(`Venta "${openSale.label}" retomada.`);
  };
  if (state.cart.length > 0) {
    showConfirm(`¿Reemplazar el carrito con la venta "${openSale.label}"?`).then(ok => { if (ok) doResume(); });
  } else { doResume(); }
}

function deleteOpenSale(openSaleId) {
  saveOpenSales(getOpenSales().filter(s => s.id !== openSaleId));
}

// ── Renderizar ventas abiertas en el historial ──────────────
function renderOpenSales(container) {
  const openSales = getOpenSales();
  if (openSales.length === 0) return;
  let html = `<div class="open-sales__section">
    <h3 class="open-sales__title">🔖 Ventas abiertas</h3>
    <div class="open-sales__list">`;
  openSales.forEach(sale => {
    html += `
      <div class="open-sale__card">
        <div class="open-sale__info">
          <strong>${sale.label}</strong>
          <span>${sale.date} · ${sale.items.length} producto(s)</span>
        </div>
        <div class="open-sale__actions">
          <button class="btn-resume-sale btn-edit" data-id="${sale.id}">▶ Retomar</button>
          <button class="btn-delete-open-sale btn-delete" data-id="${sale.id}">🗑️</button>
        </div>
      </div>`;
  });
  html += `</div></div>`;
  container.insertAdjacentHTML('afterbegin', html);

  container.querySelectorAll('.btn-resume-sale').forEach(btn => {
    btn.addEventListener('click', e => resumeOpenSale(Number(e.currentTarget.dataset.id)));
  });
  container.querySelectorAll('.btn-delete-open-sale').forEach(btn => {
    btn.addEventListener('click', async e => {
      const ok = await showConfirm('¿Descartar esta venta abierta?');
      if (ok) { deleteOpenSale(Number(e.currentTarget.dataset.id)); renderHistory(); }
    });
  });
}

// ── Registrar venta cerrada — devuelve el objeto de la venta ─
async function registerSale() {
  if (state.cart.length === 0) return null;

  const subtotal = state.cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const iva      = subtotal * 0.19;
  const total    = subtotal + iva;

  const customer = {
    name:    document.getElementById('customerName')?.value    || '',
    email:   document.getElementById('customerEmail')?.value   || '',
    phone:   document.getElementById('customerPhone')?.value   || '',
    address: document.getElementById('customerAddress')?.value || ''
  };
  const paymentMethod = document.querySelector("input[name='paymentMethod']:checked")?.value || '';
  const payment = { method: paymentMethod };
  if (paymentMethod === 'efectivo') {
    const received    = parseInt(document.getElementById('valuePaid')?.value) || 0;
    payment.valuePaid = received;
    payment.change    = received - Math.ceil(total);
  }

  const newSale = {
    id:       Date.now(),
    date:     new Date().toLocaleString('es-CO'),
    total:    total.toLocaleString('es-CO'),
    items:    state.cart.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })),
    customer, payment
  };

  state.sales.push(newSale);
  saveSales();

  // Enviar a Google Sheets
  try {
    await apiPost('ventas', {
      id: newSale.id, fecha: newSale.date,
      clienteId: newSale.customer.name,
      metodoPago: newSale.payment.method,
      total: total,
      itemsJson: JSON.stringify(newSale.items)
    });
  } catch (e) { console.error('Error guardando venta en Sheets:', e); }

  state.cart = []; state.activeOpenSaleId = null;
  saveCart();
  if (typeof renderCart === 'function') renderCart();

  return newSale; // ← lo usa checkout.js para mostrar la pantalla de éxito
}

function renderSales() {} // legacy