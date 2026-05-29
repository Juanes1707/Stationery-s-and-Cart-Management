// ============================================================
// purchases.js - Registro de compras a proveedores
// ============================================================

function normalizePurchaseDate(value) {
  if (!value) return "";
  if (value instanceof Date) {
    return value.toLocaleString("es-CO");
  }
  if (typeof value === "number") {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleString("es-CO");
  }
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleString("es-CO");
    }
    return value;
  }
  if (typeof value === "object") {
    if (value.date || value.fecha || value.fechaISO || value.value) {
      return normalizePurchaseDate(value.date || value.fecha || value.fechaISO || value.value);
    }
    if (typeof value.valueOf === "function") {
      const primitive = value.valueOf();
      if (primitive !== value) return normalizePurchaseDate(primitive);
    }
    const objectString = reconstructDateString(value);
    if (objectString) return normalizePurchaseDate(objectString);
    if (typeof value.toISOString === "function") {
      const parsed = new Date(value.toISOString());
      return isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleString("es-CO");
    }
    if (typeof value.toJSON === "function") {
      const parsed = new Date(value.toJSON());
      return isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleString("es-CO");
    }
    if (value._seconds != null || value.seconds != null) {
      const seconds = Number(value._seconds ?? value.seconds);
      const nanos = Number(value._nanoseconds ?? value.nanoseconds ?? 0);
      const parsed = new Date(seconds * 1000 + nanos / 1e6);
      return isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleString("es-CO");
    }
    if (value.year != null && value.month != null && value.day != null) {
      const year = Number(value.year);
      const month = Number(value.month) - 1;
      const day = Number(value.day);
      const parsed = new Date(year, month, day);
      return isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleString("es-CO");
    }
    return String(value);
  }
  return String(value);
}

function reconstructDateString(obj) {
  if (!obj || typeof obj !== "object") return "";
  const stringKeys = Object.keys(obj).filter(key => /^[0-9]+$/.test(key)).sort((a, b) => Number(a) - Number(b));
  if (!stringKeys.length) return "";
  return stringKeys.map((key) => obj[key]).join("");
}

function getPurchases() {
  try {
    const stored = JSON.parse(localStorage.getItem("compras")) || [];
    return stored.map((p) => ({
      ...p,
      fecha: normalizePurchaseDate(p.fecha || p.fechaISO || p.date),
      total: Number(p.total || 0),
      items: Array.isArray(p.items) ? p.items : [],
    }));
  } catch (e) {
    return [];
  }
}

function savePurchases(list) {
  localStorage.setItem("compras", JSON.stringify(list));
}

async function getPurchasesFromAPI() {
  try {
    const data = await apiGet("compras");
    const serverList = Array.isArray(data) ? data : [];
    const localList = getPurchases();

    const purchases = serverList.map((p) => {
      const local = localList.find((lp) => String(lp.id) === String(p.id));
      const proveedorFromServer = p.proveedor || p.proveedorId || "";
      const proveedor = proveedorFromServer || (local && local.proveedor) || "";
      return {
        id: p.id,
        fecha: normalizePurchaseDate(p.fecha || p.fechaISO || p.date),
        proveedor: proveedor,
        proveedorId: p.proveedorId ?? local?.proveedorId ?? proveedor,
        total: Number(p.total || 0),
        items: Array.isArray(p.itemsJson) ? p.itemsJson : p.itemsJson?.items || [],
      };
    });

    savePurchases(purchases);
    return purchases;
  } catch (e) {
    console.error("Error cargando compras desde SQLite:", e);
    return getPurchases();
  }
}

