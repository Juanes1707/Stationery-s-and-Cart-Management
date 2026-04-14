// PANEL ADMIN: CRUD de productos y controles del panel derecho
function initAdmin() {
  const adminHistoryBtn = document.getElementById('adminHistoryBtn');
  const adminCrudBtn = document.getElementById('adminCrudBtn');
  const adminContent = document.getElementById('adminContent');
  const adminPanel = document.getElementById('adminPanel');

  if (!adminContent || !adminPanel) return;

  // evitar re-inicializar manejadores de eventos
  if (adminPanel.dataset.inited === '1') return;
  adminPanel.dataset.inited = '1';

  adminHistoryBtn.addEventListener('click', () => {
    setActiveMenuButton(adminHistoryBtn);
    renderAdminHistory();
  });

  adminCrudBtn.addEventListener('click', () => {
    setActiveMenuButton(adminCrudBtn);
    renderAdminCRUD();
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) adminPanel.classList.add('open');
    document.querySelector('.app__container').classList.add('admin-open');
  });

  // mostrar historial por defecto
  setActiveMenuButton(adminHistoryBtn);
  renderAdminHistory();
}

function setActiveMenuButton(btn) {
  document.querySelectorAll('.admin__menu-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

function renderAdminHistory() {
  // Reutiliza renderHistory que llena #historySection (lado izquierdo)
  const historySectionEl = document.getElementById('historySection');
  if (historySectionEl) historySectionEl.classList.remove('admin-listing');
  const invoiceContainer = document.getElementById('invoiceContainer');
  if (invoiceContainer) invoiceContainer.innerHTML = '';
  renderHistory();
  const adminContent = document.getElementById('adminContent');
  if (!adminContent) return;
  adminContent.innerHTML = '';
}

function renderAdminCRUD() {
  const adminContent = document.getElementById('adminContent');
  if (!adminContent) return;
  adminContent.innerHTML = '';
  renderProductsInMainArea();
}

function renderAdminCRUDForm() {
  const adminContent = document.getElementById('adminContent');
  if (!adminContent) return;

  const formHtml = `
    <div class="admin__crud-form">
      <h3>Agregar / Editar Producto</h3>
      <form id="adminProductForm">
        <input type="hidden" id="adminProductId">
        <label>Nombre (obligatorio)</label>
        <input id="adminName" required>
        <label>Categoria (obligatorio)</label>
        <input id="adminCategory" required>
        <label>Precio venta (>=0)</label>
        <input id="adminPrice" type="number" min="0" required>
        <label>Costo proveedor (>=0)</label>
        <input id="adminCost" type="number" min="0" required>
        <label>Codigo interno (obligatorio)</label>
        <input id="adminCode" required>
        <label>Seguimiento inventario</label>
        <select id="adminTracking">
          <option value="true">Si</option>
          <option value="false">No</option>
        </select>
        <label>Stock (>=0)</label>
        <input id="adminStock" type="number" min="0" required>
        <label>Imagen (URL)</label>
        <input id="adminImage" placeholder="./imagenes y recursos/archivo.jpg">
        <label>Descripcion</label>
        <textarea id="adminDescription"></textarea>
        <div style="margin-top:8px;display:flex;gap:8px;">
          <button type="submit">Guardar</button>
          <button type="button" id="adminReset">Limpiar</button>
        </div>
      </form>
    </div>
  `;

  adminContent.innerHTML = formHtml;

  const form = document.getElementById('adminProductForm');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    handleAdminFormSubmit();
  });
  document.getElementById('adminReset').addEventListener('click', () => {
    clearAdminForm();
  });
}

