// ============================================================
// purchases.js - Registro de compras a proveedores
// El formulario se abre como modal flotante
// ============================================================

function getPurchases() {
  try { return JSON.parse(localStorage.getItem('compras')) || []; }
  catch (e) { return []; }
}
function savePurchases(list) { localStorage.setItem('compras', JSON.stringify(list)); }

// ── Vista principal: listado de compras ───────────────────────
function renderPurchasesModule() {
  const historySection = document.getElementById('historySection');
  const historyContent = document.querySelector('.history__content-sales');
  if (!historySection || !historyContent) return;
  historySection.classList.add('admin-listing');

  const purchases = getPurchases();
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
          <span>ID</span><span>FECHA</span><span>PROVEEDOR</span><span>TOTAL</span><span>ÍTEMS</span>
        </div>
    `;
    purchases.forEach(p => {
      const items = typeof p.itemsJson === 'string' ? JSON.parse(p.itemsJson) : (p.items || []);
      html += `
        <div class="history-row" style="grid-template-columns:1fr 1.4fr 1.4fr 1fr 0.6fr;">
          <span>#${String(p.id).slice(-6)}</span>
          <span>${p.fecha}</span>
          <span>${p.proveedor || '—'}</span>
          <span>$${Number(p.total).toLocaleString('es-CO')}</span>
          <span>${items.length}</span>
        </div>`;
    });
    html += `</div>`;
  }

  historyContent.innerHTML = html;
  document.getElementById('btnNewPurchase').addEventListener('click', openPurchaseModal);
}

// ── Modal flotante de nueva compra ───────────────────────────
function openPurchaseModal() {
  let purchaseItems = [];

  const formHtml = `
    <button class="close-btn">&times;</button>
    <h3 class="admin__form-title">📦 Nueva Compra</h3>

    <div class="admin__form-row">
      <div class="admin__form-group">
        <label>Proveedor *</label>
        <input id="pcProvider" placeholder="Nombre del proveedor">
      </div>
      <div class="admin__form-group">
        <label>Fecha</label>
        <input id="pcDate" type="date" value="${new Date().toISOString().split('T')[0]}">
      </div>
    </div>

    <div class="purchase-add-item">
      <h4 style="margin-bottom:10px; color:#555;">Agregar producto a la compra</h4>
      <div class="admin__form-group">
        <label>Producto</label>
        <select id="pcProductSelect">
          <option value="">— Selecciona un producto —</option>
          ${products.map(p => `<option value="${p.id}">${escapeHtml(p.name)} (stock: ${p.stock ?? 0})</option>`).join('')}
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
      <button type="button" id="btnAddPcItem" class="btn-save" style="width:100%;">+ Agregar ítem</button>
    </div>

    <div id="pcItemsList" style="margin:12px 0;"></div>
    <div id="pcTotal" style="font-weight:700;font-size:1rem;text-align:right;margin-bottom:12px;color:#333;"></div>

    <div class="admin__form-actions">
      <button type="button" id="btnConfirmPurchase" class="btn-save">✅ Confirmar Compra</button>
      <button type="button" id="btnCancelPurchase"  class="btn-clear">Cancelar</button>
    </div>
  `;

  const modal = openFloatingModal(formHtml, (m) => {
    m.querySelector('.close-btn').addEventListener('click', () => m.remove());
    document.getElementById('btnCancelPurchase').addEventListener('click', () => m.remove());

    function renderItems() {
      const container = document.getElementById('pcItemsList');
      const totalEl   = document.getElementById('pcTotal');
      if (!container) return;
      if (purchaseItems.length === 0) { container.innerHTML = ''; totalEl.textContent = ''; return; }

      let html = `<table class="sd-table"><thead><tr>
        <th>Producto</th><th style="text-align:center;">Cant.</th>
        <th style="text-align:right;">Costo unit.</th><th style="text-align:right;">Subtotal</th><th></th>
      </tr></thead><tbody>`;
      purchaseItems.forEach((item, i) => {
        html += `<tr>
          <td>${item.name}</td>
          <td style="text-align:center;">${item.quantity}</td>
          <td style="text-align:right;">$${Number(item.cost).toLocaleString('es-CO')}</td>
          <td style="text-align:right;font-weight:600;">$${Number(item.subtotal).toLocaleString('es-CO')}</td>
          <td><button class="remove-pc-item btn-delete" data-idx="${i}" style="padding:3px 8px;">✕</button></td>
        </tr>`;
      });
      html += `</tbody></table>`;
      container.innerHTML = html;

      container.querySelectorAll('.remove-pc-item').forEach(btn => {
        btn.addEventListener('click', e => {
          purchaseItems.splice(Number(e.currentTarget.dataset.idx), 1);
          renderItems();
        });
      });

      const total = purchaseItems.reduce((acc, i) => acc + i.subtotal, 0);
      totalEl.textContent = `Total: $${total.toLocaleString('es-CO')}`;
    }

    document.getElementById('btnAddPcItem').addEventListener('click', () => {
      const productId = parseInt(document.getElementById('pcProductSelect').value);
      const qty       = parseInt(document.getElementById('pcQty').value);
      const cost      = parseFloat(document.getElementById('pcCost').value);
      if (!productId || isNaN(qty) || qty < 1 || isNaN(cost) || cost < 0) {
        showToast('Completa producto, cantidad y costo válidos.', 'error'); return;
      }
      const product = products.find(p => p.id === productId);
      if (!product) return;
      const existing = purchaseItems.find(i => i.productId === productId);
      if (existing) { existing.quantity += qty; existing.subtotal = existing.quantity * existing.cost; }
      else purchaseItems.push({ productId, name: product.name, quantity: qty, cost, subtotal: qty * cost });
      renderItems();
    });

    document.getElementById('btnConfirmPurchase').addEventListener('click', async () => {
      const provider = document.getElementById('pcProvider').value.trim();
      const date     = document.getElementById('pcDate').value;
      if (!provider) { showToast('Ingresa el nombre del proveedor.', 'error'); return; }
      if (purchaseItems.length === 0) { showToast('Agrega al menos un producto.', 'error'); return; }

      const total = purchaseItems.reduce((acc, i) => acc + i.subtotal, 0);
      const newPurchase = {
        id: Date.now(), fecha: date, proveedor: provider,
        total, items: purchaseItems, itemsJson: JSON.stringify(purchaseItems)
      };

      const purchases = getPurchases();
      purchases.push(newPurchase);
      savePurchases(purchases);

      // Actualizar stock local + Sheets por cada producto comprado
      purchaseItems.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        if (prod) {
          prod.stock = (prod.stock || 0) + item.quantity;
          apiUpdate('productos', {
            id: prod.id, nombre: prod.name, categoria: prod.category,
            precio: prod.price, costo: prod.cost, codigo: prod.code,
            seguimientoInventario: prod.tracking, stock: prod.stock,
            imagen: prod.image, descripcion: prod.description
          }).catch(e => console.error('Error actualizando stock:', e));
        }
      });

      try {
        await apiPost('compras', {
          id: newPurchase.id, fecha: date, proveedorId: provider,
          total, itemsJson: newPurchase.itemsJson
        });
        showToast('Compra registrada y enviada a Google Sheets.');
      } catch (e) {
        console.error(e);
        showToast('Guardada localmente. Error al sincronizar con Sheets.', 'error');
      }

      m.remove();
      renderPurchasesModule();
      renderProducts(products); // actualizar catálogo con nuevo stock
    });
  });
}