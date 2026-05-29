// ============================================================
// history.js - Historial de ventas
// ============================================================

function parseItemsJson(value) {
  if (!value) return [];
  if (typeof value !== 'string') return value;
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === 'string' ? parseItemsJson(parsed) : parsed;
  } catch (error) {
    return [];
  }
}

function formatSaleDate(value) {
  if (typeof normalizeDateValue === 'function') {
    return normalizeDateValue(value);
  }
  if (!value) return '';
  if (value instanceof Date) return value.toLocaleString('es-CO');
  if (value instanceof String) return value.valueOf();
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? value : parsed.toLocaleString('es-CO');
  }
  if (typeof value === 'object') {
    if (value.date || value.fecha || value.fechaISO || value.value) {
      return formatSaleDate(value.date || value.fecha || value.fechaISO || value.value);
    }
    if (typeof value.valueOf === 'function') {
      const primitive = value.valueOf();
      if (primitive !== value) return formatSaleDate(primitive);
    }
    const keys = Object.keys(value).filter(key => /^[0-9]+$/.test(key)).sort((a, b) => Number(a) - Number(b));
    if (keys.length > 0) {
      return formatSaleDate(keys.map(key => value[key]).join(''));
    }
    return '';
  }
  return String(value);
}

function renderHistory() {
  const historySection = document.querySelector('.history__content-sales');
  if (!historySection) return;

  if (state.sales.length === 0) {
    historySection.innerHTML = `
      <h2 class="history-content-title">Historial de ventas</h2>
      <p style="color:#888; text-align:center; margin-top:16px;">No hay ventas registradas.</p>
    `;
  } else {
    let content = `
      <h2 class="history-content-title">Historial de ventas</h2>
      <div class="history-card history-sales-card">
        <div class="history-header">
          <span>ID</span><span>FECHA</span><span>TOTAL</span>
          <span>ESTADO</span><span>DETALLES</span><span>FACTURA</span><span>REEMBOLSO</span>
        </div>
    `;
    state.sales.forEach(sale => {
      const estado = sale.estado || '';
      const isRefunded = ['REEMBOLSADA', 'REEMBOLSO_TOTAL', 'REEMBOLSO_PARCIAL'].includes(estado) || sale.reembolsada === true;
      const isOpen = estado === 'ABIERTA';
      const statusClass = isRefunded ? 'refunded' : isOpen ? 'pending' : 'delivered';
      const statusLabel = isRefunded ? 'Reembolsada' : isOpen ? 'En corrección' : 'Entregado';
      content += `
        <div class="history-row">
          <span>#${String(sale.id).slice(-6)}</span>
          <span>${formatSaleDate(sale.date)}</span>
          <span>$${sale.total}</span>
          <span class="status ${statusClass}">${statusLabel}</span>
          <button class="btn-details" data-id="${sale.id}">Ver detalles</button>
          <button class="btn-invoice" data-id="${sale.id}">Factura</button>
          <button class="btn-refund" data-id="${sale.id}" ${isRefunded ? 'disabled title="Ya fue reembolsada"' : ''}>Reembolsar</button>
        </div>
      `;
    });
    content += `</div>`;
    historySection.innerHTML = content;

    historySection.querySelectorAll('.btn-details').forEach(btn => {
      btn.addEventListener('click', e => showSaleDetails(Number(e.currentTarget.dataset.id)));
    });
    historySection.querySelectorAll('.btn-refund').forEach(btn => {
      btn.addEventListener('click', e => showRefundModal(Number(e.currentTarget.dataset.id)));
    });
  }

  if (typeof renderOpenSales === 'function') renderOpenSales(historySection);
}

