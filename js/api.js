// ============================================================
// api.js - Comunicación con Google Sheets via Apps Script
// ============================================================
// IMPORTANTE SOBRE CORS:
// Google Apps Script publicado como Web App anónima acepta POST,
// PERO si se envía Content-Type: application/json el navegador
// hace un "preflight" OPTIONS que Apps Script no soporta → falla.
// La solución es omitir el header Content-Type y enviar el JSON
// como texto plano. El Apps Script igual recibe el body en
// e.postData.contents y JSON.parse() lo procesa correctamente.
// ============================================================

const API_URL =
  "https://script.google.com/macros/s/AKfycbxgPPVl8XFIhXgssDgI8_X_FKCBUeg_h132L2xILDwrKHD_90iHZHaJDiI66BqXLDTa/exec";

// 🎨 Sistema de logging con estilos
function logAPI(action, resource, status, data = null) {
  const timestamp = new Date().toLocaleTimeString("es-CO");
  const statusEmoji = {
    request: "⬆️",
    response: "⬇️",
    success: "✅",
    error: "❌",
  };

  const emoji = statusEmoji[status] || "📡";
  const color =
    {
      request: "#FF9800",
      response: "#2196F3",
      success: "#4CAF50",
      error: "#f44336",
    }[status] || "#666";

  console.log(
    `%c${emoji} [${timestamp}] ${action.toUpperCase()} ${resource}`,
    `color: ${color}; font-weight: bold; font-size: 12px;`,
  );

  if (data) console.log(data);
}

const RESOURCE_ALIASES = {
  categorias: ["categorias", "categorías", "Categorias", "Categorías"],
  proveedores: ["proveedores", "Proveedores"],
  clientes: ["clientes", "Clientes"],
  productos: ["productos", "Productos"],
  compras: ["compras", "Compras"],
  ventas: ["ventas", "Ventas"],
};

function resolveResourceAliases(resource) {
  if (!resource) return [resource];
  return RESOURCE_ALIASES[resource.toLowerCase()] || [resource];
}

function isSheetNotFoundError(message) {
  if (!message) return false;
  const normalized = message.toString().toLowerCase();
  return [
    "cannot read properties of null (reading 'getdatarange')",
    "cannot read properties of null (reading 'getsheetbyname')",
    "sheet not found",
    "no such sheet",
  ].some((part) => normalized.includes(part));
}

async function fetchApi(resource, options = {}, action = null) {
  const aliases = resolveResourceAliases(resource);
  let lastJson = {
    success: false,
    message: "No se pudo conectar con el servidor.",
  };

  for (const alias of aliases) {
    const url = `${API_URL}?resource=${encodeURIComponent(alias)}${action ? `&action=${action}` : ""}`;
    logAPI(
      options.method || "REQUEST",
      alias,
      "request",
      options.body ? JSON.parse(options.body) : null,
    );

    const response = await fetch(url, options);
    let json;
    try {
      json = await response.json();
    } catch (err) {
      console.error(
        `Error parseando JSON de ${options.method || "FETCH"}:`,
        err,
      );
      json = { success: false, message: "Respuesta no válida del servidor." };
    }

    if (!response.ok) {
      json.success = false;
      json.message =
        json.message || `HTTP ${response.status} ${response.statusText}`;
    }

    logAPI(
      options.method || "REQUEST",
      alias,
      json.success ? "success" : "error",
      json,
    );

    if (json.success || !isSheetNotFoundError(json.message)) {
      return json;
    }

    lastJson = json;
    console.warn(`Reintentando con alias de recurso: ${alias}`);
  }

  return lastJson;
}

// GET — leer todos los registros de una hoja
async function apiGet(resource) {
  const json = await fetchApi(resource, {}, null);
  return json.data;
}

// POST — crear nuevo registro (sin Content-Type para evitar preflight CORS)
async function apiPost(resource, data) {
  const json = await fetchApi(
    resource,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    null,
  );
  return json;
}

// UPDATE — editar registro existente por id
async function apiUpdate(resource, data) {
  const json = await fetchApi(
    resource,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    "update",
  );
  return json;
}

// DIAGNOSTIC — función completa para diagnosticar problemas con Google Sheets
async function diagnoseGoogleSheets() {
  console.log(
    "%c🔍 Iniciando diagnóstico de Google Sheets...",
    "color: #FF9800; font-weight: bold; font-size: 14px;",
  );

  // 1. Probar conectividad básica
  console.log(
    "%c1️⃣ Probando conectividad básica...",
    "color: #2196F3; font-weight: bold;",
  );
  try {
    const response = await fetch(`${API_URL}?resource=categorias`);
    console.log(
      `%c   Status HTTP: ${response.status} ${response.statusText}`,
      "color: #666;",
    );

    if (!response.ok) {
      console.error(
        "%c❌ Error HTTP en la respuesta",
        "color: #f44336; font-weight: bold;",
      );
      return;
    }

    const json = await response.json();
    console.log("%c   Respuesta JSON:", "color: #666;");
    console.log(json);

    if (json.success === undefined) {
      console.error(
        '%c❌ La respuesta no tiene propiedad "success"',
        "color: #f44336; font-weight: bold;",
      );
      console.error(
        'El Google Apps Script debería devolver: { success: true/false, data: [...], message?: "..." }',
      );
    } else {
      console.log(
        "%c✅ Respuesta tiene formato correcto",
        "color: #4CAF50; font-weight: bold;",
      );
    }
  } catch (error) {
    console.error("%c❌ Error de red:", "color: #f44336; font-weight: bold;");
    console.error(error);
    return;
  }

  // 2. Probar POST simulado
  console.log(
    "%c2️⃣ Probando POST simulado...",
    "color: #2196F3; font-weight: bold;",
  );
  try {
    const testData = { id: Date.now(), nombre: "Categoría de Prueba" };
    console.log("%c   Datos de prueba:", "color: #666;");
    console.log(testData);

    const postResponse = await fetch(`${API_URL}?resource=categorias`, {
      method: "POST",
      body: JSON.stringify(testData),
    });

    console.log(
      `%c   Status HTTP POST: ${postResponse.status} ${postResponse.statusText}`,
      "color: #666;",
    );

    if (!postResponse.ok) {
      console.error(
        "%c❌ Error HTTP en POST",
        "color: #f44336; font-weight: bold;",
      );
      return;
    }

    const postJson = await postResponse.json();
    console.log("%c   Respuesta POST:", "color: #666;");
    console.log(postJson);

    if (postJson.success) {
      console.log("%c✅ POST exitoso", "color: #4CAF50; font-weight: bold;");
    } else {
      console.error("%c❌ POST falló:", "color: #f44336; font-weight: bold;");
      console.error(postJson.message || "Sin mensaje de error");
    }
  } catch (error) {
    console.error("%c❌ Error en POST:", "color: #f44336; font-weight: bold;");
    console.error(error);
  }

  console.log(
    "%c🏁 Diagnóstico completado",
    "color: #FF9800; font-weight: bold;",
  );
}

// Exponer funciones de diagnóstico globalmente para usar desde consola
window.testSheets = testGoogleSheetsConnection;
window.diagnoseSheets = diagnoseGoogleSheets;
