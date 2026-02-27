// SELECTORES
const checkoutContainer = document.querySelector(".checkout__content-container");
const checkoutSection = document.querySelector("#checkoutSection");

// FUNCIÓN: Renderizar checkout
function renderCheckout() {
  checkoutContainer.innerHTML = "";

  if (state.cart.length === 0) {
    checkoutContainer.innerHTML = `
      <h2>Compra realizada con éxito</h2>
      <p>Tu pedido ha sido registrado. ¡Gracias por tu compra!</p>
      <button onclick="navigate('home'); if(typeof renderCart==='function'){renderCart();}" class="checkout__success-button">Volver al Inicio</button>
    `;
    return;
  }

  // calcular totales antes de renderizar
  const subtotal = state.cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const iva = subtotal * 0.19;
  const total = subtotal + iva;

  let cartItemsHTML = "";
  state.cart.forEach(item => {
    const subtotalItem = (item.price * item.quantity).toLocaleString("es-CO");
    cartItemsHTML += `
      <div class="checkout__item">
        <h4>${item.name}</h4>
        <p>Cantidad: ${item.quantity} - $${subtotalItem}</p>
      </div>
    `;
  });

  checkoutContainer.innerHTML = `
    <h2>Resumen de Compra</h2>
    <div class="checkout__items">
      ${cartItemsHTML}
    </div>
    <div class="checkout__totals">
      <p>Subtotal: $${subtotal.toLocaleString("es-CO")}</p>
      <p>IVA (19%): $${iva.toLocaleString("es-CO")}</p>
      <h3>Total: $${total.toLocaleString("es-CO")}</h3>
    </div>
    <form id="checkoutForm">
      <h3>Información de Entrega</h3>
      <div>
        <label>Nombre:</label>
        <input type="text" id="customerName" required>
      </div>
      <div>
        <label>Email:</label>
        <input type="email" id="customerEmail" required>
      </div>
      <div>
        <label>Teléfono:</label>
        <input type="tel" id="customerPhone" required>
      </div>
      <div>
        <label>Dirección:</label>
        <input type="text" id="customerAddress" required>
      </div>
      <h3>Método de Pago</h3>
      <div class="payment__methods">
        <label class="payment__option">
          <input type="radio" name="paymentMethod" value="efectivo" required> Efectivo
        </label>
        <label class="payment__option">
          <input type="radio" name="paymentMethod" value="nequi" required> Nequi
        </label>
        <label class="payment__option">
          <input type="radio" name="paymentMethod" value="debe" required> Debe
        </label>
      </div>
      <div id="efectivoFields" class="payment__fields payment__fields--hidden">
        <label>Valor Recibido:</label>
        <input type="number" id="valuePaid" placeholder="0" min="${Math.ceil(total)}">
        <p id="changeDisplay"></p>
      </div>
      <button type="submit">Confirmar Compra</button>
    </form>
  `;

  const checkoutForm = document.getElementById("checkoutForm");
  const paymentMethods = document.querySelectorAll("input[name='paymentMethod']");
  const efectivoFields = document.getElementById("efectivoFields");
  const valuePaid = document.getElementById("valuePaid");
  const changeDisplay = document.getElementById("changeDisplay");

  paymentMethods.forEach(method => {
    method.addEventListener("change", function() {
      if (this.value === "efectivo") {
        efectivoFields.classList.remove("payment__fields--hidden");
        valuePaid.required = true;
      } else {
        efectivoFields.classList.add("payment__fields--hidden");
        valuePaid.required = false;
        changeDisplay.textContent = "";
      }
    });
  });

  valuePaid.addEventListener("input", function() {
    const received = parseInt(this.value) || 0;
    const change = received - Math.ceil(total);
    if (this.value !== "") {
      if (change >= 0) {
        changeDisplay.textContent = `Cambio: $${change.toLocaleString("es-CO")}`;
        changeDisplay.style.color = "#4CAF50";
      } else {
        changeDisplay.textContent = `Falta: $${Math.abs(change).toLocaleString("es-CO")}`;
        changeDisplay.style.color = "#f44336";
      }
    }
  });

  checkoutForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const paymentMethod = document.querySelector("input[name='paymentMethod']:checked").value;
    if (paymentMethod === "efectivo") {
      const received = parseInt(valuePaid.value);
      if (received < Math.ceil(total)) {
        alert("Valor insuficiente");
        return;
      }
    }
    registerSale();
    if (typeof renderHistory === "function") {
      renderHistory();
    }
    renderCheckout();
  });
}
