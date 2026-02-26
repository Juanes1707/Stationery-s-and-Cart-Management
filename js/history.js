//Funcion de renderización del historial de venta
function renderHistory() {
  const historySection = document.querySelector("#historySection");

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
      </div>
    `;
  });

  // Cerramos el contenedor principal
  content += `</div>`;

  // Insertamos todo al DOM una sola vez
  historySection.innerHTML = content;
}