async function renderPurchasesModule() {
  const historySection = document.getElementById("historySection");
  const historyContent = document.querySelector(".history__content-sales");
  if (!historySection || !historyContent) return;

  historySection.classList.add("admin-listing");
  historyContent.innerHTML = '<p class="admin__empty">Cargando compras...</p>';

  // Asegurar que la caché de proveedores esté poblada para resolver nombres
  if (!entityListCache || !Array.isArray(entityListCache.proveedores) || entityListCache.proveedores.length === 0) {
    try {
      const provs = await apiGet("proveedores");
      entityListCache.proveedores = Array.isArray(provs) ? provs : [];
      saveLocalEntity("proveedores", entityListCache.proveedores);
    } catch (err) {
      console.warn("No se pudo precargar proveedores:", err);
      entityListCache.proveedores = entityListCache.proveedores || [];
    }
  }
  const purchases = await getPurchasesFromAPI();
  const providers = (entityListCache && Array.isArray(entityListCache.proveedores)) ? entityListCache.proveedores : [];
  let html = `
    <div class="admin__list-header">
      <h2>Registro de Compras</h2>
      <button id="btnNewPurchase" class="btn-add-product">+ Nueva Compra</button>
    </div>
  `;

  if (purchases.length === 0) {
    html += '<p class="admin__empty">No hay compras registradas.</p>';
  } else {
    html += `
      <div class="history-card">
        <div class="history-header">
          <span>ID</span><span>FECHA</span><span>PROVEEDOR</span><span>TOTAL</span><span>ITEMS</span>
        </div>
    `;
    purchases.forEach((purchase) => {
      const items = Array.isArray(purchase.items) ? purchase.items : [];
      // Resolver nombre de proveedor: preferir campo `proveedor`, si no buscar por `proveedorId` en cache
      let providerName = purchase.proveedor || "";
      if (!providerName && purchase.proveedorId) {
        const found = providers.find(p => String(p.id) === String(purchase.proveedorId) || String(p.nombre) === String(purchase.proveedorId));
        if (found) providerName = found.nombre || String(purchase.proveedorId);
      }
      if (!providerName) providerName = "-";
      html += `
        <div class="history-row" style="grid-template-columns:1fr 1.4fr 1.4fr 1fr 0.6fr;">
          <span>#${String(purchase.id).slice(-6)}</span>
          <span>${purchase.fecha}</span>
          <span>${providerName}</span>
          <span>$${Number(purchase.total).toLocaleString("es-CO")}</span>
          <span>${items.length}</span>
        </div>`;
    });
    html += "</div>";
  }

  historyContent.innerHTML = html;
  document.getElementById("btnNewPurchase").addEventListener("click", openPurchaseModal);
}

