function formatMoney(value) {
  return Number(value || 0).toLocaleString("es-CO");
}

function getManagementContent() {
  const historySection = document.getElementById("historySection");
  const historyContent = document.querySelector(".history__content-sales");
  const adminContent = document.getElementById("adminContent");

  if (historySection) historySection.classList.add("admin-listing");
  if (adminContent) adminContent.innerHTML = "";
  return historyContent;
}

async function renderDiscountsModule() {
  const ac = getManagementContent();
  if (!ac) return;
  ac.innerHTML = '<p class="admin__empty">Cargando descuentos...</p>';
  const discounts = await apiGet("descuentos");

  ac.innerHTML = `
    <section class="admin-inline-module">
      <h2 class="history-content-title admin-module-title">Descuentos</h2>
      <form id="discountForm" class="admin__form-grid">
        <input type="hidden" id="discountId">
        <input id="discountName" placeholder="Nombre" required>
        <select id="discountType">
          <option value="PORCENTAJE">Porcentaje</option>
          <option value="FIJO">Valor fijo</option>
        </select>
        <input id="discountValue" type="number" min="1" placeholder="Valor" required>
        <label style="display:flex;gap:8px;align-items:center;"><input id="discountActive" type="checkbox" checked> Activo</label>
        <button type="submit" class="btn-save">Guardar</button>
      </form>
      <div class="history-card">
        <div class="history-header"><span>Nombre</span><span>Tipo</span><span>Valor</span><span>Estado</span><span>Acciones</span></div>
        ${discounts.map((d) => `
          <div class="history-row">
            <span>${d.nombre}</span>
            <span>${d.tipo}</span>
            <span>${d.tipo === "PORCENTAJE" ? `${d.valor}%` : `$${formatMoney(d.valor)}`}</span>
            <span>${d.activo ? "Activo" : "Inactivo"}</span>
            <span>
              <button class="btn-edit-discount btn-edit" data-id="${d.id}">Editar</button>
              <button class="btn-delete-discount btn-delete" data-id="${d.id}">Eliminar</button>
            </span>
          </div>`).join("")}
      </div>
    </section>`;

  ac.querySelector("#discountForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = ac.querySelector("#discountId").value;
    const payload = {
      id: Number(id),
      nombre: ac.querySelector("#discountName").value.trim(),
      tipo: ac.querySelector("#discountType").value,
      valor: Number(ac.querySelector("#discountValue").value || 0),
      activo: ac.querySelector("#discountActive").checked
    };
    const result = id ? await apiUpdate("descuentos", payload) : await apiPost("descuentos", payload);
    showToast(result.success ? "Descuento guardado." : result.message, result.success ? "success" : "error");
    if (result.success) renderDiscountsModule();
  });

  ac.querySelectorAll(".btn-edit-discount").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = discounts.find((d) => d.id === Number(btn.dataset.id));
      ac.querySelector("#discountId").value = item.id;
      ac.querySelector("#discountName").value = item.nombre;
      ac.querySelector("#discountType").value = item.tipo;
      ac.querySelector("#discountValue").value = item.valor;
      ac.querySelector("#discountActive").checked = item.activo;
    });
  });

  ac.querySelectorAll(".btn-delete-discount").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!(await showConfirm("Eliminar este descuento?"))) return;
      await apiDelete("descuentos", { id: Number(btn.dataset.id) });
      renderDiscountsModule();
    });
  });
}

