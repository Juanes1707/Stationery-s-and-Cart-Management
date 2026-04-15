// ============================================================
// admin.js - Panel de administración: CRUD de productos
// Depende de: api.js, data.js, history.js
// ============================================================

// ------------------------------------------------------------
// INICIALIZACIÓN DEL PANEL
// Se llama desde app.js cuando el usuario abre el perfil.
// El flag dataset.inited evita duplicar los event listeners
// si el usuario abre y cierra el panel varias veces.
// ------------------------------------------------------------
function initAdmin() {
  const adminHistoryBtn = document.getElementById('adminHistoryBtn');
  const adminCrudBtn    = document.getElementById('adminCrudBtn');
  const adminContent    = document.getElementById('adminContent');
  const adminPanel      = document.getElementById('adminPanel');

  if (!adminContent || !adminPanel) return;

  // Evitar re-inicializar manejadores de eventos
  if (adminPanel.dataset.inited === '1') return;
  adminPanel.dataset.inited = '1';

  adminHistoryBtn.addEventListener('click', () => {
    setActiveMenuButton(adminHistoryBtn);
    renderAdminHistory();
  });

  adminCrudBtn.addEventListener('click', () => {
    setActiveMenuButton(adminCrudBtn);
    renderAdminCRUD();
    adminPanel.classList.add('open');
    document.querySelector('.app__container').classList.add('admin-open');
  });

  // Mostrar historial por defecto al abrir el panel
  setActiveMenuButton(adminHistoryBtn);
  renderAdminHistory();
}