// ============================================================
// Modal de detalles — diseño profesional y organizado
// ============================================================
function showSaleDetails(saleId) {
  const sale = state.sales.find(s => s.id === saleId);
  if (!sale) return;

  document.getElementById('saleDetailsModal')?.remove();

  const subtotal = sale.items.reduce((acc, i) => acc + (Number(i.price) * Number(i.quantity)), 0);
  const total    = typeof sale.total === 'string'
    ? Number(sale.total.replace(/\./g, '').replace(',', '.'))
    : Number(sale.total);
  const iva = total - subtotal;

  const itemsRows = sale.items.map(i => `
    <tr>
      <td>${i.name}</td>
      <td style="text-align:center;">${i.quantity}</td>
      <td style="text-align:right;">$${Number(i.price).toLocaleString('es-CO')}</td>
      <td style="text-align:right; font-weight:600;">$${(Number(i.price)*Number(i.quantity)).toLocaleString('es-CO')}</td>
    </tr>
  `).join('');

  const modal = document.createElement('div');
  modal.id        = 'saleDetailsModal';
  modal.className = 'sale-details-modal';
  modal.innerHTML = `
    <div class="sale-details-content sale-details-professional">
      <button class="close-btn" aria-label="Cerrar">&times;</button>

      <!-- Encabezado -->
      <div class="sd-header">
        <div>
          <h3 class="sd-title">Detalle de Venta</h3>
          <span class="sd-id">#${String(sale.id).slice(-6)}</span>
        </div>
        <span class="status delivered" style="align-self:flex-start;">Entregado</span>
      </div>

      <div class="sd-meta">
        <span>📅 ${formatSaleDate(sale.date)}</span>
      </div>

      <!-- Sección cliente -->
      <div class="sd-section">
        <h4 class="sd-section-title">👤 Cliente</h4>
        <div class="sd-grid">
          <div class="sd-field"><span class="sd-label">Nombre</span><span>${sale.customer?.name || '—'}</span></div>
          <div class="sd-field"><span class="sd-label">Teléfono</span><span>${sale.customer?.phone || '—'}</span></div>
          <div class="sd-field"><span class="sd-label">Email</span><span>${sale.customer?.email || '—'}</span></div>
          <div class="sd-field"><span class="sd-label">Dirección</span><span>${sale.customer?.address || '—'}</span></div>
        </div>
      </div>

      <!-- Sección pago -->
      <div class="sd-section">
        <h4 class="sd-section-title">💳 Pago</h4>
        <div class="sd-grid">
          <div class="sd-field"><span class="sd-label">Método</span><span style="text-transform:capitalize;">${sale.payment?.method || '—'}</span></div>
          ${sale.payment?.method === 'efectivo' ? `
          <div class="sd-field"><span class="sd-label">Recibido</span><span>$${Number(sale.payment.valuePaid||0).toLocaleString('es-CO')}</span></div>
          <div class="sd-field"><span class="sd-label">Cambio</span><span>$${Number(sale.payment.change||0).toLocaleString('es-CO')}</span></div>
          ` : ''}
        </div>
      </div>

      <!-- Tabla de productos -->
      <div class="sd-section">
        <h4 class="sd-section-title">🛍️ Productos</h4>
        <table class="sd-table">
          <thead>
            <tr>
              <th>Producto</th><th style="text-align:center;">Cant.</th>
              <th style="text-align:right;">Precio unit.</th><th style="text-align:right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>${itemsRows}</tbody>
        </table>
      </div>

      <!-- Totales -->
      <div class="sd-totals">
        <div class="sd-total-row"><span>Subtotal</span><span>$${subtotal.toLocaleString('es-CO')}</span></div>
        <div class="sd-total-row"><span>IVA (19%)</span><span>$${iva.toLocaleString('es-CO')}</span></div>
        <div class="sd-total-row sd-total-final"><span>Total</span><span>$${sale.total}</span></div>
      </div>

      <!-- Botones de acción -->
      <div style="display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end;">
        <button class="btn-close-modal" style="padding: 8px 16px; background: #e0e0e0; border: none; border-radius: 4px; cursor: pointer;">Cerrar</button>
        <button class="btn-correct-sale" data-id="${sale.id}" style="padding: 8px 16px; background: #ff9800; color: white; border: none; border-radius: 4px; cursor: pointer;">✏️ Corregir Venta</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
  modal.querySelector('.btn-close-modal').addEventListener('click', () => modal.remove());
  modal.querySelector('.btn-correct-sale').addEventListener('click', (e) => {
    const saleId = Number(e.currentTarget.dataset.id);
    modal.remove();
    openSaleForCorrection(saleId);
  });
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

// ============================================================
// Corregir venta — abrir venta cerrada para modificación
// ============================================================
async function openSaleForCorrection(saleId) {
  try {
    const response = await authFetch(`${API_URL}/ventas/${saleId}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({
        nuevoEstado: 'ABIERTA',
        justificacion: 'Corrección manual por usuario'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      showAppAlert(`Error: ${error.message}`, 'error');
      return;
    }

    const result = await response.json();
    const ventaAbierta = result.data;

    // Crear modal de corrección
    showCorrectionModal(ventaAbierta);
  } catch (error) {
    console.error('Error al abrir venta para corrección:', error);
    showAppAlert('No se pudo abrir la venta para corrección.', 'error');
  }
}

