//FUNCION PARA RENDERIZAR LAS VENTAS, EN LA VISTA DE MANERA DINÁMICA

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
                    ${sale.items
                      .map(
                        (item) => `
                        <div class="sale__item">
                            <span>${item.name}</span>
                            <span>x${item.quantity}</span>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>
        `;
    container.innerHTML += saleHTML;
  });
}

//LOGICA Y FUNCION PARA REGISTRAS CADA UNA DE LAS VENTAS

function registerSale() {
  if (state.cart.length === 0) return;
  {
    //Verifica  que el carrito esta vacio, si el length del carrito es 0 no hay producto y el retunr corta
    const subtotal = state.cart.reduce(
      (acc, item) => acc + item.price * item.quantity, //Utilizamos las funcion de reduce para sumar todos los subtotales con acc que va acumulando cada una de las ventas de cada uno de los item inicando por defecto desde 0, y sem multiplica el precio del producto por la cantidad.
      0,
    );
    
    // Calcular IVA (19%) y total
    const iva = subtotal * 0.19;
    const total = subtotal + iva;
    
    // Objeto literal que almacena las ventas y las registra con su ID unico
    // recopilar información del cliente y del pago del formulario de checkout
    const customer = {
      name: document.getElementById("customerName")?.value || "",
      email: document.getElementById("customerEmail")?.value || "",
      phone: document.getElementById("customerPhone")?.value || "",
      address: document.getElementById("customerAddress")?.value || "",
    };
    const paymentMethod = document.querySelector("input[name='paymentMethod']:checked")?.value || "";
    const payment = { method: paymentMethod };
    if (paymentMethod === "efectivo") {
      const received = parseInt(document.getElementById("valuePaid")?.value) || 0;
      payment.valuePaid = received;
      payment.change = received - Math.ceil(total);
    }

    const newSale = {
      id: Date.now(),
      date: new Date().toLocaleString("es-CO"),
      total: total.toLocaleString("es-CO"),
      items: state.cart.map((item) => ({
        name: item.name,
        quantity: item.quantity,
      })),
      customer,
      payment,
      //por medio del ID con la funcion Date genera un identificador de milisegundos, evitando que se repita. el local string obtiene la fecha actual de cuando se hizo la compra y la segunda convierte el formato del numero de manera visual

      //Por otro lado usamos map para transformar el carrito, recorrerlo y guardar el nombre y la cantidad del producto
    };
    state.sales.push(newSale); //Guarda la venta en el state, cambiando el estado de la aplicación

    // Vaciar carrito
    state.cart = []; // después de registrar la venta el carrito vuelve a su estado vacío

    // actualizar la vista del carrito en caso de que esté visible
    if (typeof renderCart === "function") {
      renderCart();
    }

    // Si estás en la vista historial, actualizar, se verifica si la funcion exista antes de ejecutarla
    if (typeof renderHistory === "function") {
      renderHistory();
    }
  }
}