function openPurchaseModal() {
  let purchaseItems = [];

  const formHtml = `
    <button class="close-btn">&times;</button>
    <h3 class="admin__form-title">Nueva Compra</h3>

    <div class="admin__form-row">
      <div class="admin__form-group">
        <label>Proveedor *</label>
        <input id="pcProvider" placeholder="Nombre del proveedor">
      </div>
      <div class="admin__form-group">
        <label>Fecha</label>
        <input id="pcDate" type="date" value="${new Date().toISOString().split("T")[0]}">
      </div>
    </div>

    <div class="purchase-add-item">
      <h4 style="margin-bottom:10px; color:#555;">Agregar producto a la compra</h4>
      <div class="admin__form-group">
        <label>Producto</label>
        <select id="pcProductSelect">
          <option value="">Selecciona un producto</option>
          ${products.map((p) => `<option value="${p.id}">${escapeHtml(p.name)} (stock: ${p.stock ?? 0})</option>`).join("")}
        </select>
      </div>
      <div class="admin__form-row">
        <div class="admin__form-group">
          <label>Cantidad</label>
          <input id="pcQty" type="number" min="1" value="1">
        </div>
        <div class="admin__form-group">
          <label>Costo unitario</label>
          <input id="pcCost" type="number" min="0" value="0">
        </div>
      </div>
      <button type="button" id="btnAddPcItem" class="btn-save" style="width:100%;">+ Agregar item</button>
    </div>

    <div id="pcItemsList" style="margin:12px 0;"></div>
    <div id="pcTotal" style="font-weight:700;font-size:1rem;text-align:right;margin-bottom:12px;color:#333;"></div>

    <div class="admin__form-actions">
      <button type="button" id="btnConfirmPurchase" class="btn-save">Confirmar Compra</button>
      <button type="button" id="btnCancelPurchase" class="btn-clear">Cancelar</button>
    </div>
  `;

  openFloatingModal(formHtml, (modal) => {
    modal.querySelector(".close-btn").addEventListener("click", () => modal.remove());
    document.getElementById("btnCancelPurchase").addEventListener("click", () => modal.remove());

    function renderItems() {
      const container = document.getElementById("pcItemsList");
      const totalEl = document.getElementById("pcTotal");
      if (!container) return;
      if (purchaseItems.length === 0) {
        container.innerHTML = "";
        totalEl.textContent = "";
        return;
      }

      let html = `<table class="sd-table"><thead><tr>
        <th>Producto</th><th style="text-align:center;">Cant.</th>
        <th style="text-align:right;">Costo unit.</th><th style="text-align:right;">Subtotal</th><th></th>
      </tr></thead><tbody>`;
      purchaseItems.forEach((item, index) => {
        html += `<tr>
          <td>${item.name}</td>
          <td style="text-align:center;">${item.quantity}</td>
          <td style="text-align:right;">$${Number(item.cost).toLocaleString("es-CO")}</td>
          <td style="text-align:right;font-weight:600;">$${Number(item.subtotal).toLocaleString("es-CO")}</td>
          <td><button class="remove-pc-item btn-delete" data-idx="${index}" style="padding:3px 8px;">x</button></td>
        </tr>`;
      });
      html += "</tbody></table>";
      container.innerHTML = html;

      container.querySelectorAll(".remove-pc-item").forEach((btn) => {
        btn.addEventListener("click", (event) => {
          purchaseItems.splice(Number(event.currentTarget.dataset.idx), 1);
          renderItems();
        });
      });

      const total = purchaseItems.reduce((acc, item) => acc + item.subtotal, 0);
      totalEl.textContent = `Total: $${total.toLocaleString("es-CO")}`;
    }

    const addItemBtn = modal.querySelector("#btnAddPcItem");
    const confirmPurchaseBtn = modal.querySelector("#btnConfirmPurchase");
    const providerInput = modal.querySelector("#pcProvider");
    const dateInput = modal.querySelector("#pcDate");
    const productSelect = modal.querySelector("#pcProductSelect");
    const qtyInput = modal.querySelector("#pcQty");
    const costInput = modal.querySelector("#pcCost");

    if (addItemBtn) {
      addItemBtn.addEventListener("click", () => {
        const productId = parseInt(productSelect?.value || "", 10);
        const qty = parseInt(qtyInput?.value || "", 10);
        const cost = parseFloat(costInput?.value || "");
        if (!productId || isNaN(qty) || qty < 1 || isNaN(cost) || cost < 0) {
          showToast("Completa producto, cantidad y costo validos.", "error");
          return;
        }

        const product = products.find((p) => p.id === productId);
        if (!product) return;

        const existing = purchaseItems.find((item) => item.productId === productId);
        if (existing) {
          existing.quantity += qty;
          existing.cost = cost;
          existing.subtotal = existing.quantity * existing.cost;
        } else {
          purchaseItems.push({ productId, name: product.name, quantity: qty, cost, subtotal: qty * cost });
        }
        renderItems();
      });
    }

    if (confirmPurchaseBtn) {
      confirmPurchaseBtn.addEventListener("click", async () => {
        const provider = providerInput?.value.trim() || "";
        const date = dateInput?.value || "";
        if (!provider) {
          showToast("Ingresa el nombre del proveedor.", "error");
          return;
        }
        if (purchaseItems.length === 0) {
          showToast("Agrega al menos un producto.", "error");
          return;
        }

        const total = purchaseItems.reduce((acc, item) => acc + item.subtotal, 0);

        try {
          await Promise.all(purchaseItems.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            if (!product) return Promise.resolve();

            product.stock = (product.stock || 0) + item.quantity;
            product.cost = item.cost;
            return apiUpdate("productos", {
              id: product.id,
              nombre: product.name,
              categoria: product.category,
              precio: product.price,
              costo: product.cost,
              codigo: product.code,
              seguimientoInventario: product.tracking,
              stock: product.stock,
              imagen: product.image,
              descripcion: product.description,
            });
          }));

          const result = await apiPost("compras", {
            id: Date.now(),
            fecha: new Date(date || new Date()).toISOString(),
            proveedorId: provider,
            total,
            itemsJson: purchaseItems,
          });
          console.log("[compras] apiPost result:", result);

          if (!result?.success) {
            throw new Error(result?.message || "No se pudo registrar la compra.");
          }

          const purchases = getPurchases();
          purchases.push({
            id: result.data?.id || Date.now(),
            fecha: normalizePurchaseDate(new Date(date || new Date())),
            proveedor: provider,
            proveedorId: provider,
            total,
            items: purchaseItems,
          });
          savePurchases(purchases);
          showToast("Compra registrada en SQLite.", "success");
        } catch (error) {
          console.error(error);
          showToast(error.message || "No se pudo registrar la compra en SQLite.", "error");
          return;
        }

        modal.remove();
        if (typeof loadProductsFromAPI === "function") {
          await loadProductsFromAPI();
        }
        await renderPurchasesModule();
        if (typeof renderProducts === "function") {
          renderProducts(products);
        }
      });
    }
  });
}
