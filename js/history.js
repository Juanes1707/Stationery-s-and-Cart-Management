// ============================================================
// history.js - Renderizado del historial de ventas cerradas
// y de las ventas abiertas (guardadas para retomar)
// Depende de: state.js, sales.js, invoice.js
// ============================================================
 
function renderHistory() {
  const historySection = document.querySelector('.history__content-sales');
  if (!historySection) return;
 
  // ── Ventas cerradas ────────────────────────────────────────
  if (state.sales.length === 0) {
    historySection.innerHTML = `
      <h2 class="history-content-title">Historial de ventas</h2>
      <p>No hay ventas registradas.</p>
    `;
  } else {
    let content = `
      <h2 class="history-content-title">Historial de ventas</h2>
      <div class="history-card">
        <div class="history-header">
          <span>ID DE PEDIDO</span>
          <span>FECHA</span>
          <span>MONTO TOTAL</span>
          <span>ESTADO</span>
          <span>ACCIÓN</span>
          <span>FACTURA</span>
        </div>
    `;
 
    state.sales.forEach(sale => {
      content += `
        <div class="history-row">
          <span>#${sale.id}</span>
          <span>${sale.date}</span>
          <span>$${sale.total}</span>
          <span class="status delivered">Entregado</span>
          <button class="btn-details" data-id="${sale.id}">Ver detalles</button>
          <button class="btn-invoice" data-id="${sale.id}">Ver factura</button>
        </div>
      `;
    });
 
    content += `</div>`;
    historySection.innerHTML = content;
 
    // Conectar botones de detalles
    historySection.querySelectorAll('.btn-details').forEach(btn => {
      btn.addEventListener('click', e => {
        showSaleDetails(Number(e.currentTarget.dataset.id));
      });
    });
  }
 
  // ── Ventas abiertas (encima del historial) ─────────────────
  // renderOpenSales está definida en sales.js
  // la llama solo si la función existe (por seguridad de carga)
  if (typeof renderOpenSales === 'function') {
    renderOpenSales(historySection);
  }
}
 
// ============================================================
// Modal con detalles de una venta cerrada
// ============================================================
function showSaleDetails(saleId) {
  const sale = state.sales.find(s => s.id === saleId);
  if (!sale) return;
 
  // Cerrar modal anterior si existe
  document.getElementById('saleDetailsModal')?.remove();
 
  const modal = document.createElement('div');
  modal.id        = 'saleDetailsModal';
  modal.className = 'sale-details-modal';
 
  modal.innerHTML = `
    <div class="sale-details-content">
      <span class="close-btn">&times;</span>
      <h3>Detalles de venta #${sale.id}</h3>
      <p><strong>Fecha:</strong> ${sale.date}</p>
      <p><strong>Total:</strong> $${sale.total}</p>
 
      <h4>Productos</h4>
      <ul>
        ${sale.items.map(i => `<li>${i.name} x${i.quantity} — $${Number(i.price).toLocaleString('es-CO')}</li>`).join('')}
      </ul>
 
      <h4>Cliente</h4>
      <p>Nombre: ${sale.customer?.name    || '-'}</p>
      <p>Email: ${sale.customer?.email    || '-'}</p>
      <p>Teléfono: ${sale.customer?.phone  || '-'}</p>
      <p>Dirección: ${sale.customer?.address || '-'}</p>
 
      <h4>Pago</h4>
      <p>Método: ${sale.payment?.method || '-'}</p>
      ${sale.payment?.method === 'efectivo'
        ? `<p>Recibido: $${Number(sale.payment.valuePaid || 0).toLocaleString('es-CO')}</p>
           <p>Cambio: $${Number(sale.payment.change || 0).toLocaleString('es-CO')}</p>`
        : ''}
    </div>
  `;
 
  document.body.appendChild(modal);
 
  modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}