// ------------------------------------------------------------
// Marca el botón activo del menú del panel
// ------------------------------------------------------------
function setActiveMenuButton(btn) {
  document.querySelectorAll('.admin__menu-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

// ------------------------------------------------------------
// Vista: Historial de ventas (panel derecho vacío, izquierda muestra el historial)
// ------------------------------------------------------------
function renderAdminHistory() {
  const historySectionEl = document.getElementById('historySection');
  if (historySectionEl) historySectionEl.classList.remove('admin-listing');

  const invoiceContainer = document.getElementById('invoiceContainer');
  if (invoiceContainer) invoiceContainer.innerHTML = '';

  renderHistory();

  const adminContent = document.getElementById('adminContent');
  if (adminContent) adminContent.innerHTML = '';
}

// ------------------------------------------------------------
// Vista: CRUD de productos
// ------------------------------------------------------------
function renderAdminCRUD() {
  const adminContent = document.getElementById('adminContent');
  if (!adminContent) return;
  adminContent.innerHTML = '';
  renderProductsInMainArea();
}

// ------------------------------------------------------------
// Formulario de agregar / editar producto (se muestra en el panel derecho)
// ------------------------------------------------------------
function renderAdminCRUDForm() {
  const adminContent = document.getElementById('adminContent');
  if (!adminContent) return;

  adminContent.innerHTML = `
    <div class="admin__crud-form">
      <h3>Agregar / Editar Producto</h3>
      <form id="adminProductForm">
        <input type="hidden" id="adminProductId">

        <label>Nombre (obligatorio)</label>
        <input id="adminName" required>

        <label>Categoría (obligatorio)</label>
        <input id="adminCategory" required>

        <label>Precio venta (>= 0)</label>
        <input id="adminPrice" type="number" min="0" required>

        <label>Costo proveedor (>= 0)</label>
        <input id="adminCost" type="number" min="0" required>

        <label>Código interno (obligatorio)</label>
        <input id="adminCode" required>

        <label>Seguimiento inventario</label>
        <select id="adminTracking">
          <option value="true">Sí</option>
          <option value="false">No</option>
        </select>

        <label>Stock (>= 0)</label>
        <input id="adminStock" type="number" min="0" required>

        <label>Imagen (URL o ruta)</label>
        <input id="adminImage" placeholder="./imagenes y recursos/archivo.jpg">

        <label>Descripción</label>
        <textarea id="adminDescription"></textarea>

        <div style="margin-top:8px; display:flex; gap:8px;">
          <button type="submit">Guardar</button>
          <button type="button" id="adminReset">Limpiar</button>
        </div>
      </form>
    </div>
  `;

  document.getElementById('adminProductForm').addEventListener('submit', function (e) {
    e.preventDefault();
    handleAdminFormSubmit();
  });

  document.getElementById('adminReset').addEventListener('click', () => {
    clearAdminForm();
  });
}

// ------------------------------------------------------------
// Listado de productos en el área principal (lado izquierdo del perfil)
// ------------------------------------------------------------
function renderProductsInMainArea() {
  const historySection  = document.getElementById('historySection');
  const historyContent  = document.querySelector('.history__content-sales');
  if (!historySection || !historyContent) return;
  if (!Array.isArray(products)) products = [];

  // Clase que ajusta el ancho al mostrar el formulario en el panel derecho
  historySection.classList.add('admin-listing');

  let html = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
      <h2>Productos</h2>
      <button id="mainAddProduct" style="background:#FC1; border:none; padding:8px 12px; border-radius:6px; cursor:pointer;">
        Agregar Producto
      </button>
    </div>
  `;

  if (products.length === 0) {
    html += '<p>No hay productos registrados.</p>';
    historyContent.innerHTML = html;
    document.getElementById('mainAddProduct').addEventListener('click', () => {
      setActiveMenuButton(document.getElementById('adminCrudBtn'));
      renderAdminCRUDForm();
      document.getElementById('adminPanel')?.classList.add('open');
    });
    return;
  }

  html += '<div class="admin-product-grid">';
  products.forEach(p => {
    html += `
      <div class="admin-product-card">
        <div class="admin-product-info">
          <strong>${escapeHtml(p.name)}</strong> <span class="admin-id">#${p.id}</span>
          <p>${escapeHtml(p.category)}</p>
          <p>$${Number(p.price).toLocaleString('es-CO')} · stock: ${p.stock ?? 0}</p>
        </div>
        <div class="admin-product-actions">
          <button class="main-edit"   data-id="${p.id}">Editar</button>
          <button class="main-delete" data-id="${p.id}">Eliminar</button>
        </div>
      </div>
    `;
  });
  html += '</div>';

  historyContent.innerHTML = html;

  // Botón Editar → carga el producto en el formulario del panel derecho
  historyContent.querySelectorAll('.main-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = Number(e.target.dataset.id);
      setActiveMenuButton(document.getElementById('adminCrudBtn'));
      renderAdminCRUDForm();
      loadProductIntoForm(id);
      document.getElementById('adminPanel')?.classList.add('open');
      document.querySelector('.app__container').classList.add('admin-open');
    });
  });

  // Botón Eliminar
  historyContent.querySelectorAll('.main-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = Number(e.target.dataset.id);
      if (confirm('¿Eliminar producto? Esta acción no se puede deshacer.')) {
        deleteProduct(id);
      }
    });
  });

  // Botón Agregar Producto
  document.getElementById('mainAddProduct').addEventListener('click', () => {
    setActiveMenuButton(document.getElementById('adminCrudBtn'));
    renderAdminCRUDForm();
    clearAdminForm();
    document.getElementById('adminPanel')?.classList.add('open');
    document.querySelector('.app__container').classList.add('admin-open');
  });
}

// ------------------------------------------------------------
// Guardar o actualizar producto: se conecta a Google Sheets via api.js
// ------------------------------------------------------------
async function handleAdminFormSubmit() {
  // Leer valores del formulario
  const idField     = document.getElementById('adminProductId');
  const name        = document.getElementById('adminName').value.trim();
  const category    = document.getElementById('adminCategory').value.trim();
  const price       = parseFloat(document.getElementById('adminPrice').value);
  const cost        = parseFloat(document.getElementById('adminCost').value);
  const code        = document.getElementById('adminCode').value.trim();
  const tracking    = document.getElementById('adminTracking').value === 'true';
  const stock       = parseInt(document.getElementById('adminStock').value, 10);
  const image       = document.getElementById('adminImage').value.trim() || './imagenes y recursos/default.jpg';
  const description = document.getElementById('adminDescription').value.trim();

  // Validaciones básicas
  if (!name || !category || isNaN(price) || price < 0 ||
      isNaN(cost) || cost < 0 || !code || isNaN(stock) || stock < 0) {
    alert('Por favor completa todos los campos obligatorios con valores válidos.');
    return;
  }

  const existingId = idField.value ? Number(idField.value) : null;

  if (existingId) {
    // ── EDITAR producto existente ──────────────────────────
    const prod = products.find(p => p.id === existingId);
    if (!prod) return;

    // Actualizar en el array local
    prod.name        = name;
    prod.category    = category;
    prod.price       = price;
    prod.cost        = cost;
    prod.code        = code;
    prod.tracking    = tracking;
    prod.stock       = stock;
    prod.image       = image;
    prod.description = description;

    // Enviar a Google Sheets (UPDATE)
    // Los encabezados en Sheets usan los nombres en español,
    // así que enviamos el objeto con esos mismos nombres.
    try {
      await apiUpdate('productos', {
        id:                    prod.id,
        nombre:                prod.name,
        categoría:             prod.category,
        precio:                prod.price,
        costo:                 prod.cost,
        codigo:                prod.code,
        seguimientoInventario: prod.tracking,
        stock:                 prod.stock,
        imagen:                prod.image,
        descripcion:           prod.description
      });
      alert('Producto actualizado correctamente.');
    } catch (e) {
      console.error('Error actualizando en Sheets:', e);
      alert('Se actualizó localmente pero hubo un error con Google Sheets.');
    }

  } else {
    // ── CREAR producto nuevo ───────────────────────────────
    // Generamos un ID único usando timestamp para evitar colisiones
    const newId = Date.now();
    const newProd = {
      id:          newId,
      name,
      category,
      price,
      cost,
      code,
      tracking,
      stock,
      image,
      description
    };

    // Agregar al array local
    products.push(newProd);

    // Enviar a Google Sheets (POST / crear nueva fila)
    try {
      await apiPost('productos', {
        id:                    newProd.id,
        nombre:                newProd.name,
        categoría:             newProd.category,
        precio:                newProd.price,
        costo:                 newProd.cost,
        codigo:                newProd.code,
        seguimientoInventario: newProd.tracking,
        stock:                 newProd.stock,
        imagen:                newProd.image,
        descripcion:           newProd.description
      });
      alert('Producto agregado correctamente.');
    } catch (e) {
      console.error('Error guardando en Sheets:', e);
      alert('Se agregó localmente pero hubo un error con Google Sheets.');
    }
  }

  // Refrescar vistas
  renderProducts(products);
  renderProductsInMainArea();
  clearAdminForm();
}

// ------------------------------------------------------------
// Cargar un producto existente en el formulario para editarlo
// ------------------------------------------------------------
function loadProductIntoForm(id) {
  const prod = products.find(p => p.id === id);
  if (!prod) return;

  document.getElementById('adminProductId').value    = prod.id;
  document.getElementById('adminName').value         = prod.name        || '';
  document.getElementById('adminCategory').value     = prod.category    || '';
  document.getElementById('adminPrice').value        = prod.price       ?? 0;
  document.getElementById('adminCost').value         = prod.cost        ?? 0;
  document.getElementById('adminCode').value         = prod.code        || '';
  document.getElementById('adminTracking').value     = prod.tracking    ? 'true' : 'false';
  document.getElementById('adminStock').value        = prod.stock       ?? 0;
  document.getElementById('adminImage').value        = prod.image       || '';
  document.getElementById('adminDescription').value  = prod.description || '';
}

// ------------------------------------------------------------
// Limpiar el formulario (modo "nuevo producto")
// ------------------------------------------------------------
function clearAdminForm() {
  document.getElementById('adminProductId').value   = '';
  document.getElementById('adminName').value        = '';
  document.getElementById('adminCategory').value    = '';
  document.getElementById('adminPrice').value       = '';
  document.getElementById('adminCost').value        = '';
  document.getElementById('adminCode').value        = '';
  document.getElementById('adminTracking').value    = 'true';
  document.getElementById('adminStock').value       = '';
  document.getElementById('adminImage').value       = '';
  document.getElementById('adminDescription').value = '';
}

// ------------------------------------------------------------
// Eliminar producto: lo borra del array local y de Google Sheets
// ------------------------------------------------------------
async function deleteProduct(id) {
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return;

  // Eliminar del array local
  products.splice(idx, 1);

  // Eliminar en Google Sheets (DELETE)
  try {
    await apiDelete('productos', { id });
  } catch (e) {
    console.error('Error eliminando en Sheets:', e);
    alert('Se eliminó localmente pero hubo un error con Google Sheets.');
  }

  // Refrescar vistas
  renderProducts(products);
  renderProductsInMainArea();
}

// ------------------------------------------------------------
// Sanitizar texto para evitar XSS al insertar en innerHTML
// ------------------------------------------------------------
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[m]);
}