// ============================================================
// entities.js - Gestión de Categorías, Proveedores y Clientes
// Sección 2.5 del documento de entrega
// Depende de: api.js
// Cada entidad tiene su propia hoja en Google Sheets:
//   "categorias", "proveedores", "clientes"
// ============================================================

// ============================================================
// MÓDULO PRINCIPAL — selector de entidad
// Se renderiza en el área principal (historyContent)
// El panel derecho (adminContent) muestra el formulario
// ============================================================
function renderEntitiesModule() {
  const historySection = document.getElementById('historySection');
  const historyContent = document.querySelector('.history__content-sales');
  if (!historySection || !historyContent) return;

  historySection.classList.add('admin-listing');

  historyContent.innerHTML = `
    <h2>Gestión de Entidades</h2>
    <div class="entity-tabs" style="display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap;">
      <button class="entity-tab-btn active" data-entity="categorias"
        style="padding:8px 16px; border:none; border-radius:6px; cursor:pointer; background:#FC1; font-weight:600;">
        Categorías
      </button>
      <button class="entity-tab-btn" data-entity="proveedores"
        style="padding:8px 16px; border:none; border-radius:6px; cursor:pointer; background:#eee;">
        Proveedores
      </button>
      <button class="entity-tab-btn" data-entity="clientes"
        style="padding:8px 16px; border:none; border-radius:6px; cursor:pointer; background:#eee;">
        Clientes
      </button>
    </div>
    <div id="entityListContainer"></div>
  `;

  // Cargar categorías por defecto
  loadEntityList('categorias');

  // Tabs de navegación entre entidades
  historyContent.querySelectorAll('.entity-tab-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      // Estilo activo
      historyContent.querySelectorAll('.entity-tab-btn').forEach(b => {
        b.style.background = '#eee';
        b.classList.remove('active');
      });
      e.currentTarget.style.background = '#FC1';
      e.currentTarget.classList.add('active');

      // Limpiar panel derecho y cargar lista
      const adminContent = document.getElementById('adminContent');
      if (adminContent) adminContent.innerHTML = '';
      loadEntityList(e.currentTarget.dataset.entity);
    });
  });
}

// ============================================================
// Cargar y renderizar lista de una entidad desde Google Sheets
// ============================================================
async function loadEntityList(entityName) {
  const container = document.getElementById('entityListContainer');
  if (!container) return;

  container.innerHTML = '<p>Cargando...</p>';

  let items = [];
  try {
    items = await apiGet(entityName) || [];
  } catch (e) {
    console.error(`Error cargando ${entityName}:`, e);
    items = getLocalEntity(entityName); // fallback a localStorage
  }

  // Guardar en localStorage como caché local
  saveLocalEntity(entityName, items);

  renderEntityList(entityName, items);
}

