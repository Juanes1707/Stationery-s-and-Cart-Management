// ============================================================
// api.js - Comunicación con backend Express + SQLite
// ============================================================

const API_URL = "http://localhost:3000/api";

// ============================================================
// Loader visual (se mantiene igual que antes)
// ============================================================
let apiRequestCounter = 0;

function getApiLoaderElement() {
  return document.getElementById("apiLoader");
}

function updateApiLoaderVisibility() {
  const loader = getApiLoaderElement();
  if (!loader) return;
  loader.classList.toggle("api-loader--visible", apiRequestCounter > 0);
}

function startApiLoader() {
  apiRequestCounter += 1;
  updateApiLoaderVisibility();
}

function stopApiLoader() {
  apiRequestCounter = Math.max(0, apiRequestCounter - 1);
  updateApiLoaderVisibility();
}

// ============================================================
// Logging (se mantiene igual que antes)
// ============================================================
function logAPI(action, resource, status, data = null) {
  const timestamp = new Date().toLocaleTimeString("es-CO");
  const statusEmoji = { request: "⬆️", response: "⬇️", success: "✅", error: "❌" };
  const emoji = statusEmoji[status] || "📡";
  const color = { request: "#FF9800", response: "#2196F3", success: "#4CAF50", error: "#f44336" }[status] || "#666";
  console.log(
    `%c${emoji} [${timestamp}] ${action.toUpperCase()} /${resource}`,
    `color: ${color}; font-weight: bold; font-size: 12px;`
  );
  if (data) console.log(data);
}

// ============================================================
// GET — leer todos los registros
// ============================================================
async function apiGet(resource) {
  startApiLoader();
  try {
    logAPI("GET", resource, "request");
    const response = await fetch(`${API_URL}/${resource}`);
    const json = await response.json();
    logAPI("GET", resource, json.success ? "success" : "error", json);
    return json.data ?? [];
  } catch (err) {
    logAPI("GET", resource, "error", err);
    console.error(`Error GET ${resource}:`, err);
    return [];
  } finally {
    stopApiLoader();
  }
}

// ============================================================
// POST — crear nuevo registro
// ============================================================
async function apiPost(resource, data) {
  startApiLoader();
  try {
    logAPI("POST", resource, "request", data);
    const response = await fetch(`${API_URL}/${resource}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await response.json();
    logAPI("POST", resource, json.success ? "success" : "error", json);
    return json;
  } catch (err) {
    logAPI("POST", resource, "error", err);
    console.error(`Error POST ${resource}:`, err);
    return { success: false, message: err.message };
  } finally {
    stopApiLoader();
  }
}

// ============================================================
// UPDATE — editar registro existente por id
// ============================================================
async function apiUpdate(resource, data) {
  startApiLoader();
  try {
    logAPI("PUT", resource, "request", data);
    const response = await fetch(`${API_URL}/${resource}/${data.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await response.json();
    logAPI("PUT", resource, json.success ? "success" : "error", json);
    return json;
  } catch (err) {
    logAPI("PUT", resource, "error", err);
    console.error(`Error PUT ${resource}:`, err);
    return { success: false, message: err.message };
  } finally {
    stopApiLoader();
  }
}

// ============================================================
// DELETE — eliminar registro por id
// ============================================================
async function apiDelete(resource, data) {
  startApiLoader();
  try {
    logAPI("DELETE", resource, "request", data);
    const response = await fetch(`${API_URL}/${resource}/${data.id}`, {
      method: "DELETE",
    });
    const json = await response.json();
    logAPI("DELETE", resource, json.success ? "success" : "error", json);
    if (!json.success) throw new Error(json.message || "Error eliminando.");
    return json;
  } catch (err) {
    logAPI("DELETE", resource, "error", err);
    console.error(`Error DELETE ${resource}:`, err);
    throw err;
  } finally {
    stopApiLoader();
  }
}