async function renderShortagesModule(filters = {}) {
  const ac = getManagementContent();
  if (!ac) return;
  ac.innerHTML = '<p class="admin__empty">Cargando faltantes...</p>';
  const query = new URLSearchParams();
  if (filters.tipo) query.set("tipo", filters.tipo);
  if (filters.proveedor) query.set("proveedor", filters.proveedor);
  if (filters.resuelto) query.set("resuelto", filters.resuelto);
  const shortages = await apiGet(`faltantes${query.toString() ? `?${query.toString()}` : ""}`);

  ac.innerHTML = `
    <section class="admin-inline-module">
      <h2 class="history-content-title admin-module-title">Faltantes y demanda no atendida</h2>
      <form id="shortageForm" class="admin__form-grid">
        <input id="shortageProduct" placeholder="Producto solicitado" required>
        <select id="shortageType">
          <option value="AGOTADO">Agotado</option>
          <option value="NO_EXISTE">No existe</option>
        </select>
        <input id="shortageProvider" placeholder="Proveedor sugerido">
        <input id="shortageQty" type="number" min="1" value="1">
        <input id="shortageCustomer" placeholder="Cliente">
        <button type="submit" class="btn-save">Registrar</button>
      </form>
      <form id="shortageFilters" class="admin__form-grid">
        <select id="shortageFilterType">
          <option value="">Todos los tipos</option>
          <option value="AGOTADO" ${filters.tipo === "AGOTADO" ? "selected" : ""}>Agotado</option>
          <option value="NO_EXISTE" ${filters.tipo === "NO_EXISTE" ? "selected" : ""}>No existe</option>
        </select>
        <input id="shortageFilterProvider" placeholder="Filtrar por proveedor" value="${filters.proveedor || ""}">
        <select id="shortageFilterStatus">
          <option value="">Todos los estados</option>
          <option value="false" ${filters.resuelto === "false" ? "selected" : ""}>Pendientes</option>
          <option value="true" ${filters.resuelto === "true" ? "selected" : ""}>Resueltos</option>
        </select>
        <button type="submit" class="btn-save">Filtrar</button>
      </form>
      <div class="history-card">
        <div class="history-header"><span>Producto</span><span>Tipo</span><span>Proveedor</span><span>Cant.</span><span>Estado</span><span>Acciones</span></div>
        ${shortages.map((f) => `
          <div class="history-row">
            <span>${f.nombreProducto}</span>
            <span>${f.tipo}</span>
            <span>${f.proveedor || "-"}</span>
            <span>${f.cantidadSolicitada}</span>
            <span>${f.resuelto ? "Resuelto" : "Pendiente"}</span>
            <span>
              ${f.resuelto ? "" : `<button class="btn-resolve-shortage btn-edit" data-id="${f.id}">Resolver</button>`}
              <button class="btn-delete-shortage btn-delete" data-id="${f.id}">Eliminar</button>
            </span>
          </div>`).join("")}
      </div>
    </section>`;

  ac.querySelector("#shortageForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const result = await apiPost("faltantes", {
      nombreProducto: ac.querySelector("#shortageProduct").value.trim(),
      tipo: ac.querySelector("#shortageType").value,
      proveedor: ac.querySelector("#shortageProvider").value.trim(),
      cantidadSolicitada: Number(ac.querySelector("#shortageQty").value || 1),
      cliente: ac.querySelector("#shortageCustomer").value.trim()
    });
    showToast(result.success ? "Faltante registrado." : result.message, result.success ? "success" : "error");
    if (result.success) renderShortagesModule(filters);
  });

  ac.querySelector("#shortageFilters").addEventListener("submit", (event) => {
    event.preventDefault();
    renderShortagesModule({
      tipo: ac.querySelector("#shortageFilterType").value,
      proveedor: ac.querySelector("#shortageFilterProvider").value.trim(),
      resuelto: ac.querySelector("#shortageFilterStatus").value
    });
  });

  ac.querySelectorAll(".btn-resolve-shortage").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await apiUpdate("faltantes", { id: Number(btn.dataset.id), resuelto: true });
      renderShortagesModule(filters);
    });
  });

  ac.querySelectorAll(".btn-delete-shortage").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!(await showConfirm("Eliminar este faltante?"))) return;
      await apiDelete("faltantes", { id: Number(btn.dataset.id) });
      renderShortagesModule(filters);
    });
  });
}

async function renderReportsModule() {
  const ac = getManagementContent();
  if (!ac) return;
  const today = new Date().toISOString().slice(0, 10);
  ac.innerHTML = `
    <section class="admin-inline-module">
      <h2 class="history-content-title admin-module-title">Reportes basicos</h2>
      <form id="reportsForm" class="admin__form-grid">
        <input id="reportFrom" type="date" value="${today}">
        <input id="reportTo" type="date" value="${today}">
        <button type="submit" class="btn-save">Consultar</button>
      </form>
      <div id="reportsResult"></div>
    </section>`;

  async function loadReport() {
    const desde = ac.querySelector("#reportFrom").value;
    const hasta = ac.querySelector("#reportTo").value || desde;
    const report = await apiGet(`reportes/basicos?desde=${desde}&hasta=${hasta}`);
    const result = ac.querySelector("#reportsResult");
    result.innerHTML = `
      <div class="history-card">
        <div class="history-row"><span>Ventas</span><span>${report.ventasTotales.cantidad}</span><span>$${formatMoney(report.ventasTotales.total)}</span></div>
        <div class="history-row"><span>Compras</span><span>${report.comprasRegistradas.cantidad}</span><span>$${formatMoney(report.comprasRegistradas.total)}</span></div>
      </div>
      <h3 class="history-content-title admin-section-title">Productos mas vendidos</h3>
      <div class="history-card">
        ${report.productosMasVendidos.slice(0, 10).map((p) => `<div class="history-row"><span>${p.nombre}</span><span>${p.cantidad} und.</span><span>$${formatMoney(p.total)}</span></div>`).join("") || "<p>No hay ventas en el rango.</p>"}
      </div>
      <h3 class="history-content-title admin-section-title">Faltantes frecuentes</h3>
      <div class="history-card">
        ${report.faltantesFrecuentes.slice(0, 10).map((f) => `<div class="history-row"><span>${f.nombreProducto}</span><span>${f.cantidadSolicitada} solicitados</span><span>${f.pendientes} pendientes</span></div>`).join("") || "<p>No hay faltantes registrados.</p>"}
      </div>`;
  }

  ac.querySelector("#reportsForm").addEventListener("submit", (event) => {
    event.preventDefault();
    loadReport();
  });
  loadReport();
}