/**
 * Modal interactivo para corregir una venta abierta
 */
async function showCorrectionModal(venta) {
  document.getElementById('correctionModal')?.remove();

  const parsedItems = parseItemsJson(venta.itemsJson);
  const items = Array.isArray(parsedItems) ? parsedItems : (parsedItems.items || []);
  const originalItems = items.map(i => ({ ...i }));
  const subtotal = items.reduce((acc, i) => acc + (Number(i.precio ?? i.price ?? 0) * Number(i.cantidad ?? i.quantity ?? 0)), 0);
  const iva = subtotal * 0.19;
  const total = subtotal + iva;

  const itemsRows = items.map((i, idx) => `
    <tr data-index="${idx}">
      <td>${i.nombre || i.name}</td>
      <td><input type="number" class="correction-qty" value="${i.cantidad ?? i.quantity}" min="1" data-index="${idx}" style="width:60px; padding: 4px;"></td>
      <td>$${Number(i.precio ?? i.price ?? 0).toLocaleString('es-CO')}</td>
      <td>$<span class="correction-subtotal">${(Number(i.precio ?? i.price ?? 0)*Number(i.cantidad ?? i.quantity ?? 0)).toLocaleString('es-CO')}</span></td>
      <td><button class="btn-remove-item" data-index="${idx}" style="background: #f44336; color: white; border: none; border-radius: 3px; padding: 4px 8px; cursor: pointer;">❌</button></td>
    </tr>
  `).join('');

  const modal = document.createElement('div');
  modal.id = 'correctionModal';
  modal.className = 'sale-details-modal';
  modal.innerHTML = `
    <div class="sale-details-content sale-details-professional">
      <button class="close-btn" aria-label="Cerrar">&times;</button>

      <div class="sd-header">
        <div>
          <h3 class="sd-title">Corregir Venta</h3>
          <span class="sd-id">#${String(venta.id).slice(-6)}</span>
        </div>
        <span class="status pending" style="align-self:flex-start;">EN CORRECCIÓN</span>
      </div>

      <div class="sd-meta">
        <span>⚠️ <strong>Esta venta está abierta para corrección. Realiza los cambios necesarios y guarda.</strong></span>
      </div>

      <!-- Tabla de productos editable -->
      <div class="sd-section">
        <h4 class="sd-section-title">🛍️ Productos (Editable)</h4>
        <table class="sd-table">
          <thead>
            <tr>
              <th>Producto</th><th>Cantidad</th><th>Precio unit.</th><th>Subtotal</th><th></th>
            </tr>
          </thead>
          <tbody id="correction-items">${itemsRows}</tbody>
        </table>
      </div>

      <!-- Totales -->
      <div class="sd-totals">
        <div class="sd-total-row"><span>Subtotal</span><span id="correction-subtotal">$${subtotal.toLocaleString('es-CO')}</span></div>
        <div class="sd-total-row"><span>IVA (19%)</span><span id="correction-iva">$${iva.toLocaleString('es-CO')}</span></div>
        <div class="sd-total-row sd-total-final"><span>Total</span><span id="correction-total">$${total.toLocaleString('es-CO')}</span></div>
      </div>

      <!-- Botones de acción -->
      <div class="modal-actions">
        <button class="btn-cancel-correction btn-clear">Cancelar</button>
        <button class="btn-save-correction btn-save" data-id="${venta.id}">Guardar Corrección</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Event listeners para edición
  const correctionQtyInputs = modal.querySelectorAll('.correction-qty');
  correctionQtyInputs.forEach(input => {
    input.addEventListener('change', () => updateCorrectionTotals(modal, items));
  });

  // Botones de eliminar item
  modal.querySelectorAll('.btn-remove-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = Number(e.currentTarget.dataset.index);
      items.splice(index, 1);
      showCorrectionModal({ ...venta, itemsJson: JSON.stringify(items) });
    });
  });

  // Cerrar modal
  modal.querySelector('.close-btn').addEventListener('click', () => {
    closeCorrectionWithoutSaving(venta.id);
  });
  modal.querySelector('.btn-cancel-correction').addEventListener('click', () => {
    closeCorrectionWithoutSaving(venta.id);
  });

  // Guardar corrección
  modal.querySelector('.btn-save-correction').addEventListener('click', async (e) => {
    const saleId = Number(e.currentTarget.dataset.id);
    await saveCorrectedSale(modal, saleId, items, originalItems);
  });

  modal.addEventListener('click', e => { if (e.target === modal) {} });
}

/**
 * Actualiza los totales en tiempo real mientras se editan cantidades
 */
function updateCorrectionTotals(modal, items) {
  const inputs = modal.querySelectorAll('.correction-qty');
  let newSubtotal = 0;

  inputs.forEach((input, idx) => {
    const newQty = Number(input.value) || 0;
    items[idx].cantidad = newQty;
    items[idx].quantity = newQty;
    const rowSubtotal = Number(items[idx].precio ?? items[idx].price ?? 0) * newQty;
    newSubtotal += rowSubtotal;

    modal.querySelector(`tr[data-index="${idx}"] .correction-subtotal`).textContent =
      rowSubtotal.toLocaleString('es-CO');
  });

  const newIva = newSubtotal * 0.19;
  const newTotal = newSubtotal + newIva;

  modal.querySelector('#correction-subtotal').textContent = `$${newSubtotal.toLocaleString('es-CO')}`;
  modal.querySelector('#correction-iva').textContent = `$${newIva.toLocaleString('es-CO')}`;
  modal.querySelector('#correction-total').textContent = `$${newTotal.toLocaleString('es-CO')}`;
}

/**
 * Cierra corrección sin guardar (reabre a CERRADA)
 */
async function closeCorrectionWithoutSaving(saleId) {
  try {
    await authFetch(`${API_URL}/ventas/${saleId}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ nuevoEstado: 'CERRADA' })
    });
    document.getElementById('correctionModal')?.remove();
    showToast('Se canceló la corrección.');
    if (typeof loadSalesFromAPI === 'function') await loadSalesFromAPI();
    renderHistory();
  } catch (error) {
    console.error('Error al cancelar corrección:', error);
    document.getElementById('correctionModal')?.remove();
    renderHistory();
  }
}

