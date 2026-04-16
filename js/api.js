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

const API_URL = "https://script.google.com/macros/s/AKfycbxgPPVl8XFIhXgssDgI8_X_FKCBUeg_h132L2xILDwrKHD_90iHZHaJDiI66BqXLDTa/exec";

// GET — leer todos los registros de una hoja
async function apiGet(resource) {
  const response = await fetch(`${API_URL}?resource=${resource}`);
  const json = await response.json();
  return json.data;
}

// POST — crear nuevo registro (sin Content-Type para evitar preflight CORS)
async function apiPost(resource, data) {
  const response = await fetch(`${API_URL}?resource=${resource}`, {
    method: "POST",
    body: JSON.stringify(data)
    // NO incluir headers: { "Content-Type": "application/json" }
    // Apps Script lo recibe igual via e.postData.contents
  });
  return await response.json();
}

// UPDATE — editar registro existente por id
async function apiUpdate(resource, data) {
  const response = await fetch(`${API_URL}?resource=${resource}&action=update`, {
    method: "POST",
    body: JSON.stringify(data)
  });
  return await response.json();
}

// DELETE — eliminar registro por id
async function apiDelete(resource, data) {
  const response = await fetch(`${API_URL}?resource=${resource}&action=delete`, {
    method: "POST",
    body: JSON.stringify(data)
  });
  return await response.json();
}