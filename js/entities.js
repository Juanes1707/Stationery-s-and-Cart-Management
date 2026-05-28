// ============================================================
// entities.js - Gestión de Categorías, Proveedores y Clientes
// Sección 2.5 del documento de entrega
// Depende de: api.js
// Cada entidad tiene su propia hoja en Google Sheets:
//   "categorias", "proveedores", "clientes"
// ============================================================

let activeEntityName = null;
const entityListCache = {
  categorias: [],
  proveedores: [],
  clientes: [],
};

// ── Función auxiliar: escapar HTML ─────────────────────────
function escapeHtml(str) {
  if (!str) return "";
  return str.replace(
    /[&<>"']/g,
    (m) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[m],
  );
}

// ============================================================
// MÓDULO PRINCIPAL — selector de entidad
// Se renderiza en el área principal (historyContent)
// El panel derecho (adminContent) muestra el formulario
// ============================================================
function renderEntitiesModule() {
  const historySection = document.getElementById("historySection");
  const historyContent = document.querySelector(".history__content-sales");
  if (!historySection || !historyContent) return;

  historySection.classList.add("admin-listing");

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
  loadEntityList("categorias");

  // Tabs de navegación entre entidades
  historyContent.querySelectorAll(".entity-tab-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      // Estilo activo
      historyContent.querySelectorAll(".entity-tab-btn").forEach((b) => {
        b.style.background = "#eee";
        b.classList.remove("active");
      });
      e.currentTarget.style.background = "#FC1";
      e.currentTarget.classList.add("active");

      // Limpiar panel derecho y cargar lista
      const adminContent = document.getElementById("adminContent");
      if (adminContent) adminContent.innerHTML = "";
      loadEntityList(e.currentTarget.dataset.entity);
    });
  });
}

// ============================================================
// Cargar y renderizar lista de una entidad desde Google Sheets
// ============================================================
async function loadEntityList(entityName) {
  activeEntityName = entityName;
  const container = document.getElementById("entityListContainer");
  if (!container) return;

  container.innerHTML = "<p>Cargando...</p>";

  let items = [];
  try {
    items = (await apiGet(entityName)) || [];
  } catch (e) {
    console.error(`Error cargando ${entityName}:`, e);
    items = getLocalEntity(entityName); // fallback a localStorage
  }

  // Guardar en caché y en localStorage
  entityListCache[entityName] = items;
  saveLocalEntity(entityName, items);

  renderEntityList(entityName, items);
}

