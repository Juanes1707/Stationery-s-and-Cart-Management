// ============================================================
// api.js - Comunicacion con backend Express + SQLite
// Incluye automaticamente el header Authorization en rutas protegidas.
// Depende de auth.js (debe cargarse antes en el HTML).
// ============================================================

const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? `http://${window.location.hostname}:3000/api`
  : 'https://stationery-api.onrender.com/api';

let lastApiError = null;

// ── Loader visual ─────────────────────────────────────────────
let apiRequestCounter = 0;

function getApiLoaderElement() { return document.getElementById("apiLoader"); }

function updateApiLoaderVisibility() {
  const loader = getApiLoaderElement();
  if (!loader) return;
  loader.classList.toggle("api-loader--visible", apiRequestCounter > 0);
}

function startApiLoader() { apiRequestCounter += 1; updateApiLoaderVisibility(); }
function stopApiLoader()  { apiRequestCounter = Math.max(0, apiRequestCounter - 1); updateApiLoaderVisibility(); }

// ── Logging ───────────────────────────────────────────────────
function logAPI(action, resource, status, data) {
  const timestamp = new Date().toLocaleTimeString("es-CO");
  const emoji  = { request: "⬆️", response: "⬇️", success: "✅", error: "❌" }[status] || "📡";
  const color  = { request: "#FF9800", response: "#2196F3", success: "#4CAF50", error: "#f44336" }[status] || "#666";
  console.log(`%c${emoji} [${timestamp}] ${action.toUpperCase()} /${resource}`, `color:${color};font-weight:bold;font-size:12px;`);
  if (data) console.log(data);
}

// ── Cabecera de autorización ──────────────────────────────────
// Lee el token de localStorage (guardado por auth.js al hacer login).
// Si no hay token devuelve un objeto vacío (rutas públicas no lo necesitan).
function _authHeader() {
  const token = (typeof getToken === "function") ? getToken() : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Manejo centralizado de respuestas 401 / 403 ───────────────
function _handleAuthError(status) {
  if (status === 401) {
    if (typeof logout === "function") logout();
    throw new Error("Sesión expirada. Inicia sesión nuevamente.");
  }
  if (status === 403) {
    throw new Error("Acceso denegado. No tienes permisos para esta acción.");
  }
}

// ── GET ───────────────────────────────────────────────────────
async function apiGet(resource) {
  startApiLoader();
  try {
    lastApiError = null;
    logAPI("GET", resource, "request");
    const response = await fetch(`${API_URL}/${resource}`, {
      headers: _authHeader(),
    });
    _handleAuthError(response.status);
    if (!response.ok) throw new Error(`HTTP ${response.status} consultando ${resource}`);
    const json = await response.json();
    logAPI("GET", resource, json.success ? "success" : "error", json);
    if (!json.success) throw new Error(json.message || `Respuesta invalida consultando ${resource}`);
    return json.data ?? [];
  } catch (err) {
    lastApiError = err;
    logAPI("GET", resource, "error", err);
    console.error(`Error GET ${resource}:`, err);
    return [];
  } finally {
    stopApiLoader();
  }
}

// ── POST ──────────────────────────────────────────────────────
async function apiPost(resource, data) {
  startApiLoader();
  try {
    logAPI("POST", resource, "request", data);
    const response = await fetch(`${API_URL}/${resource}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", ..._authHeader() },
      body:    JSON.stringify(data),
    });
    _handleAuthError(response.status);
    const json = await response.json();
    logAPI("POST", resource, json.success ? "success" : "error", json);
    if (!response.ok || !json.success) throw new Error(json.message || `Error POST ${resource}`);
    return json;
  } catch (err) {
    logAPI("POST", resource, "error", err);
    console.error(`Error POST ${resource}:`, err);
    return { success: false, message: err.message };
  } finally {
    stopApiLoader();
  }
}

// ── PUT ───────────────────────────────────────────────────────
async function apiUpdate(resource, data) {
  startApiLoader();
  try {
    logAPI("PUT", resource, "request", data);
    const response = await fetch(`${API_URL}/${resource}/${data.id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json", ..._authHeader() },
      body:    JSON.stringify(data),
    });
    _handleAuthError(response.status);
    const json = await response.json();
    logAPI("PUT", resource, json.success ? "success" : "error", json);
    if (!response.ok || !json.success) throw new Error(json.message || `Error PUT ${resource}`);
    return json;
  } catch (err) {
    logAPI("PUT", resource, "error", err);
    console.error(`Error PUT ${resource}:`, err);
    return { success: false, message: err.message };
  } finally {
    stopApiLoader();
  }
}

// ── DELETE ────────────────────────────────────────────────────
async function apiDelete(resource, data) {
  startApiLoader();
  try {
    logAPI("DELETE", resource, "request", data);
    const response = await fetch(`${API_URL}/${resource}/${data.id}`, {
      method:  "DELETE",
      headers: _authHeader(),
    });
    _handleAuthError(response.status);
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
