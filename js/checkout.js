// ============================================================
// checkout.js - Flujo de pago y confirmación de venta
// ============================================================

const checkoutContainer = document.querySelector(
  ".checkout__content-container",
);
const checkoutSection = document.querySelector("#checkoutSection");

// ============================================================
// PANTALLA DE ÉXITO — se muestra después de confirmar la compra
// ============================================================
function renderSaleSuccess(saleData) {
  checkoutContainer.innerHTML = `
    <div class="sale-success">
      <div class="sale-success__icon">✅</div>
      <h2 class="sale-success__title">¡Venta realizada con éxito!</h2>
      <p class="sale-success__subtitle">La venta ha sido registrada correctamente.</p>

      <div class="sale-success__summary">
        <div class="sale-success__row">
          <span>Total pagado</span>
          <strong>$${saleData.total}</strong>
        </div>
        <div class="sale-success__row">
          <span>Método de pago</span>
          <strong>${saleData.payment?.method || "-"}</strong>
        </div>
        ${
          saleData.payment?.method === "efectivo"
            ? `
        <div class="sale-success__row">
          <span>Cambio entregado</span>
          <strong>$${Number(saleData.payment.change || 0).toLocaleString("es-CO")}</strong>
        </div>`
            : ""
        }
        <div class="sale-success__row">
          <span>Cliente</span>
          <strong>${saleData.customer?.name || "-"}</strong>
        </div>
        <div class="sale-success__row">
          <span>Productos</span>
          <strong>${saleData.items.length} ítem(s)</strong>
        </div>
      </div>

      <div class="sale-success__actions">
        <button class="sale-success__btn-home" onclick="navigate('home'); renderCart();">
          🏠 Volver al inicio
        </button>
        <button class="sale-success__btn-history" onclick="navigate('profile'); initAdmin();">
          📋 Ver historial
        </button>
      </div>
    </div>
  `;
}

