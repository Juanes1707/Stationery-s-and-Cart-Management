// checkout.js - Flujo rapido de cobro POS

const checkoutContainer = document.querySelector(".checkout__content-container");
const checkoutSection = document.querySelector("#checkoutSection");

function money(value) {
  return Number(value || 0).toLocaleString("es-CO");
}

let checkoutDiscounts = [];

function calculateCheckoutTotals(discount) {
  const subtotal = state.cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountValue = discount
    ? Math.min(subtotal, discount.tipo === "PORCENTAJE"
        ? subtotal * (Number(discount.valor || 0) / 100)
        : Number(discount.valor || 0))
    : 0;
  const base = Math.max(0, subtotal - discountValue);
  const iva = base * 0.19;
  return { subtotal, discountValue, iva, total: base + iva };
}

function renderSaleSuccess(saleData) {
  // Activar modo "success" para centrar la tarjeta sin alterar layout del checkout
  checkoutContainer.classList.add('checkout--success');

  checkoutContainer.innerHTML = `
    <div class="sale-success">
      <div class="sale-success__icon"><i class="fa-solid fa-circle-check"></i></div>
      <h2 class="sale-success__title">Venta registrada</h2>
      <p class="sale-success__subtitle">Inventario actualizado y comprobante listo para consultar.</p>

      <div class="sale-success__summary">
        <div class="sale-success__row">
          <span>Total pagado</span>
          <strong>$${saleData.total}</strong>
        </div>
        <div class="sale-success__row">
          <span>Metodo de pago</span>
          <strong>${saleData.payment?.method || "-"}</strong>
        </div>
        ${
          saleData.payment?.method === "efectivo"
            ? `<div class="sale-success__row">
                <span>Cambio</span>
                <strong>$${money(saleData.payment.change)}</strong>
              </div>`
            : ""
        }
        <div class="sale-success__row">
          <span>Cliente</span>
          <strong>${saleData.customer?.name || "Consumidor final"}</strong>
        </div>
        <div class="sale-success__row">
          <span>Items</span>
          <strong>${saleData.items.length}</strong>
        </div>
      </div>

      <div class="sale-success__actions">
        <button class="sale-success__btn-home" onclick="navigate('home'); renderCart();">
          Nueva venta
        </button>
        <button class="sale-success__btn-history" onclick="navigate('profile'); initAdmin();">
          Ver historial
        </button>
      </div>
    </div>
  `;
}

