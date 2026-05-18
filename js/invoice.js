let currentInvoiceId = null; //Crear una variable que guarda el id de la venta, Variable global que empieza en null por que no hay ninguna factura seleccionada
const IVA_RATE = 0.19; //constante del porcentaje de iva

//Funcioj que recibe un numero y lo devuelve como texto en formato colombiano
function formatCOP(value) {
  return Number(value || 0).toLocaleString("es-CO");
}

//Busca dentro del historial el state sales para que la venta tenga el id que se le envio
function findSaleById(saleId) {
  return state.sales.find(s => String(s.id) === String(saleId));
}

//Funcion para agarrar el div de la factura
function getInvoiceContainer() {
  return document.querySelector("#invoiceContainer");
}

// Quita la factura de la pantalla y “olvida” cuál venta estabas viendo.
// Hace falta al cambiar de pestaña en el menú lateral: la factura va aparte del
// listado, y si no la cerramos aquí se quedaría abajo aunque ya no mires el historial.
function clearInvoicePanel() {
  currentInvoiceId = null;
  const inv = getInvoiceContainer();
  if (inv) inv.innerHTML = "";
}
//Devuelve el precio unitario del producto
function getItemPrice(item) {
  if (item.price != null) return Number(item.price);

  return 0;
}

//Esta función se encarga de meter el HTML dinámico
function renderInvoiceBase(invoiceContainer) {
  // estructura base
  invoiceContainer.innerHTML = `
    <div class="factura-box" id="factura-contenido">

      <div class="header-legal">
        <h2>PAPEL Y LUNA</h2>
        <p>
          <strong>PAPELERIA Y MISCELANEA</strong><br>
        </p>

        <p>
          Calle 10 número 5 -35<br>
          Chía, Cundinamarca 250002
        </p>

        <p><i>"El lugar perfecto para encontrar todo lo que necesitas."</i></p>
      </div>

      <div class="linea"></div>

      <div id="info-venta"></div>

      <div class="linea"></div>

      <table>
        <thead>
          <tr>
            <th align="left">Cant. Descripción</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody id="lista-productos"></tbody>
      </table>

      <div class="linea"></div>

      <div id="totales-venta"></div>

      <div class="linea"></div>

      <p>Gracias por preferirnos!</p>

    </div>
  `;
}
//Inserta dentro de #info-venta la info real de la venta, busca dentro de la factura el div donde va la info
function renderInvoiceInfo(invoiceContainer, sale) {
  const infoVentaEl = invoiceContainer.querySelector("#info-venta");
  infoVentaEl.innerHTML = `
    <div class="flex">
      <span><b>Factura:</b> #${sale.id}</span>
      <span><b>Fecha:</b> ${sale.date}</span>
    </div>
  `;
}

//Es el que renderiza los productos de la tabla y calcula el subtotal
function renderInvoiceItems(invoiceContainer, items) {
  const listaProductosEl = invoiceContainer.querySelector("#lista-productos");
  let subtotal = 0;

  (items || []).forEach(item => {
    const qty = Number(item.quantity || 0); //Cantidad del producto
    const price = getItemPrice(item); //Precio unitario
    const totalItem = qty * price; //total
    subtotal += totalItem; //Acumula el subtotal

    listaProductosEl.innerHTML += `
      <tr>
        <td>${qty} ${item.name}</td>
        <td class="text-right">$${formatCOP(totalItem)}</td>
      </tr>
    `; //agrega una fila a la tbala
  });

  return subtotal;
}
//Funcion que se encarga de convertir el total guardado en la venta a un numero real
function normalizeSaleTotal(rawTotal) {
  let totalVenta = rawTotal; //Copia el valor para manipularlo

  if (typeof totalVenta === "string") {
    // Quitar puntos de miles y cambiar coma decimal si existiera.
    totalVenta = Number(totalVenta.replace(/\./g, "").replace(",", "."));
  } else {
    totalVenta = Number(totalVenta); //Si no es string convierte todo a number
  }

  return totalVenta;
}
//Decide cual es el total final
function calculateFinalTotal(rawTotal, subtotal) {
  const normalizedTotal = normalizeSaleTotal(rawTotal); //Obtiene el total limpio

  // Si no existe total, lo calculamos con subtotal + IVA 19%.
  if (!normalizedTotal || isNaN(normalizedTotal)) {
    return subtotal + (subtotal * IVA_RATE);
  }

  return normalizedTotal; //Si si habia total lo devuelve
}
//Renders de totales
function renderInvoiceTotals(invoiceContainer, subtotal, totalVenta) {
  const iva = totalVenta - subtotal;

  const totalesEl = invoiceContainer.querySelector("#totales-venta");
  totalesEl.innerHTML = `
    <div class="flex"><span><b>Subtotal:</b></span><span>$${formatCOP(subtotal)}</span></div>
    <div class="flex"><span><b>IVA (19%):</b></span><span>$${formatCOP(iva)}</span></div>
    <div class="flex"><span><b>Total:</b></span><span><b>$${formatCOP(totalVenta)}</b></span></div>
  `;
}
// Muestra en pantalla la factura de una venta (el recuadro de abajo).
function renderInvoice(saleId) {
  const sale = findSaleById(saleId);
  if (!sale) {
    if (typeof showToast === "function") showToast("No se encontró la venta.", "error");
    return;
  }

  const invoiceContainer = getInvoiceContainer();
  if (!invoiceContainer) return;

  renderInvoiceBase(invoiceContainer); //Estructura
  renderInvoiceInfo(invoiceContainer, sale); //Id y fecha

  const subtotal = renderInvoiceItems(invoiceContainer, sale.items || []);// Items + subtotal
  const totalVenta = calculateFinalTotal(sale.total, subtotal); //total final

  renderInvoiceTotals(invoiceContainer, subtotal, totalVenta);
}

// Botón Factura: un segundo clic en la misma venta la cierra; si tocas Factura en otra fila, ves esa.
document.addEventListener("click", (event) => {
  const btn = event.target.closest(".btn-invoice"); //Revisa que si lo que clickie esta dentro de un boton
  if (!btn) return;

  const saleId = btn.dataset.id;
  const inv = getInvoiceContainer();
  const visible = Boolean(inv?.querySelector("#factura-contenido"));

  if (visible && String(currentInvoiceId) === String(saleId)) {
    clearInvoicePanel();
    return;
  }

  currentInvoiceId = saleId;
  navigate("invoice"); // Vista de la factura
});