// ============================================================
// FORMULARIO DE CHECKOUT
// ============================================================
function renderCheckout() {
  checkoutContainer.innerHTML = "";

  if (state.cart.length === 0) {
    renderSaleSuccess({ total: "0", payment: {}, customer: {}, items: [] });
    return;
  }

  const subtotal = state.cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const iva = subtotal * 0.19;
  const total = subtotal + iva;

  let cartItemsHTML = "";
  state.cart.forEach((item) => {
    cartItemsHTML += `
      <div class="checkout__item">
        <h4>${item.name}</h4>
        <p>Cantidad: ${item.quantity} — $${(item.price * item.quantity).toLocaleString("es-CO")}</p>
      </div>
    `;
  });

  checkoutContainer.innerHTML = `
    <h2>Resumen de Compra</h2>
    <div class="checkout__items">${cartItemsHTML}</div>
    <div class="checkout__totals">
      <p>Subtotal: $${subtotal.toLocaleString("es-CO")}</p>
      <p>IVA (19%): $${iva.toLocaleString("es-CO")}</p>
      <h3>Total: $${total.toLocaleString("es-CO")}</h3>
    </div>

    <form id="checkoutForm">
      <h3>Información del Cliente</h3>
      <div>
        <label>Nombre:</label>
        <input type="text" id="customerName" required>
      </div>
      <div>
        <label>Email:</label>
        <input type="email" id="customerEmail">
      </div>
      <div>
        <label>Teléfono:</label>
        <input type="tel" id="customerPhone">
      </div>
      <div>
        <label>Dirección:</label>
        <input type="text" id="customerAddress">
      </div>

      <h3>Método de Pago</h3>
      <div class="payment__methods">
        <label class="payment__option">
          <input type="radio" name="paymentMethod" value="efectivo" required> Efectivo
        </label>
        <label class="payment__option">
          <input type="radio" name="paymentMethod" value="nequi"> Nequi
        </label>
        <label class="payment__option">
          <input type="radio" name="paymentMethod" value="debe"> Debe
        </label>
      </div>

      <div id="efectivoFields" class="payment__fields payment__fields--hidden">
        <label>Valor Recibido:</label>
        <input type="number" id="valuePaid" placeholder="0" min="${Math.ceil(total)}">
        <p id="changeDisplay"></p>
      </div>

      <button type="submit">Confirmar Venta</button>
    </form>
  `;

  const checkoutForm = document.getElementById("checkoutForm");
  const paymentMethods = document.querySelectorAll(
    "input[name='paymentMethod']",
  );
  const efectivoFields = document.getElementById("efectivoFields");
  const valuePaidInput = document.getElementById("valuePaid");
  const changeDisplay = document.getElementById("changeDisplay");

  paymentMethods.forEach((method) => {
    method.addEventListener("change", function () {
      if (this.value === "efectivo") {
        efectivoFields.classList.remove("payment__fields--hidden");
        valuePaidInput.required = true;
      } else {
        efectivoFields.classList.add("payment__fields--hidden");
        valuePaidInput.required = false;
        changeDisplay.textContent = "";
      }
    });
  });

  valuePaidInput.addEventListener("input", function () {
    const received = parseInt(this.value) || 0;
    const change = received - Math.ceil(total);
    if (this.value !== "") {
      if (change >= 0) {
        changeDisplay.textContent = `Cambio: $${change.toLocaleString("es-CO")}`;
        changeDisplay.style.color = "#2e7d32";
      } else {
        changeDisplay.textContent = `Falta: $${Math.abs(change).toLocaleString("es-CO")}`;
        changeDisplay.style.color = "#c62828";
      }
    }
  });

  checkoutForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const paymentMethod = document.querySelector(
      "input[name='paymentMethod']:checked",
    )?.value;
    if (!paymentMethod) {
      showToast("Selecciona un método de pago.", "error");
      return;
    }
    if (paymentMethod === "efectivo") {
      const received = parseInt(valuePaidInput.value);
      if (!received || received < Math.ceil(total)) {
        showToast("El valor recibido es insuficiente.", "error");
        return;
      }
    }

    // Actualizar stock de TODOS los productos vendidos en Google Sheets
    console.log(
      "%c📦 INICIANDO ACTUALIZACIÓN DE STOCK",
      "color: #0066cc; font-weight: bold; font-size: 14px;",
    );

    const stockUpdatePromises = state.cart.map((item) => {
      const prod = products.find((p) => p.id === item.id);
      if (!prod) return Promise.resolve();

      // Actualizar en memoria
      const oldStock = prod.stock || 0;
      prod.stock = Math.max(0, oldStock - item.quantity);

      console.log(`%c🔄 Producto: ${prod.name}`, "color: #666;");
      console.log(`   Cantidad vendida: ${item.quantity}`);
      console.log(
        `   Stock anterior: ${oldStock} → Stock nuevo: ${prod.stock}`,
      );

      // Sincronizar con Google Sheets
      console.log(
        "%c   ⬆️ ENVIANDO UPDATE STOCK:",
        "color: #FF9800; font-weight: bold;",
      );
      const updateData = {
        id: prod.id,
        nombre: prod.name,
        categoria: prod.category,
        precio: prod.price,
        costo: prod.cost,
        codigo: prod.code,
        seguimientoInventario: prod.tracking !== false,
        stock: prod.stock,
        imagen: prod.image,
        descripcion: prod.description,
      };
      console.log(updateData);

      return apiUpdate("productos", updateData)
        .then((response) => {
          console.log(
            "%c   ✅ RESPUESTA EXITOSA:",
            "color: #4CAF50; font-weight: bold;",
          );
          console.log(response);
          return response;
        })
        .catch((e) => {
          console.error(
            "%c   ❌ ERROR actualizando stock:",
            "color: #f44336; font-weight: bold;",
          );
          console.error(e);
          throw e;
        });
    });

    try {
      // Esperar a que se actualice TODO el stock antes de registrar
      await Promise.all(stockUpdatePromises);

      console.log(
        "%c✅ TODOS LOS STOCKS ACTUALIZADOS EN GOOGLE SHEETS",
        "color: #4CAF50; font-weight: bold; font-size: 13px;",
      );

      // Ahora registrar la venta
      console.log(
        "%c📝 Registrando la venta...",
        "color: #0066cc; font-weight: bold;",
      );
      const saleData = await registerSale();
      renderHistory();

      console.log(
        "%c✅ VENTA REGISTRADA EXITOSAMENTE",
        "color: #4CAF50; font-weight: bold; font-size: 13px;",
      );

      // Mostrar pantalla de éxito con los datos de la venta
      renderSaleSuccess(saleData);
    } catch (error) {
      console.error(
        "%c❌ ERROR EN EL PROCESO DE VENTA:",
        "color: #f44336; font-weight: bold; font-size: 13px;",
      );
      console.error(error);
      showToast("Error al procesar la venta. Intenta de nuevo.", "error");
    }
  });
}
