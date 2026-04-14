// ============================================================
// api.js - Comunicación con Google Sheets via Apps Script
// Todas las operaciones de datos pasan por este archivo
// ============================================================

const API_URL = "https://script.google.com/macros/s/AKfycbxgPPVl8XFIhXgssDgI8_X_FKCBUeg_h132L2xILDwrKHD_90iHZHaJDiI66BqXLDTa/exec";

// ============================================================
// GET - Leer todos los registros de una hoja
// Ejemplo: apiGet("productos") trae todos los productos
// ============================================================
async function apiGet(resource) {
  const response = await fetch(`${API_URL}?resource=${resource}`);
  const json = await response.json();
  return json.data; // Devuelve el array de objetos
}

// ============================================================
// POST - Crear un nuevo registro en una hoja
// Ejemplo: apiPost("productos", { id: "1", nombre: "Lápiz" })
// ============================================================
async function apiPost(resource, data) {
  const response = await fetch(`${API_URL}?resource=${resource}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return await response.json();
}

// ============================================================
// UPDATE - Editar un registro existente buscándolo por id
// Ejemplo: apiUpdate("productos", { id: "1", nombre: "Lápiz HB" })
// ============================================================
async function apiUpdate(resource, data) {
  const response = await fetch(`${API_URL}?resource=${resource}&action=update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return await response.json();
}

// ============================================================
// DELETE - Eliminar un registro buscándolo por id
// Ejemplo: apiDelete("productos", { id: "1" })
// ============================================================
async function apiDelete(resource, data) {
  const response = await fetch(`${API_URL}?resource=${resource}&action=delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return await response.json();
}