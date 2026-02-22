function renderSales() {
    const container = document.getElementById("historySection");
    container.innerHTML = "";

    if (state.sales.length === 0) {
        container.innerHTML = "<p>No hay ventas registradas</p>";
        return;
    }

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
        container.innerHTML += saleHTML;
    });
}