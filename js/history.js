//Funcion de renderización del historial de venta
function renderHistory() {
  const historySection = document.querySelector(".history__content-sales");

  if (!historySection) return;

  // Si no hay ventas
  if (state.sales.length === 0) {
    historySection.innerHTML = `
      <h2 class="history-content-title">Historial de ventas</h2>
      <p>No hay ventas registradas</p>
    `;
    return;
  }

  // Aquí metemos la estructura base que quieres
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

  // Recorremos las ventas
  state.sales.forEach((sale) => {
    content += `
      <div class="history-row">
        <span>#${sale.id}</span>
        <span>${sale.date}</span>
        <span>$${sale.total}</span>
        <span class="status delivered">Entregado</span>
        <button class="btn-details" data-id="${sale.id}">
          Ver detalles
        </button>
        <button class="btn-invoice" data-id="${sale.id}">
          Ver factura
        </button>
      </div>
    `;
  });

  // Cerramos el contenedor principal
  content += `</div>`;

  // Insertamos todo al DOM una sola vez
  historySection.innerHTML = content;

  // después de insertar en el DOM, conectar los botones de detalles
  historySection.querySelectorAll('.btn-details').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = Number(e.currentTarget.dataset.id);
      showSaleDetails(id);
    });
  });
}

// ayudante para crear y mostrar un modal con la información de la venta
function showSaleDetails(saleId) {
  const sale = state.sales.find(s => s.id === saleId);
  if (!sale) return;

  // cerrar modal existente si hay alguno
  const existing = document.getElementById('saleDetailsModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'saleDetailsModal';
  modal.className = 'sale-details-modal';

  const html = `
    <div class="sale-details-content">
      <span class="close-btn">&times;</span>
      <h3>Detalles de venta #${sale.id}</h3>
      <p><strong>Fecha:</strong> ${sale.date}</p>
      <p><strong>Total:</strong> $${sale.total}</p>
      <h4>Productos</h4>
      <ul>
        ${sale.items.map(i => `<li>${i.name} x${i.quantity}</li>`).join('')}
      </ul>
      <h4>Cliente</h4>
      <p>Nombre: ${sale.customer?.name || '-'}</p>
      <p>Email: ${sale.customer?.email || '-'}</p>
      <p>Teléfono: ${sale.customer?.phone || '-'}</p>
      <p>Dirección: ${sale.customer?.address || '-'}</p>
      <h4>Pago</h4>
      <p>Método: ${sale.payment?.method || '-'}</p>
      ${sale.payment?.method === 'efectivo' ?
        `<p>Recibido: $${(sale.payment.valuePaid || 0).toLocaleString('es-CO')}</p>
         <p>Cambio: $${(sale.payment.change || 0).toLocaleString('es-CO')}</p>`
        : ''}
    </div>
  `;

  modal.innerHTML = html;
  document.body.appendChild(modal);

  // close handlers
  modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', e => {
    if (e.target === modal) modal.remove();
  });
}