// ============================================================
// Renderizar tabla + botón agregar de una entidad
// ============================================================
function renderEntityList(entityName, items) {
  const container = document.getElementById("entityListContainer");
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
        <div class="history-header" style="grid-template-columns: repeat(${labels.columns.length}, minmax(0, 1fr)) auto;">
          ${labels.columns.map((c) => `<span>${c.label.toUpperCase()}</span>`).join("")}
          <span>ACCIONES</span>
        </div>
    `;

    items.forEach((item) => {
      html += `<div class="history-row" style="grid-template-columns: repeat(${labels.columns.length}, minmax(0, 1fr)) auto;">`;
      labels.columns.forEach((col) => {
        html += `<span>${item[col.key] || "-"}</span>`;
      });
      html += `
          <span style="display:flex; gap:6px; min-width:160px; justify-content:flex-end;">
            <button class="btn-edit-entity" data-id="${item.id}"
              style="background:#2196F3; color:#fff; border:none; border-radius:4px; padding:4px 10px; cursor:pointer; white-space:nowrap;">
              Editar
            </button>
            <button class="btn-delete-entity" data-id="${item.id}"
              style="background:#f44336; color:#fff; border:none; border-radius:4px; padding:4px 10px; cursor:pointer; white-space:nowrap;">
              Eliminar
            </button>
          </span>
        </div>
      `;
    });

    html += `</div>`;
  }

  container.innerHTML = html;

  const originalItems = entityListCache[entityName] || items;

  // ── Buscador en tiempo real ───────────────────────────────
  document
    .getElementById("entitySearch")
    .addEventListener("input", function () {
      const term = this.value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const filtered = originalItems.filter((item) =>
        labels.columns.some((col) =>
          String(item[col.key] || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .includes(term),
        ),
      );
      renderEntityList(entityName, filtered);
      // Restaurar el texto del buscador después de re-renderizar
      const newSearch = document.getElementById("entitySearch");
      if (newSearch) {
        newSearch.value = this.value;
        newSearch.focus();
      }
    });

  // ── Botón Agregar ─────────────────────────────────────────
  document.getElementById("btnAddEntity").addEventListener("click", () => {
    openEntityModal(entityName, null, items);
  });

  // ── Botón Editar ──────────────────────────────────────────
  container.querySelectorAll(".btn-edit-entity").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.id;
      const item = items.find((i) => String(i.id) === String(id));
      if (item) openEntityModal(entityName, item, items);
    });
  });

  // ── Botón Eliminar ────────────────────────────────────────
  container.querySelectorAll(".btn-delete-entity").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;
      const confirmMessage =
        "¿Eliminar este registro? Esta acción no se puede deshacer.";
      const allowed = await showConfirm(confirmMessage);
      if (!allowed) return;

      try {
        console.log(
          `%c🗑️ Eliminando ${entityName} con ID: ${id}`,
          "color: #f44336; font-weight: bold;",
        );
        await apiDelete(entityName, { id });

        // Actualizar lista local y caché, y recargar sólo si Sheet confirmó la eliminación
        const updated = (entityListCache[entityName] || getLocalEntity(entityName)).filter(
          (i) => String(i.id) !== String(id),
        );
        entityListCache[entityName] = updated;
        saveLocalEntity(entityName, updated);
        renderEntityList(entityName, updated);
        if (typeof showToast === "function") {
          showToast(`${entityName} eliminado correctamente.`, "success");
        }
      } catch (err) {
        console.error("Error eliminando en Sheets:", err);
        if (typeof showToast === "function") {
          showToast(
            `No se pudo eliminar en Sheets. Intenta de nuevo.`,
            "error",
          );
        }
      }

      // Si se eliminó una categoría, regenerar botones de filtro
      if (
        entityName === "categorias" &&
        typeof rebuildCategoryButtons === "function"
      ) {
        rebuildCategoryButtons();
        console.log(
          "%c✅ Botones de categoría regenerados después de eliminar categoría",
          "color: #4CAF50; font-weight: bold;",
        );
      }
    });
  });
}

// ============================================================
// Modal flotante para agregar / editar entidad
// ============================================================
function openEntityModal(entityName, item, allItems) {
  const labels = getEntityLabels(entityName);
  const isEdit = item !== null;
  const title = isEdit
    ? `Editar ${labels.singular}`
    : `Agregar ${labels.singular}`;

  // Construir campos del formulario
  let fieldsHtml = labels.columns
    .filter((col) => col.key !== "id")
    .map((col) => {
      const value = isEdit ? item[col.key] || "" : "";
      const required = col.required ? "required" : "";
      return `
        <div class="admin__form-group">
          <label>${col.label}${col.required ? " *" : ""}</label>
          <input 
            id="emf-${col.key}"
            type="${col.type || "text"}"
            value="${escapeHtml(String(value))}"
            placeholder="${col.label}"
            ${required}
            style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px; box-sizing:border-box;">
        </div>
      `;
    })
    .join("");

  const formHtml = `
    <button class="close-btn">&times;</button>
    <h3 class="admin__form-title">${title}</h3>
    <form id="floatingEntityForm" autocomplete="off">
      <input type="hidden" id="emf-id" value="${isEdit ? item.id : ""}">
      ${fieldsHtml}
      <div class="admin__form-actions">
        <button type="submit" class="btn-save">💾 Guardar</button>
        <button type="button" id="emf-cancel" class="btn-clear">Cancelar</button>
      </div>
    </form>
  `;

  const modal = openFloatingModal(formHtml, (m) => {
    m.querySelector(".close-btn").addEventListener("click", () => m.remove());
    m.querySelector("#emf-cancel").addEventListener("click", () => m.remove());

    m.querySelector("#floatingEntityForm").addEventListener(
      "submit",
      async (e) => {
        e.preventDefault();

        const editableColumns = labels.columns.filter(
          (col) => col.key !== "id",
        );

        // Validar campos obligatorios
        const missing = editableColumns.filter(
          (col) =>
            col.required &&
            !document.getElementById(`emf-${col.key}`).value.trim(),
        );
        if (missing.length > 0) {
          showToast(
            `Por favor completa: ${missing.map((c) => c.label).join(", ")}`,
            "error",
          );
          return;
        }

        // Construir objeto con valores
        const newItem = {};
        editableColumns.forEach((col) => {
          newItem[col.key] = document
            .getElementById(`emf-${col.key}`)
            .value.trim();
        });

        if (isEdit) {
          // ── EDITAR ──────────────────────────────────────────
          newItem.id = item.id;
          console.log(
            `%c✏️ Editando ${labels.singular}:`,
            "color: #ff9800; font-weight: bold;",
          );
          console.log(newItem);

          try {
            await apiUpdate(entityName, newItem);
            showToast(
              `${labels.singular} actualizada correctamente.`,
              "success",
            );

            // Si se editó una categoría, regenerar botones de filtro
            if (
              entityName === "categorias" &&
              typeof rebuildCategoryButtons === "function"
            ) {
              rebuildCategoryButtons();
              console.log(
                "%c✅ Botones de categoría regenerados después de editar categoría",
                "color: #4CAF50; font-weight: bold;",
              );
            }
          } catch (e) {
            console.error(`Error actualizando en Sheets:`, e);
            showToast(
              `Error actualizando ${labels.singular.toLowerCase()}.`,
              "error",
            );
          }

          // Actualizar en lista local
          const local = getLocalEntity(entityName);
          const idx = local.findIndex((i) => String(i.id) === String(item.id));
          if (idx >= 0) local[idx] = newItem;
          entityListCache[entityName] = local;
          saveLocalEntity(entityName, local);
          renderEntityList(entityName, local);
        } else {
          // ── CREAR ────────────────────────────────────────────
          newItem.id = Date.now();
          console.log(
            `%c📝 Creando nueva ${labels.singular}:`,
            "color: #0066cc; font-weight: bold;",
          );
          console.log(newItem);

          let createdSuccessfully = false;
          let apiMessage = null;

          try {
            const result = await apiPost(entityName, newItem);
            console.log(
              "%c📡 Respuesta de API:",
              "color: #9c27b0; font-weight: bold;",
            );
            console.log(result);

            if (result && result.success) {
              createdSuccessfully = true;
              showToast(`${labels.singular} creada correctamente.`, "success");

              // Si se creó una categoría, regenerar botones de filtro
              if (
                entityName === "categorias" &&
                typeof rebuildCategoryButtons === "function"
              ) {
                rebuildCategoryButtons();
                console.log(
                  "%c✅ Botones de categoría regenerados después de crear nueva categoría",
                  "color: #4CAF50; font-weight: bold;",
                );
              }
            } else {
              apiMessage = result?.message || "Respuesta inválida de la API.";
              console.error(
                "%c❌ Error en respuesta de API:",
                "color: #f44336; font-weight: bold;",
              );
              console.error(result);
              showToast(
                `Error creando ${labels.singular.toLowerCase()}: ${apiMessage}`,
                "error",
              );
            }
          } catch (e) {
            apiMessage = e?.message || "Error desconocido";
            console.error(
              `%c💥 Error creando en Sheets:`,
              "color: #f44336; font-weight: bold; font-size: 14px;",
            );
            console.error(e);
            showToast(
              `Error creando ${labels.singular.toLowerCase()}: ${apiMessage}`,
              "error",
            );
          }

          if (createdSuccessfully) {
            const local = getLocalEntity(entityName);
            local.push(newItem);
            entityListCache[entityName] = local;
            saveLocalEntity(entityName, local);
            renderEntityList(entityName, local);
          }
        }

        m.remove();
      },
    );
  });
}

// ============================================================
// Formulario agregar / editar entidad (panel derecho - LEGACY)
// ============================================================
function renderEntityForm(entityName, item) {
  const adminContent = document.getElementById("adminContent");
  if (!adminContent) return;

  const labels = getEntityLabels(entityName);
  const isEdit = item !== null;

  let fieldsHtml = labels.columns
    .filter((col) => col.key !== "id") // el id es automático
    .map(
      (col) => `
      <label>${col.label}</label>
      <input id="ef-${col.key}"
        value="${isEdit ? item[col.key] || "" : ""}"
        type="${col.type || "text"}"
        placeholder="${col.label}"
        style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px; margin-bottom:10px; box-sizing:border-box;">
    `,
    )
    .join("");

  adminContent.innerHTML = `
    <div class="admin__crud-form">
      <h3>${isEdit ? "Editar" : "Agregar"} ${labels.singular}</h3>
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
  document.getElementById("btnCancelEntity").addEventListener("click", () => {
    adminContent.innerHTML = "";
  });

  // Guardar
  document
    .getElementById("btnSaveEntity")
    .addEventListener("click", async () => {
      const editableColumns = labels.columns.filter((col) => col.key !== "id");

      // Validar campos obligatorios
      const missing = editableColumns.filter(
        (col) =>
          col.required &&
          !document.getElementById(`ef-${col.key}`).value.trim(),
      );
      if (missing.length > 0) {
        showToast(
          `Por favor completa: ${missing.map((c) => c.label).join(", ")}`,
          "error",
        );
        return;
      }

      // Construir objeto con los valores del formulario
      const newItem = {};
      editableColumns.forEach((col) => {
        newItem[col.key] = document
          .getElementById(`ef-${col.key}`)
          .value.trim();
      });

      if (isEdit) {
        // ── EDITAR ──────────────────────────────────────────
        newItem.id = item.id;
        try {
          await apiUpdate(entityName, newItem);
        } catch (e) {
          console.error("Error actualizando en Sheets:", e);
        }

        // Actualizar en lista local
        const local = getLocalEntity(entityName);
        const idx = local.findIndex((i) => String(i.id) === String(item.id));
        if (idx >= 0) local[idx] = newItem;
        saveLocalEntity(entityName, local);
        renderEntityList(entityName, local);
      } else {
        // ── CREAR ────────────────────────────────────────────
        newItem.id = Date.now();
        let createResult;
        try {
          createResult = await apiPost(entityName, newItem);
        } catch (e) {
          createResult = {
            success: false,
            message: e?.message || "Error desconocido",
          };
          console.error("Error creando en Sheets:", e);
        }

        if (createResult && createResult.success) {
          const local = getLocalEntity(entityName);
          local.push(newItem);
          saveLocalEntity(entityName, local);
          renderEntityList(entityName, local);
        } else {
          console.error("No se pudo crear la entidad:", createResult);
        }
      }

      adminContent.innerHTML = "";
      showToast(
        `${labels.singular} ${isEdit ? "actualizada" : "creada"} correctamente.`,
        "success",
      );
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
      title: "Categorías",
      singular: "Categoría",
      columns: [
        { key: "id", label: "ID", required: false },
        { key: "nombre", label: "Nombre", required: true },
      ],
    },
    proveedores: {
      title: "Proveedores",
      singular: "Proveedor",
      columns: [
        { key: "id", label: "ID", required: false },
        { key: "nombre", label: "Nombre", required: true },
        { key: "telefono", label: "Teléfono", required: false },
        { key: "correo", label: "Correo", required: false, type: "email" },
      ],
    },
    clientes: {
      title: "Clientes",
      singular: "Cliente",
      columns: [
        { key: "id", label: "ID", required: false },
        { key: "nombre", label: "Nombre", required: true },
        { key: "telefono", label: "Teléfono", required: false },
        { key: "correo", label: "Correo", required: false, type: "email" },
      ],
    },
  };

  return (
    config[entityName] || {
      title: entityName,
      singular: entityName,
      columns: [
        { key: "id", label: "ID" },
        { key: "nombre", label: "Nombre" },
      ],
    }
  );
}
