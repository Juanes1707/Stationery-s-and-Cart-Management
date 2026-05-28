// ============================================================
// auth.js — Módulo de autenticación del frontend
// Maneja login, logout, sesión y consumo de rutas protegidas.
// Se carga ANTES que api.js en cualquier página que lo necesite.
// ============================================================

const AUTH_URL =
  window.location.port === '3000'
    ? `${window.location.origin}/api/auth`
    : 'https://stationery-api.onrender.com/api/auth';

// Claves usadas en localStorage (persisten incluso después de cerrar el navegador)
const TOKEN_KEY = 'py_token';
const USER_KEY  = 'py_user';

// ── Sesión ───────────────────────────────────────────────────

/** Guarda token y datos del usuario tras un login exitoso. */
function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/** Devuelve el token JWT guardado o null si no hay sesión. */
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/** Devuelve el objeto de usuario guardado o null. */
function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

/** true si hay un token en localStorage. */
function isAuthenticated() {
  return Boolean(getToken());
}

/** true si el usuario tiene el rol indicado (ADMIN hereda USER). */
function hasRole(role) {
  const user = getUser();
  if (!user) return false;
  if (user.role === 'ADMIN') return true; // ADMIN puede todo
  return user.role === role;
}

/** Borra la sesión y redirige al login. */
function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = '/login.html';
}

// ── Login ────────────────────────────────────────────────────

/**
 * Envía username y password al backend.
 * Si las credenciales son correctas guarda el token y devuelve el usuario.
 * Si no, lanza un Error con el mensaje del servidor.
 */
async function login(username, password) {
  const response = await fetch(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || 'Credenciales incorrectas.');
  }

  saveSession(json.token, json.user);
  return json.user;
}

// ── Consumo de rutas protegidas ──────────────────────────────

/**
 * Wrapper de fetch que añade automáticamente el header Authorization.
 * Redirige al login si el servidor responde 401 (sesión expirada).
 * Lanza Error claro si el servidor responde 403 (sin permisos).
 *
 * @param {string} url
 * @param {RequestInit} options
 * @returns {Promise<Response>}
 */
async function authFetch(url, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  // 401 → sesión inválida o expirada → forzar re-login
  if (response.status === 401) {
    logout();
    throw new Error('Sesión expirada. Inicia sesión nuevamente.');
  }

  // 403 → autenticado pero sin permisos suficientes
  if (response.status === 403) {
    throw new Error('Acceso denegado. No tienes permisos para esta acción.');
  }

  return response;
}

// ── Guard: proteger páginas ──────────────────────────────────

/**
 * Llama esta función al inicio de páginas que requieran login.
 * Si no hay sesión, redirige inmediatamente a login.html.
 * @param {string} [requiredRole] — si se pasa, verifica además el rol.
 */
function requireAuth(requiredRole) {
  if (!isAuthenticated()) {
    window.location.href = '/login.html';
    return false;
  }
  if (requiredRole && !hasRole(requiredRole)) {
    window.location.href = '/index.html';
    return false;
  }
  return true;
}
