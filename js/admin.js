// ============================================================
// admin.js - Panel admin: CRUD productos como modal flotante
// ============================================================

// ── Toast ────────────────────────────────────────────────────
function showToast(msg, type = "success") {
  let t = document.getElementById("appToast");
  if (!t) {
    t = document.createElement("div");
    t.id = "appToast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.className = `app-toast app-toast--${type} app-toast--visible`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("app-toast--visible"), 3200);
}

// ── Modal de confirmación ─────────────────────────────────────
function showConfirm(msg) {
  return new Promise((resolve) => {
    document.getElementById("appConfirmModal")?.remove();
    const modal = document.createElement("div");
    modal.id = "appConfirmModal";
    modal.className = "sale-details-modal";
    modal.innerHTML = `
      <div class="sale-details-content modal-narrow">
        <p style="font-size:1rem;">${msg}</p>
        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:18px;">
          <button id="confirmNo"  class="confirm-btn confirm-btn--no">Cancelar</button>
          <button id="confirmYes" class="confirm-btn confirm-btn--yes">Confirmar</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector("#confirmYes").addEventListener("click", () => {
      modal.remove();
      resolve(true);
    });
    modal.querySelector("#confirmNo").addEventListener("click", () => {
      modal.remove();
      resolve(false);
    });
  });
}

// ── Modal flotante genérico ───────────────────────────────────
function openFloatingModal(contentHtml, onReady) {
  document.getElementById("floatingFormModal")?.remove();
  const modal = document.createElement("div");
  modal.id = "floatingFormModal";
  modal.className = "sale-details-modal";
  modal.innerHTML = `<div class="sale-details-content floating-form">${contentHtml}</div>`;
  document.body.appendChild(modal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });
  if (typeof onReady === "function") onReady(modal);
  return modal;
}

// ── Inicialización del panel ──────────────────────────────────
function initAdmin() {
  const btnHistory = document.getElementById("adminHistoryBtn");
  const btnCrud = document.getElementById("adminCrudBtn");
  const btnPurchases = document.getElementById("adminPurchasesBtn");
  const btnEntities = document.getElementById("adminEntitiesBtn");
  const adminContent = document.getElementById("adminContent");
  const adminPanel = document.getElementById("adminPanel");

  if (!adminContent || !adminPanel) return;
  if (adminPanel.dataset.inited === "1") return;
  adminPanel.dataset.inited = "1";

  btnHistory.addEventListener("click", () => {
    setActiveMenuButton(btnHistory);
    renderAdminHistory();
  });

  btnCrud.addEventListener("click", () => {
    setActiveMenuButton(btnCrud);
    renderAdminCRUD();
    adminPanel.classList.add("open");
    document.querySelector(".app__container").classList.add("admin-open");
  });

  btnPurchases?.addEventListener("click", () => {
    setActiveMenuButton(btnPurchases);
    adminContent.innerHTML = "";
    renderPurchasesModule();
    adminPanel.classList.add("open");
    document.querySelector(".app__container").classList.add("admin-open");
  });

  btnEntities?.addEventListener("click", () => {
    setActiveMenuButton(btnEntities);
    adminContent.innerHTML = "";
    renderEntitiesModule();
    adminPanel.classList.add("open");
    document.querySelector(".app__container").classList.add("admin-open");
  });

  setActiveMenuButton(btnHistory);
  renderAdminHistory();
}

function setActiveMenuButton(btn) {
  document
    .querySelectorAll(".admin__menu-btn")
    .forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
}

function renderAdminHistory() {
  document.getElementById("historySection")?.classList.remove("admin-listing");
  const inv = document.getElementById("invoiceContainer");
  if (inv) inv.innerHTML = "";
  renderHistory();
  const ac = document.getElementById("adminContent");
  if (ac) ac.innerHTML = "";
}

function renderAdminCRUD() {
  const ac = document.getElementById("adminContent");
  if (ac) ac.innerHTML = "";
  renderProductsInMainArea();
}

// ── Formulario de producto como MODAL FLOTANTE ────────────────
function openProductModal(existingId = null) {
  const prod = existingId ? products.find((p) => p.id === existingId) : null;
  const title = prod ? "Editar Producto" : "Agregar Producto";

  const formHtml = `
    <button class="close-btn">&times;</button>
    <h3 class="admin__form-title">${title}</h3>
    <form id="floatingProductForm" autocomplete="off">
      <input type="hidden" id="fpId" value="${prod ? prod.id : ""}">

      <div class="admin__form-group">
        <label>Nombre *</label>
        <input id="fpName" value="${prod ? escapeHtml(prod.name) : ""}" placeholder="Ej: Cuaderno universitario" required>
      </div>

      <div class="admin__form-group">
        <label>Categoría *</label>
        <input id="fpCategory" value="${prod ? escapeHtml(prod.category) : ""}" placeholder="Ej: Cuadernos" required>
      </div>

      <div class="admin__form-row">
        <div class="admin__form-group">
          <label>Precio venta *</label>
          <input id="fpPrice" type="number" min="0" value="${prod ? prod.price : ""}" placeholder="0" required>
        </div>
        <div class="admin__form-group">
          <label>Costo proveedor *</label>
          <input id="fpCost" type="number" min="0" value="${prod ? prod.cost : ""}" placeholder="0" required>
        </div>
      </div>

      <div class="admin__form-row">
        <div class="admin__form-group">
          <label>Código interno *</label>
          <input id="fpCode" value="${prod ? escapeHtml(prod.code || "") : ""}" placeholder="SKU-001" required>
        </div>
        <div class="admin__form-group">
          <label>Stock *</label>
          <input id="fpStock" type="number" min="0" value="${prod ? prod.stock : ""}" placeholder="0" required>
        </div>
      </div>

      <div class="admin__form-group">
        <label>Seguimiento inventario</label>
        <select id="fpTracking">
          <option value="true"  ${!prod || prod.tracking ? "selected" : ""}>Sí</option>
          <option value="false" ${prod && !prod.tracking ? "selected" : ""}>No</option>
        </select>
      </div>

      <div class="admin__form-group">
        <label>URL de imagen</label>
        <input id="fpImage" value="${prod ? prod.image || "" : ""}" placeholder="https://... o ./imagenes y recursos/foto.jpg">
        <small style="color:#888;font-size:0.78rem;margin-top:3px;">
          💡 Puedes usar una URL pública de imagen (Google Drive, Imgur, etc.)
        </small>
      </div>

      <div class="admin__form-group">
        <label>Descripción</label>
        <textarea id="fpDescription" rows="2" placeholder="Descripción breve...">${prod ? prod.description || "" : ""}</textarea>
      </div>

      <div class="admin__form-actions">
        <button type="submit" class="btn-save">💾 Guardar</button>
        <button type="button" id="fpCancel" class="btn-clear">Cancelar</button>
      </div>
    </form>
  `;

  const modal = openFloatingModal(formHtml, (m) => {
    m.querySelector(".close-btn").addEventListener("click", () => m.remove());
    m.querySelector("#fpCancel").addEventListener("click", () => m.remove());

    m.querySelector("#floatingProductForm").addEventListener(
      "submit",
      async (e) => {
        e.preventDefault();
        const id = document.getElementById("fpId").value;
        const name = document.getElementById("fpName").value.trim();
        const category = document.getElementById("fpCategory").value.trim();
        const price = parseFloat(document.getElementById("fpPrice").value);
        const cost = parseFloat(document.getElementById("fpCost").value);
        const code = document.getElementById("fpCode").value.trim();
        const stock = parseInt(document.getElementById("fpStock").value, 10);
        const tracking = document.getElementById("fpTracking").value === "true";
        const image =
          document.getElementById("fpImage").value.trim() ||
          "./imagenes y recursos/default.jpg";
        const description = document
          .getElementById("fpDescription")
          .value.trim();

        if (
          !name ||
          !category ||
          isNaN(price) ||
          price < 0 ||
          isNaN(cost) ||
          cost < 0 ||
          !code ||
          isNaN(stock) ||
          stock < 0
        ) {
          showToast("Completa todos los campos obligatorios (*).", "error");
          return;
        }

        const toSheets = (sid) => ({
          id: sid,
          nombre: name,
          categoria: category,
          precio: price,
          costo: cost,
          codigo: code,
          seguimientoInventario: tracking,
          stock,
          imagen: image,
          descripcion: description,
        });

        if (id) {
          // Editar
          const p = products.find((p) => p.id === Number(id));
          if (p)
            Object.assign(p, {
              name,
              category,
              price,
              cost,
              code,
              tracking,
              stock,
              image,
              description,
            });
          try {
            await apiUpdate("productos", toSheets(Number(id)));
            showToast("Producto actualizado.");
          } catch (err) {
            console.error(err);
            showToast("Error al sincronizar con Sheets.", "error");
          }
        } else {
          // Crear
          const newId = Date.now();
          products.push({
            id: newId,
            name,
            category,
            price,
            cost,
            code,
            tracking,
            stock,
            image,
            description,
          });
          try {
            await apiPost("productos", toSheets(newId));
            showToast("Producto agregado.");
          } catch (err) {
            console.error(err);
            showToast("Error al sincronizar con Sheets.", "error");
          }
        }

        m.remove();
        renderProducts(products);
        if (typeof rebuildCategoryButtons === "function")
          rebuildCategoryButtons();
        renderProductsInMainArea();
      },
    );
  });
}

// ── Listado de productos ──────────────────────────────────────
function renderProductsInMainArea() {
  const historySection = document.getElementById("historySection");
  const historyContent = document.querySelector(".history__content-sales");
  if (!historySection || !historyContent) return;
  if (!Array.isArray(products)) products = [];
  historySection.classList.add("admin-listing");

  let html = `
    <div class="admin__list-header">
      <h2>Productos</h2>
      <button id="mainAddProduct" class="btn-add-product">+ Agregar Producto</button>
    </div>
  `;

  if (products.length === 0) {
    html += '<p class="admin__empty">No hay productos registrados.</p>';
    historyContent.innerHTML = html;
    document
      .getElementById("mainAddProduct")
      .addEventListener("click", () => openProductModal());
    return;
  }

  html += '<div class="admin-product-grid">';
  products.forEach((p) => {
    html += `
      <div class="admin-product-card">
        <div class="admin-product-info">
          <div class="admin-product-name">${escapeHtml(p.name)}</div>
          <div class="admin-product-meta">
            <span class="admin-product-cat">${escapeHtml(p.category)}</span>
            <span class="admin-product-price">$${Number(p.price).toLocaleString("es-CO")}</span>
          </div>
          <div class="admin-product-stock">Stock: <strong>${p.stock ?? 0}</strong></div>
        </div>
        <div class="admin-product-actions">
          <button class="main-edit btn-edit"    data-id="${p.id}">✏️ Editar</button>
          <button class="main-delete btn-delete" data-id="${p.id}">🗑️ Eliminar</button>
        </div>
      </div>`;
  });
  html += "</div>";
  historyContent.innerHTML = html;

  document
    .getElementById("mainAddProduct")
    .addEventListener("click", () => openProductModal());

  historyContent.querySelectorAll(".main-edit").forEach((btn) => {
    btn.addEventListener("click", (e) =>
      openProductModal(Number(e.currentTarget.dataset.id)),
    );
  });

  historyContent.querySelectorAll(".main-delete").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = Number(e.currentTarget.dataset.id);
      const ok = await showConfirm(
        "¿Eliminar este producto? No se puede deshacer.",
      );
      if (ok) deleteProduct(id);
    });
  });
}

async function deleteProduct(id) {
  try {
    await apiDelete("productos", { id });
    products = products.filter((p) => p.id !== id);
    showToast("Producto eliminado.");
  } catch (e) {
    console.error("Error eliminando producto en Sheets:", e);
    showToast("No se pudo eliminar en Sheets. Intenta de nuevo.", "error");
    return;
  }

  renderProducts(products);
  if (typeof rebuildCategoryButtons === "function") rebuildCategoryButtons();
  renderProductsInMainArea();
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        m
      ],
  );
}