// ============================================================
// Renderizar tabla + botón agregar de una entidad
// ============================================================
function renderEntityList(entityName, items) {
  const container = document.getElementById('entityListContainer');
  if (!container) return;

  const labels = getEntityLabels(entityName);

  let html = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
      <h3>${labels.title}</h3>
      <button id="btnAddEntity"
        style="background:#4CAF50; color:#fff; border:none; padding:8px 14px; border-radius:6px; cursor:pointer; font-weight:600;">
        + Agregar
      </button>
    </div>
  `;

  // Buscador
  html += `
    <input id="entitySearch" placeholder="Buscar ${labels.title.toLowerCase()}..."
      style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px; margin-bottom:12px; box-sizing:border-box;">
  `;

  if (items.length === 0) {
    html += `<p>No hay ${labels.title.toLowerCase()} registradas.</p>`;
  } else {
    html += `
      <div class="history-card">
        <div class="history-header" style="grid-template-columns: repeat(${labels.columns.length + 1}, 1fr);">
          ${labels.columns.map(c => `<span>${c.label.toUpperCase()}</span>`).join('')}
          <span>ACCIONES</span>
        </div>
    `;

    items.forEach(item => {
      html += `<div class="history-row" style="grid-template-columns: repeat(${labels.columns.length + 1}, 1fr);">`;
      labels.columns.forEach(col => {
        html += `<span>${item[col.key] || '-'}</span>`;
      });
      html += `
          <span style="display:flex; gap:6px;">
            <button class="btn-edit-entity" data-id="${item.id}"
              style="background:#2196F3; color:#fff; border:none; border-radius:4px; padding:4px 10px; cursor:pointer;">
              Editar
            </button>
            <button class="btn-delete-entity" data-id="${item.id}"
              style="background:#f44336; color:#fff; border:none; border-radius:4px; padding:4px 10px; cursor:pointer;">
              Eliminar
            </button>
          </span>
        </div>
      `;
    });

    html += `</div>`;
  }

  container.innerHTML = html;

  // ── Buscador en tiempo real ───────────────────────────────
  document.getElementById('entitySearch').addEventListener('input', function () {
    const term = this.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const filtered = items.filter(item =>
      labels.columns.some(col =>
        String(item[col.key] || '').toLowerCase().normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '').includes(term)
      )
    );
    renderEntityList(entityName, filtered);
    // Restaurar el texto del buscador después de re-renderizar
    const newSearch = document.getElementById('entitySearch');
    if (newSearch) { newSearch.value = this.value; newSearch.focus(); }
  });

  // ── Botón Agregar ─────────────────────────────────────────
  document.getElementById('btnAddEntity').addEventListener('click', () => {
    renderEntityForm(entityName, null);
  });

  // ── Botón Editar ──────────────────────────────────────────
  container.querySelectorAll('.btn-edit-entity').forEach(btn => {
    btn.addEventListener('click', e => {
      const id   = e.currentTarget.dataset.id;
      const item = items.find(i => String(i.id) === String(id));
      if (item) renderEntityForm(entityName, item);
    });
  });

  // ── Botón Eliminar ────────────────────────────────────────
  container.querySelectorAll('.btn-delete-entity').forEach(btn => {
    btn.addEventListener('click', async e => {
      const id = e.currentTarget.dataset.id;
      if (!confirm('¿Eliminar este registro? Esta acción no se puede deshacer.')) return;

      try {
        await apiDelete(entityName, { id });
      } catch (err) {
        console.error('Error eliminando en Sheets:', err);
      }

      // Actualizar lista local y recargar
      const updated = getLocalEntity(entityName).filter(i => String(i.id) !== String(id));
      saveLocalEntity(entityName, updated);
      renderEntityList(entityName, updated);
    });
  });
}

// ============================================================
// Formulario agregar / editar entidad (panel derecho)
// ============================================================
function renderEntityForm(entityName, item) {
  const adminContent = document.getElementById('adminContent');
  if (!adminContent) return;

  const labels  = getEntityLabels(entityName);
  const isEdit  = item !== null;

  let fieldsHtml = labels.columns
    .filter(col => col.key !== 'id') // el id es automático
    .map(col => `
      <label>${col.label}</label>
      <input id="ef-${col.key}"
        value="${isEdit ? (item[col.key] || '') : ''}"
        type="${col.type || 'text'}"
        placeholder="${col.label}"
        style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px; margin-bottom:10px; box-sizing:border-box;">
    `).join('');

  adminContent.innerHTML = `
    <div class="admin__crud-form">
      <h3>${isEdit ? 'Editar' : 'Agregar'} ${labels.singular}</h3>
      ${fieldsHtml}
      <div style="display:flex; gap:8px; margin-top:8px;">
        <button id="btnSaveEntity"
          style="background:#FC1; border:none; padding:10px 16px; border-radius:6px; cursor:pointer; font-weight:600; flex:1;">
          Guardar
        </button>
        <button id="btnCancelEntity"
          style="background:#eee; border:none; padding:10px 16px; border-radius:6px; cursor:pointer; flex:1;">
          Cancelar
        </button>
      </div>
    </div>
  `;

  // Cancelar
  document.getElementById('btnCancelEntity').addEventListener('click', () => {
    adminContent.innerHTML = '';
  });

  // Guardar
  document.getElementById('btnSaveEntity').addEventListener('click', async () => {
    const editableColumns = labels.columns.filter(col => col.key !== 'id');

    // Validar campos obligatorios
    const missing = editableColumns.filter(col =>
      col.required && !document.getElementById(`ef-${col.key}`).value.trim()
    );
    if (missing.length > 0) {
      alert(`Por favor completa: ${missing.map(c => c.label).join(', ')}`);
      return;
    }

    // Construir objeto con los valores del formulario
    const newItem = {};
    editableColumns.forEach(col => {
      newItem[col.key] = document.getElementById(`ef-${col.key}`).value.trim();
    });

    if (isEdit) {
      // ── EDITAR ──────────────────────────────────────────
      newItem.id = item.id;
      try {
        await apiUpdate(entityName, newItem);
      } catch (e) {
        console.error('Error actualizando en Sheets:', e);
      }

      // Actualizar en lista local
      const local = getLocalEntity(entityName);
      const idx   = local.findIndex(i => String(i.id) === String(item.id));
      if (idx >= 0) local[idx] = newItem;
      saveLocalEntity(entityName, local);
      renderEntityList(entityName, local);

    } else {
      // ── CREAR ────────────────────────────────────────────
      newItem.id = Date.now();
      try {
        await apiPost(entityName, newItem);
      } catch (e) {
        console.error('Error creando en Sheets:', e);
      }

      // Agregar a lista local
      const local = getLocalEntity(entityName);
      local.push(newItem);
      saveLocalEntity(entityName, local);
      renderEntityList(entityName, local);
    }

    adminContent.innerHTML = '';
    alert(`${labels.singular} ${isEdit ? 'actualizada' : 'creada'} correctamente.`);
  });
}

// ============================================================
// PERSISTENCIA LOCAL (caché mientras no se recarga la página)
// ============================================================
function getLocalEntity(entityName) {
  try {
    return JSON.parse(localStorage.getItem(`entity_${entityName}`)) || [];
  } catch (e) {
    return [];
  }
}

function saveLocalEntity(entityName, items) {
  localStorage.setItem(`entity_${entityName}`, JSON.stringify(items));
}

// ============================================================
// CONFIGURACIÓN DE CADA ENTIDAD
// Define columnas, etiquetas y tipos de input de cada entidad.
// Para agregar una entidad nueva solo hay que añadir un caso aquí.
// ============================================================
function getEntityLabels(entityName) {
  const config = {
    categorias: {
      title:    'Categorías',
      singular: 'Categoría',
      columns: [
        { key: 'id',     label: 'ID',     required: false },
        { key: 'nombre', label: 'Nombre', required: true  }
      ]
    },
    proveedores: {
      title:    'Proveedores',
      singular: 'Proveedor',
      columns: [
        { key: 'id',       label: 'ID',       required: false },
        { key: 'nombre',   label: 'Nombre',   required: true  },
        { key: 'telefono', label: 'Teléfono', required: false },
        { key: 'correo',   label: 'Correo',   required: false, type: 'email' }
      ]
    },
    clientes: {
      title:    'Clientes',
      singular: 'Cliente',
      columns: [
        { key: 'id',       label: 'ID',       required: false },
        { key: 'nombre',   label: 'Nombre',   required: true  },
        { key: 'telefono', label: 'Teléfono', required: false },
        { key: 'correo',   label: 'Correo',   required: false, type: 'email' }
      ]
    }
  };

  return config[entityName] || {
    title:    entityName,
    singular: entityName,
    columns:  [{ key: 'id', label: 'ID' }, { key: 'nombre', label: 'Nombre' }]
  };
}