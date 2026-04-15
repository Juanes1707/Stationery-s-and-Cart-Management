// ============================================================
// sales.js - Registro de ventas y manejo de ventas abiertas
// Depende de: api.js, state.js, storage.js, history.js
// ============================================================
 
// ============================================================
// VENTAS ABIERTAS (sección 2.2 del documento)
// Una "venta abierta" es un carrito guardado con nombre/id
// que el usuario puede retomar más tarde sin perder los items.
// Se guardan en localStorage bajo la clave "ventasAbiertas".
// ============================================================
 
// Devuelve el array de ventas abiertas guardadas
function getOpenSales() {
  try {
    const data = localStorage.getItem('ventasAbiertas');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}
 
// Persiste el array de ventas abiertas en localStorage
function saveOpenSales(openSales) {
  localStorage.setItem('ventasAbiertas', JSON.stringify(openSales));
}
 
// Guarda el carrito actual como una venta abierta.
// Si ya existe una venta abierta con el mismo id la reemplaza.
function holdCurrentSale() {
  if (state.cart.length === 0) {
    alert('El carrito está vacío. Agrega productos antes de guardar la venta.');
    return;
  }
 
  // Pedimos un nombre opcional para identificar la venta (ej: "Mesa 3", "Cliente Juan")
  const label = prompt('Nombre o referencia para esta venta (opcional):') || '';
 
  const openSales = getOpenSales();
 
  // Si ya hay una venta abierta activa la actualizamos; si no, creamos una nueva
  const activeId = state.activeOpenSaleId || Date.now();
  state.activeOpenSaleId = activeId;
 
  const existingIdx = openSales.findIndex(s => s.id === activeId);
  const openSale = {
    id:    activeId,
    label: label || `Venta #${activeId}`,
    date:  new Date().toLocaleString('es-CO'),
    items: [...state.cart]   // copia del carrito actual
  };
 
  if (existingIdx >= 0) {
    openSales[existingIdx] = openSale;
  } else {
    openSales.push(openSale);
  }
 
  saveOpenSales(openSales);
 
  // Vaciamos el carrito actual y limpiamos el id activo
  state.cart = [];
  state.activeOpenSaleId = null;
  saveCart();
  renderCart();
 
  alert(`Venta "${openSale.label}" guardada. Puedes retomar la desde el historial.`);
}
 
// Retoma una venta abierta: carga sus items en el carrito y la elimina de la lista
function resumeOpenSale(openSaleId) {
  const openSales = getOpenSales();
  const idx = openSales.findIndex(s => s.id === openSaleId);
  if (idx === -1) return;
 
  const openSale = openSales[idx];
 
  // Si ya hay items en el carrito preguntamos qué hacer
  if (state.cart.length > 0) {
    const ok = confirm(
      `Ya tienes items en el carrito. ¿Reemplazar el carrito con la venta "${openSale.label}"?`
    );
    if (!ok) return;
  }
 
  // Cargar items en el carrito y marcar el id activo
  state.cart = [...openSale.items];
  state.activeOpenSaleId = openSale.id;
 
  // Eliminar de la lista de abiertas (ya está en el carrito)
  openSales.splice(idx, 1);
  saveOpenSales(openSales);
  saveCart();
  renderCart();
 
  // Navegar al home para que el usuario continúe la venta
  navigate('home');
  alert(`Venta "${openSale.label}" retomada. Puedes continuar desde el carrito.`);
}
 
// Elimina una venta abierta sin retomar
function deleteOpenSale(openSaleId) {
  const openSales = getOpenSales().filter(s => s.id !== openSaleId);
  saveOpenSales(openSales);
}
 
// Renderiza el listado de ventas abiertas dentro del historial
function renderOpenSales(container) {
  const openSales = getOpenSales();
 
  if (openSales.length === 0) return; // No mostrar nada si no hay ventas abiertas
 
  let html = `
    <div class="open-sales__section">
      <h3 class="open-sales__title">🔖 Ventas abiertas</h3>
      <div class="open-sales__list">
  `;
 
  openSales.forEach(sale => {
    html += `
      <div class="open-sale__card">
        <div class="open-sale__info">
          <strong>${escapeHtml(sale.label)}</strong>
          <span>${sale.date}</span>
          <span>${sale.items.length} producto(s)</span>
        </div>
        <div class="open-sale__actions">
          <button class="btn-resume-sale" data-id="${sale.id}">Retomar</button>
          <button class="btn-delete-open-sale" data-id="${sale.id}">Descartar</button>
        </div>
      </div>
    `;
  });
 
  html += `</div></div>`;
  container.insertAdjacentHTML('afterbegin', html);
 
  // Conectar eventos
  container.querySelectorAll('.btn-resume-sale').forEach(btn => {
    btn.addEventListener('click', e => {
      resumeOpenSale(Number(e.currentTarget.dataset.id));
    });
  });
 
  container.querySelectorAll('.btn-delete-open-sale').forEach(btn => {
    btn.addEventListener('click', e => {
      if (confirm('¿Descartar esta venta abierta?')) {
        deleteOpenSale(Number(e.currentTarget.dataset.id));
        renderHistory(); // refrescar
      }
    });
  });
}
 
// ============================================================
// REGISTRAR VENTA CERRADA
// Guarda la venta en el state, localStorage y Google Sheets
// ============================================================
async function registerSale() {
  // Verificar que el carrito no esté vacío
  if (state.cart.length === 0) return;
 
  // Calcular subtotal, IVA y total
  const subtotal = state.cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const iva   = subtotal * 0.19;
  const total = subtotal + iva;
 
  // Recopilar datos del cliente desde el formulario de checkout
  const customer = {
    name:    document.getElementById('customerName')?.value    || '',
    email:   document.getElementById('customerEmail')?.value   || '',
    phone:   document.getElementById('customerPhone')?.value   || '',
    address: document.getElementById('customerAddress')?.value || ''
  };
 
  // Recopilar método de pago
  const paymentMethod = document.querySelector("input[name='paymentMethod']:checked")?.value || '';
  const payment = { method: paymentMethod };
  if (paymentMethod === 'efectivo') {
    const received     = parseInt(document.getElementById('valuePaid')?.value) || 0;
    payment.valuePaid  = received;
    payment.change     = received - Math.ceil(total);
  }
 
  // Construir el objeto de la venta
  const newSale = {
    id:       Date.now(),
    date:     new Date().toLocaleString('es-CO'),
    total:    total.toLocaleString('es-CO'),
    items:    state.cart.map(item => ({
      name:     item.name,
      quantity: item.quantity,
      price:    item.price
    })),
    customer,
    payment
  };
 
  // 1. Guardar en el state local
  state.sales.push(newSale);
  saveSales();
 
  // 2. Enviar a Google Sheets (petición POST asíncrona)
  // itemsJson guarda los productos como texto JSON en una sola celda
  // ya que Sheets no soporta arrays anidados de forma nativa
  try {
    await apiPost('ventas', {
      id:             newSale.id,
      fecha:          newSale.date,
      clienteId:      newSale.customer.name,   // usamos el nombre como referencia
      metodoPago:     newSale.payment.method,
      total:          total,                   // número, no string formateado
      itemsJson:      JSON.stringify(newSale.items)
    });
  } catch (e) {
    // Si falla el envío a Sheets la venta igual queda en localStorage
    console.error('Error al guardar venta en Google Sheets:', e);
  }
 
  // 3. Limpiar el carrito y el id de venta abierta activa
  state.cart = [];
  state.activeOpenSaleId = null;
  saveCart();
 
  // 4. Actualizar vistas
  if (typeof renderCart     === 'function') renderCart();
  if (typeof renderHistory  === 'function') renderHistory();
}
 
// ============================================================
// FUNCIÓN LEGACY — se mantiene para no romper referencias antiguas
// ============================================================
function renderSales() {
  // Esta función fue reemplazada por renderHistory() en history.js
  // Se mantiene vacía para compatibilidad
}