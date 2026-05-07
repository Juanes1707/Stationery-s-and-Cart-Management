// ============================================================
// purchases.js - Registro de compras a proveedores
// ============================================================

function getPurchases() {
  try {
    return JSON.parse(localStorage.getItem("compras")) || [];
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
    const purchases = Array.isArray(data)
      ? data.map((p) => ({
          id: p.id,
          fecha: p.fecha ? String(p.fecha).split("T")[0] : "",
          proveedor: p.proveedor || p.proveedorId || "",
          proveedorId: p.proveedorId,
          total: Number(p.total || 0),
          items: Array.isArray(p.itemsJson) ? p.itemsJson : p.itemsJson?.items || [],
        }))
      : [];
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

  const purchases = await getPurchasesFromAPI();
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
      html += `
        <div class="history-row" style="grid-template-columns:1fr 1.4fr 1.4fr 1fr 0.6fr;">
          <span>#${String(purchase.id).slice(-6)}</span>
          <span>${purchase.fecha}</span>
          <span>${purchase.proveedor || "-"}</span>
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

    document.getElementById("btnAddPcItem").addEventListener("click", () => {
      const productId = parseInt(document.getElementById("pcProductSelect").value, 10);
      const qty = parseInt(document.getElementById("pcQty").value, 10);
      const cost = parseFloat(document.getElementById("pcCost").value);
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

    document.getElementById("btnConfirmPurchase").addEventListener("click", async () => {
      const provider = document.getElementById("pcProvider").value.trim();
      const date = document.getElementById("pcDate").value;
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
          fecha: date,
          proveedorId: provider,
          total,
          itemsJson: purchaseItems,
        });

        const purchases = getPurchases();
        purchases.push({
          id: result?.data?.id || Date.now(),
          fecha: date,
          proveedor: provider,
          proveedorId: provider,
          total,
          items: purchaseItems,
        });
        savePurchases(purchases);
        showToast("Compra registrada en SQLite.");
      } catch (error) {
        console.error(error);
        showToast("No se pudo registrar la compra en SQLite.", "error");
        return;
      }

      modal.remove();
      await renderPurchasesModule();
      renderProducts(products);
    });
  });
}