function renderProductsInMainArea() {
  const historySection = document.getElementById('historySection');
  const historyContent = document.querySelector('.history__content-sales');
  if (!historySection || !historyContent) return;
  if (!Array.isArray(products)) products = [];
  // agrega clase de marca para que los estilos ajusten el ancho al abrir formulario/panel
  historySection.classList.add('admin-listing');

  // agrega botón "Agregar producto" y listado
  let html = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><h2>Productos</h2><button id="mainAddProduct" style="background:#FC1;border:none;padding:8px 12px;border-radius:6px;cursor:pointer;">Agregar Producto</button></div>`;

  if (products.length === 0) {
    html += '<p>No hay productos</p>';
    historyContent.innerHTML = html;
    document.getElementById('mainAddProduct').addEventListener('click', () => {
      // abre el formulario en el panel derecho
      setActiveMenuButton(document.getElementById('adminCrudBtn'));
      renderAdminCRUDForm();
      const adminPanel = document.getElementById('adminPanel');
      if (adminPanel) adminPanel.classList.add('open');
    });
    return;
  }

  html += '<div class="admin-product-grid">';
  products.forEach(p => {
    html += `<div class="admin-product-card">
               <div class="admin-product-info">
                 <strong>${escapeHtml(p.name)}</strong> <span class="admin-id">#${p.id}</span>
                 <p>${escapeHtml(p.category)}</p>
                 <p>$${Number(p.price).toLocaleString()} · stock: ${p.stock ?? 0}</p>
               </div>
               <div class="admin-product-actions">
                 <button class="main-edit" data-id="${p.id}">Editar</button>
                 <button class="main-delete" data-id="${p.id}">Eliminar</button>
               </div>
             </div>`;
  });
  html += '</div>';

  historyContent.innerHTML = html;

  // conecta eventos de botones
  historyContent.querySelectorAll('.main-edit').forEach(b => b.addEventListener('click', (e) => {
    const id = Number(e.target.dataset.id);
    // abre formulario en el panel derecho y carga el producto
    setActiveMenuButton(document.getElementById('adminCrudBtn'));
    renderAdminCRUDForm();
    loadProductIntoForm(id);
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) adminPanel.classList.add('open');
    document.querySelector('.app__container').classList.add('admin-open');
  }));

  historyContent.querySelectorAll('.main-delete').forEach(b => b.addEventListener('click', (e) => {
    const id = Number(e.target.dataset.id);
    if (confirm('¿Eliminar producto? Esta acción no se puede deshacer.')) {
      deleteProduct(id);
    }
  }));

  document.getElementById('mainAddProduct').addEventListener('click', () => {
    setActiveMenuButton(document.getElementById('adminCrudBtn'));
    renderAdminCRUDForm();
    clearAdminForm();
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) adminPanel.classList.add('open');
    document.querySelector('.app__container').classList.add('admin-open');
  });
}

function renderAdminProductsList() {
  const container = document.getElementById('adminProductsList');
  if (!container) return;
  if (!Array.isArray(products)) products = [];

  if (products.length === 0) {
    container.innerHTML = '<p>No hay productos</p>';
    return;
  }

  let html = '<table style="width:100%;border-collapse:collapse;"><thead><tr><th>Id</th><th>Nombre</th><th>Categoria</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr></thead><tbody>';
  products.forEach(p => {
    html += `<tr style="border-top:1px solid #eee;"><td>${p.id}</td><td>${escapeHtml(p.name)}</td><td>${escapeHtml(p.category)}</td><td>$${Number(p.price).toLocaleString()}</td><td>${p.stock ?? 0}</td><td><button class="admin-edit" data-id="${p.id}">Editar</button> <button class="admin-delete" data-id="${p.id}">Eliminar</button></td></tr>`;
  });
  html += '</tbody></table>';
  container.innerHTML = html;

  container.querySelectorAll('.admin-edit').forEach(b => b.addEventListener('click', (e) => {
    const id = Number(e.target.dataset.id);
    loadProductIntoForm(id);
  }));

  container.querySelectorAll('.admin-delete').forEach(b => b.addEventListener('click', (e) => {
    const id = Number(e.target.dataset.id);
    if (confirm('¿Eliminar producto? Esta acción no se puede deshacer.')) {
      deleteProduct(id);
    }
  }));
}

async function handleAdminFormSubmit() {
  const idField = document.getElementById('adminProductId');
  const name = document.getElementById('adminName').value.trim();
  const category = document.getElementById('adminCategory').value.trim();
  const price = parseFloat(document.getElementById('adminPrice').value);
  const cost = parseFloat(document.getElementById('adminCost').value);
  const code = document.getElementById('adminCode').value.trim();
  const tracking = document.getElementById('adminTracking').value === 'true';
  const stock = parseInt(document.getElementById('adminStock').value, 10);
  const image = document.getElementById('adminImage').value.trim() || './imagenes y recursos/default.jpg';
  const description = document.getElementById('adminDescription').value.trim();

  // Validaciones basicas
  if (!name || !category || isNaN(price) || price < 0 || isNaN(cost) || cost < 0 || !code || isNaN(stock) || stock < 0) {
    alert('Por favor completa los campos obligatorios y asegúrate de valores numéricos no negativos.');
    return;
  }

  const existingId = idField.value ? Number(idField.value) : null;

  if (existingId) {
    // editar
    const prod = products.find(p => p.id === existingId);
    if (!prod) return;
    prod.name = name;
    prod.category = category;
    prod.price = price;
    prod.cost = cost;
    prod.code = code;
    prod.tracking = tracking;
    prod.stock = stock;
    prod.image = image;
    prod.description = description;
    // DESPUÉS (con Google Sheets)
// Si es producto nuevo → apiPost
// Si es edición → apiUpdate
  await apiPost("productos", nuevoProducto);   // crear
  await apiUpdate("productos", productoEditado); // editar
  await apiDelete("productos", { id: producto.id }); // eliminarsaveProductsToStorage();
    renderAdminProductsList();
    renderProducts(products);
    // actualiza el listado principal si está visible
    if (document.getElementById('historySection')) renderProductsInMainArea();
    clearAdminForm();
    alert('Producto actualizado');
  } else {
    // agregar nuevo
    const newId = products.reduce((max, p) => Math.max(max, p.id || 0), 0) + 1;
    const newProd = {
      id: newId,
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
    products.push(newProd);
    saveProductsToStorage();
    renderAdminProductsList();
    renderProducts(products);
    if (document.getElementById('historySection')) renderProductsInMainArea();
    clearAdminForm();
    alert('Producto agregado');
  }
}

function loadProductIntoForm(id) {
  const prod = products.find(p => p.id === id);
  if (!prod) return;
  document.getElementById('adminProductId').value = prod.id;
  document.getElementById('adminName').value = prod.name || '';
  document.getElementById('adminCategory').value = prod.category || '';
  document.getElementById('adminPrice').value = prod.price ?? 0;
  document.getElementById('adminCost').value = prod.cost ?? 0;
  document.getElementById('adminCode').value = prod.code || '';
  document.getElementById('adminTracking').value = prod.tracking ? 'true' : 'false';
  document.getElementById('adminStock').value = prod.stock ?? 0;
  document.getElementById('adminImage').value = prod.image || '';
  document.getElementById('adminDescription').value = prod.description || '';
}

function clearAdminForm() {
  document.getElementById('adminProductId').value = '';
  document.getElementById('adminName').value = '';
  document.getElementById('adminCategory').value = '';
  document.getElementById('adminPrice').value = '';
  document.getElementById('adminCost').value = '';
  document.getElementById('adminCode').value = '';
  document.getElementById('adminTracking').value = 'true';
  document.getElementById('adminStock').value = '';
  document.getElementById('adminImage').value = '';
  document.getElementById('adminDescription').value = '';
}

function deleteProduct(id) {
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return;
  products.splice(idx, 1);
  saveProductsToStorage();
  renderAdminProductsList();
  renderProducts(products);
  if (document.getElementById('historySection')) renderProductsInMainArea();
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function (m) {
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[m];
  });
}