/**
 * Guarda la venta corregida
 */
async function saveCorrectedSale(modal, saleId, updatedItems, originalItems = []) {
  try {
    const subtotal = updatedItems.reduce((acc, i) => acc + (Number(i.precio ?? i.price ?? 0) * Number(i.cantidad ?? i.quantity ?? 0)), 0);
    const total = subtotal * 1.19;

    const response = await authFetch(`${API_URL}/ventas/${saleId}`, {
      method: 'PUT',
      body: JSON.stringify({
        itemsJson: updatedItems,
        total: total,
        estado: 'CERRADA'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      showAppAlert(`Error: ${error.message}`, 'error');
      return;
    }

    await authFetch(`${API_URL}/ventas/${saleId}/recalcular-totales`, {
      method: 'POST'
    });

    // Reconciliar inventario: reintegrar unidades eliminadas o reducidas
    const toRestock = [];
    for (const orig of originalItems) {
      const origId = orig.productoId ?? orig.id;
      const origQty = Number(orig.cantidad ?? orig.quantity ?? 0);
      const updated = updatedItems.find(u => (u.productoId ?? u.id) === origId);
      const newQty = updated ? Number(updated.cantidad ?? updated.quantity ?? 0) : 0;
      const diff = origQty - newQty;
      if (diff > 0) toRestock.push({ productId: origId, quantity: diff });
    }
    if (toRestock.length > 0 && typeof products !== 'undefined' && typeof apiUpdate === 'function') {
      await Promise.allSettled(toRestock.map(({ productId, quantity }) => {
        const product = products.find(p => p.id === productId);
        if (!product || product.tracking === false) return Promise.resolve();
        product.stock = (product.stock || 0) + quantity;
        return apiUpdate('productos', {
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
    }

    modal.remove();
    showToast('Venta corregida y guardada exitosamente.');
    if (typeof loadSalesFromAPI === 'function') await loadSalesFromAPI();
    await loadProductsFromAPI();
    renderHistory();
  } catch (error) {
    console.error('Error al guardar corrección:', error);
    showAppAlert('No se pudo guardar la corrección.', 'error');
  }
}

function showRefundModal(saleId) {
  const sale = state.sales.find(s => s.id === saleId);
  if (!sale) return;

  document.getElementById('refundModal')?.remove();
  const rows = sale.items.map((item, index) => {
    const qty = Number(item.quantity ?? item.cantidad ?? 0);
    return `
      <tr>
        <td><input type="checkbox" class="refund-check" data-index="${index}"></td>
        <td>${item.name || item.nombre}</td>
        <td><input type="number" class="refund-qty" data-index="${index}" min="1" max="${qty}" value="${qty}" disabled style="width:70px;"></td>
        <td>$${Number(item.price ?? item.precio ?? 0).toLocaleString('es-CO')}</td>
      </tr>`;
  }).join('');

  const modal = document.createElement('div');
  modal.id = 'refundModal';
  modal.className = 'sale-details-modal';
  modal.innerHTML = `
    <div class="sale-details-content sale-details-professional">
      <button class="close-btn" aria-label="Cerrar">&times;</button>
      <div class="sd-header">
        <div>
          <h3 class="sd-title">Reembolso</h3>
          <span class="sd-id">#${String(sale.id).slice(-6)}</span>
        </div>
      </div>
      <div class="sd-section">
        <label style="display:flex;gap:8px;align-items:center;margin-bottom:10px;">
          <input type="checkbox" id="refundAll"> Reembolso total
        </label>
        <label style="display:flex;gap:8px;align-items:center;margin-bottom:10px;">
          <input type="checkbox" id="refundReturnStock" checked> El producto retorna al inventario
        </label>
        <textarea id="refundReason" rows="2" placeholder="Motivo del reembolso" style="width:100%;box-sizing:border-box;margin-bottom:12px;"></textarea>
        <table class="sd-table">
          <thead><tr><th></th><th>Producto</th><th>Cant.</th><th>Precio</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="sd-totals">
        <div class="sd-total-row sd-total-final"><span>Valor estimado</span><span id="refundTotal">$0</span></div>
      </div>
      <div class="modal-actions">
        <button class="btn-close-modal btn-clear">Cancelar</button>
        <button class="btn-save-refund confirm-btn confirm-btn--yes">Registrar reembolso</button>
      </div>
    </div>`;

  document.body.appendChild(modal);

  function selectedItems() {
    return Array.from(modal.querySelectorAll('.refund-check:checked')).map((check) => {
      const idx = Number(check.dataset.index);
      const item = sale.items[idx];
      return {
        productoId: item.productoId ?? item.id,
        id: item.productoId ?? item.id,
        nombre: item.nombre || item.name,
        name: item.nombre || item.name,
        cantidad: Number(modal.querySelector(`.refund-qty[data-index="${idx}"]`).value || 0),
        quantity: Number(modal.querySelector(`.refund-qty[data-index="${idx}"]`).value || 0),
        precio: Number(item.precio ?? item.price ?? 0),
        price: Number(item.precio ?? item.price ?? 0)
      };
    });
  }

  function updateRefundTotal() {
    const subtotal = selectedItems().reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    document.getElementById('refundTotal').textContent = `$${(subtotal * 1.19).toLocaleString('es-CO')}`;
  }

  modal.querySelectorAll('.refund-check').forEach((check) => {
    check.addEventListener('change', () => {
      modal.querySelector(`.refund-qty[data-index="${check.dataset.index}"]`).disabled = !check.checked;
      updateRefundTotal();
    });
  });
  modal.querySelectorAll('.refund-qty').forEach((input) => input.addEventListener('input', updateRefundTotal));
  modal.querySelector('#refundAll').addEventListener('change', (event) => {
    modal.querySelectorAll('.refund-check').forEach((check) => {
      check.checked = event.target.checked;
      check.dispatchEvent(new Event('change'));
    });
  });

  modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
  modal.querySelector('.btn-close-modal').addEventListener('click', () => modal.remove());
  modal.querySelector('.btn-save-refund').addEventListener('click', async () => {
    const items = selectedItems();
    if (!items.length) {
      showAppAlert('Selecciona al menos un producto.', 'error');
      return;
    }
    const response = await authFetch(`${API_URL}/ventas/${sale.id}/reembolsos`, {
      method: 'POST',
      body: JSON.stringify({
        tipo: modal.querySelector('#refundAll').checked ? 'TOTAL' : 'PARCIAL',
        retornaInventario: modal.querySelector('#refundReturnStock').checked,
        motivo: modal.querySelector('#refundReason').value,
        itemsJson: items
      })
    });
    const json = await response.json();
    if (!response.ok || !json.success) {
      showAppAlert(json.message || 'No se pudo registrar el reembolso.', 'error');
      return;
    }
    const saleIdx = state.sales.findIndex(s => s.id === sale.id);
    if (saleIdx >= 0) {
      state.sales[saleIdx].estado = 'REEMBOLSADA';
    }
    if (typeof saveSales === 'function') saveSales();
    modal.remove();
    showToast(`Reembolso registrado por $${Number(json.data.total).toLocaleString('es-CO')}.`);
    renderHistory();
    await loadProductsFromAPI();
  });
}