function renderCheckout() {
  // Asegurar que salimos del modo success cuando volvemos al formulario
  checkoutContainer.classList.remove('checkout--success');
  checkoutContainer.innerHTML = "";

  if (state.cart.length === 0) {
    checkoutContainer.innerHTML = `
      <div class="checkout__empty">
        <i class="fa-solid fa-cart-shopping"></i>
        <h2>No hay productos para cobrar</h2>
        <button onclick="navigate('home')">Volver al POS</button>
      </div>
    `;
    return;
  }

  let totals = calculateCheckoutTotals(null);

  const cartItemsHTML = state.cart
    .map(
      (item) => `
      <div class="checkout__item">
        <div>
          <h4>${item.name}</h4>
          <p>${item.quantity} x $${money(item.price)}</p>
        </div>
        <strong>$${money(item.price * item.quantity)}</strong>
      </div>
    `,
    )
    .join("");

  checkoutContainer.innerHTML = `
    <div class="checkout__panel checkout__panel--items">
      <div class="checkout__header">
        <button type="button" class="checkout__back" id="checkoutBack">
          <i class="fa-solid fa-arrow-left"></i>
        </button>
        <div>
          <h2>Cobro POS</h2>
          <p>${state.cart.length} producto(s) en la venta</p>
        </div>
      </div>
      <div class="checkout__items">${cartItemsHTML}</div>
    </div>

    <form id="checkoutForm" class="checkout__panel checkout__panel--payment">
      <h3>Pago</h3>

      <div class="checkout__totals">
        <p><span>Subtotal</span><strong id="checkoutSubtotal">$${money(totals.subtotal)}</strong></p>
        <p><span>Descuento</span><strong id="checkoutDiscountValue">$0</strong></p>
        <p><span>IVA 19%</span><strong id="checkoutIva">$${money(totals.iva)}</strong></p>
        <h3><span>Total</span><strong id="checkoutTotal">$${money(totals.total)}</strong></h3>
      </div>

      <label class="checkout__field">
        <span>Descuento</span>
        <select id="discountSelect">
          <option value="">Sin descuento</option>
        </select>
      </label>

      <label class="checkout__field">
        <span>Cliente</span>
        <input type="text" id="customerName" placeholder="Consumidor final">
      </label>

      <div class="payment__methods">
        <label class="payment__option">
          <input type="radio" name="paymentMethod" value="efectivo" checked required>
          <span>Efectivo</span>
        </label>
        <label class="payment__option">
          <input type="radio" name="paymentMethod" value="nequi">
          <span>Nequi</span>
        </label>
        <label class="payment__option">
          <input type="radio" name="paymentMethod" value="debito">
          <span>Debito</span>
        </label>
      </div>

      <div id="efectivoFields" class="payment__fields">
        <label class="checkout__field">
          <span>Valor recibido</span>
          <input type="number" id="valuePaid" placeholder="${Math.ceil(totals.total)}" min="${Math.ceil(totals.total)}" required>
        </label>
        <p id="changeDisplay" class="checkout__change"></p>
      </div>

      <button type="submit" class="checkout__submit">Cobrar y registrar</button>
    </form>
  `;

  document.getElementById("checkoutBack").addEventListener("click", () => navigate("home"));

  const checkoutForm = document.getElementById("checkoutForm");
  const paymentMethods = document.querySelectorAll("input[name='paymentMethod']");
  const efectivoFields = document.getElementById("efectivoFields");
  const valuePaidInput = document.getElementById("valuePaid");
  const changeDisplay = document.getElementById("changeDisplay");
  const discountSelect = document.getElementById("discountSelect");

  function selectedDiscount() {
    const raw = discountSelect.selectedOptions[0]?.dataset.discount;
    return raw ? JSON.parse(raw) : null;
  }

  function updateTotals() {
    totals = calculateCheckoutTotals(selectedDiscount());
    document.getElementById("checkoutSubtotal").textContent = `$${money(totals.subtotal)}`;
    document.getElementById("checkoutDiscountValue").textContent = `$${money(totals.discountValue)}`;
    document.getElementById("checkoutIva").textContent = `$${money(totals.iva)}`;
    document.getElementById("checkoutTotal").textContent = `$${money(totals.total)}`;
    valuePaidInput.placeholder = String(Math.ceil(totals.total));
    valuePaidInput.min = String(Math.ceil(totals.total));
    valuePaidInput.dispatchEvent(new Event("input"));
  }

  apiGet("descuentos?activo=true").then((data) => {
    checkoutDiscounts = Array.isArray(data) ? data : [];
    checkoutDiscounts.forEach((discount) => {
      const option = document.createElement("option");
      option.value = discount.id;
      option.dataset.discount = JSON.stringify(discount);
      option.textContent = `${discount.nombre} (${discount.tipo === "PORCENTAJE" ? `${discount.valor}%` : `$${money(discount.valor)}`})`;
      discountSelect.appendChild(option);
    });
  });

  discountSelect.addEventListener("change", updateTotals);

  paymentMethods.forEach((method) => {
    method.addEventListener("change", function () {
      const isCash = this.value === "efectivo";
      efectivoFields.classList.toggle("payment__fields--hidden", !isCash);
      valuePaidInput.required = isCash;
      if (!isCash) {
        valuePaidInput.value = "";
        changeDisplay.textContent = "";
      }
    });
  });

  valuePaidInput.addEventListener("input", function () {
    const received = Number(this.value || 0);
    const change = received - Math.ceil(totals.total);
    if (!this.value) {
      changeDisplay.textContent = "";
      return;
    }
    changeDisplay.textContent =
      change >= 0 ? `Cambio: $${money(change)}` : `Falta: $${money(Math.abs(change))}`;
    changeDisplay.classList.toggle("checkout__change--ok", change >= 0);
    changeDisplay.classList.toggle("checkout__change--error", change < 0);
  });

  checkoutForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const paymentMethod = document.querySelector("input[name='paymentMethod']:checked")?.value;

    if (paymentMethod === "efectivo") {
      const received = Number(valuePaidInput.value || 0);
      if (received < Math.ceil(totals.total)) {
        showToast("El valor recibido es insuficiente.", "error");
        return;
      }
    }

    try {
      const saleData = await registerSale();
      await loadProductsFromAPI();
      if (typeof renderHistory === 'function') {
        renderHistory();
      }
      renderSaleSuccess(saleData);
    } catch (error) {
      console.error(error);
      showToast(error.message || "Error al procesar la venta.", "error");
    }
  });
}
