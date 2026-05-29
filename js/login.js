// ============================================================
// login.js — Lógica de la página de inicio de sesión
// Depende de auth.js (cargado antes en login.html)
// ============================================================

// Si ya hay sesión activa no tiene sentido estar en el login
if (isAuthenticated()) {
  window.location.href = 'index.html';
}

// ── Referencias al DOM ────────────────────────────────────────
const form      = document.getElementById('loginForm');
const btnLogin  = document.getElementById('loginBtn');
const errorBox  = document.getElementById('loginError');
const errorMsg  = document.getElementById('loginErrorMsg');
const togglePwd = document.getElementById('togglePwd');
const pwdInput  = document.getElementById('password');

// ── Mostrar / ocultar contraseña ──────────────────────────────
togglePwd.addEventListener('click', () => {
  const visible = pwdInput.type === 'text';
  pwdInput.type = visible ? 'password' : 'text';
  togglePwd.querySelector('i').className = visible
    ? 'fa-solid fa-eye'
    : 'fa-solid fa-eye-slash';
});

// ── Mostrar mensaje de error ──────────────────────────────────
function showError(message) {
  errorMsg.textContent = message;
  errorBox.classList.add('visible');
}

function hideError() {
  errorBox.classList.remove('visible');
}

// ── Controlar estado del botón ────────────────────────────────
function setLoading(active) {
  btnLogin.classList.toggle('loading', active);
  btnLogin.disabled = active;
}

// ── Envío del formulario ──────────────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError();

  const username = document.getElementById('username').value.trim();
  const password = pwdInput.value;

  if (!username || !password) {
    showError('Completa los dos campos.');
    return;
  }

  setLoading(true);

  try {
    await login(username, password);
    window.location.href = 'index.html';
  } catch (err) {
    showError(err.message || 'Error al iniciar sesión.');
  } finally {
    setLoading(false);
  }
});
