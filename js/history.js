function renderHistory() {
    const historySection = document.querySelector("#historySection");

    if (state.sales.length === 0) {
        historySection.innerHTML = `
            <h2 class="history-content-title">Historial de ventas</h2>
            <p>No hay ventas registradas</p>
        `;
        return;
    }

    historySection.innerHTML = `<h2 class="history-content-title">Historial de ventas</h2>`;

    state.sales.forEach((sale) => {
        const saleHTML = `
            <div class="sale">
                <h3>Venta #${sale.id}</h3>
                <p>Fecha: ${sale.date}</p>
                <p>Total: $${sale.total}</p>
                <div class="sale__items">
                    ${sale.items.map(item => `
                        <div class="sale__item">
                            <span>${item.name}</span>
                            <span>x${item.quantity}</span>
                        </div>
                    `).join("")}
                </div>
            </div>
        `;
        historySection.innerHTML += saleHTML;
    });
}