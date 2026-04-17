// ============================================================
// history.js - Historial de ventas
// ============================================================

function renderHistory() {
  const historySection = document.querySelector('.history__content-sales');
  if (!historySection) return;

  if (state.sales.length === 0) {
    historySection.innerHTML = `
      <h2 class="history-content-title">Historial de ventas</h2>
      <p style="color:#888; text-align:center; margin-top:16px;">No hay ventas registradas.</p>
    `;
  } else {
    let content = `
      <h2 class="history-content-title">Historial de ventas</h2>
      <div class="history-card">
        <div class="history-header">
          <span>ID</span><span>FECHA</span><span>TOTAL</span>
          <span>ESTADO</span><span>DETALLES</span><span>FACTURA</span>
        </div>
    `;
    state.sales.forEach(sale => {
      content += `
        <div class="history-row">
          <span>#${String(sale.id).slice(-6)}</span>
          <span>${sale.date}</span>
          <span>$${sale.total}</span>
          <span class="status delivered">Entregado</span>
          <button class="btn-details" data-id="${sale.id}">Ver detalles</button>
          <button class="btn-invoice" data-id="${sale.id}">Factura</button>
        </div>
      `;
    });
    content += `</div>`;
    historySection.innerHTML = content;

    historySection.querySelectorAll('.btn-details').forEach(btn => {
      btn.addEventListener('click', e => showSaleDetails(Number(e.currentTarget.dataset.id)));
    });
  }

  if (typeof renderOpenSales === 'function') renderOpenSales(historySection);
}

// ============================================================
// Modal de detalles — diseño profesional y organizado
// ============================================================
function showSaleDetails(saleId) {
  const sale = state.sales.find(s => s.id === saleId);
  if (!sale) return;

  document.getElementById('saleDetailsModal')?.remove();

  const subtotal = sale.items.reduce((acc, i) => acc + (Number(i.price) * Number(i.quantity)), 0);
  const total    = typeof sale.total === 'string'
    ? Number(sale.total.replace(/\./g, '').replace(',', '.'))
    : Number(sale.total);
  const iva = total - subtotal;

  const itemsRows = sale.items.map(i => `
    <tr>
      <td>${i.name}</td>
      <td style="text-align:center;">${i.quantity}</td>
      <td style="text-align:right;">$${Number(i.price).toLocaleString('es-CO')}</td>
      <td style="text-align:right; font-weight:600;">$${(Number(i.price)*Number(i.quantity)).toLocaleString('es-CO')}</td>
    </tr>
  `).join('');

  const modal = document.createElement('div');
  modal.id        = 'saleDetailsModal';
  modal.className = 'sale-details-modal';
  modal.innerHTML = `
    <div class="sale-details-content sale-details-professional">
      <button class="close-btn" aria-label="Cerrar">&times;</button>

      <!-- Encabezado -->
      <div class="sd-header">
        <div>
          <h3 class="sd-title">Detalle de Venta</h3>
          <span class="sd-id">#${String(sale.id).slice(-6)}</span>
        </div>
        <span class="status delivered" style="align-self:flex-start;">Entregado</span>
      </div>

      <div class="sd-meta">
        <span>📅 ${sale.date}</span>
      </div>

      <!-- Sección cliente -->
      <div class="sd-section">
        <h4 class="sd-section-title">👤 Cliente</h4>
        <div class="sd-grid">
          <div class="sd-field"><span class="sd-label">Nombre</span><span>${sale.customer?.name || '—'}</span></div>
          <div class="sd-field"><span class="sd-label">Teléfono</span><span>${sale.customer?.phone || '—'}</span></div>
          <div class="sd-field"><span class="sd-label">Email</span><span>${sale.customer?.email || '—'}</span></div>
          <div class="sd-field"><span class="sd-label">Dirección</span><span>${sale.customer?.address || '—'}</span></div>
        </div>
      </div>

      <!-- Sección pago -->
      <div class="sd-section">
        <h4 class="sd-section-title">💳 Pago</h4>
        <div class="sd-grid">
          <div class="sd-field"><span class="sd-label">Método</span><span style="text-transform:capitalize;">${sale.payment?.method || '—'}</span></div>
          ${sale.payment?.method === 'efectivo' ? `
          <div class="sd-field"><span class="sd-label">Recibido</span><span>$${Number(sale.payment.valuePaid||0).toLocaleString('es-CO')}</span></div>
          <div class="sd-field"><span class="sd-label">Cambio</span><span>$${Number(sale.payment.change||0).toLocaleString('es-CO')}</span></div>
          ` : ''}
        </div>
      </div>

      <!-- Tabla de productos -->
      <div class="sd-section">
        <h4 class="sd-section-title">🛍️ Productos</h4>
        <table class="sd-table">
          <thead>
            <tr>
              <th>Producto</th><th style="text-align:center;">Cant.</th>
              <th style="text-align:right;">Precio unit.</th><th style="text-align:right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>${itemsRows}</tbody>
        </table>
      </div>

      <!-- Totales -->
      <div class="sd-totals">
        <div class="sd-total-row"><span>Subtotal</span><span>$${subtotal.toLocaleString('es-CO')}</span></div>
        <div class="sd-total-row"><span>IVA (19%)</span><span>$${iva.toLocaleString('es-CO')}</span></div>
        <div class="sd-total-row sd-total-final"><span>Total</span><span>$${sale.total}</span></div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}