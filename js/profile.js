// ============================================================
// profile.js — Módulo "Mi cuenta": cambiar usuario y contraseña
// Depende de: auth.js (authFetch, getUser, saveSession)
//             admin.js (showToast)
// ============================================================

const PROFILE_URL =
  window.location.port === '3000'
    ? `${window.location.origin}/api/auth/profile`
    : 'https://stationery-api.onrender.com/api/auth/profile';

function renderProfileModule() {
  // Mismo patrón que purchases.js / entities.js / renderProductsInMainArea
  const historySection = document.getElementById('historySection');
  const historyContent = document.querySelector('.history__content-sales');
  if (!historySection || !historyContent) return;

  historySection.classList.add('admin-listing');

  const user = (typeof getUser === 'function') ? getUser() : null;
  const currentUsername = user ? (user.nombre || user.username) : '';

  historyContent.innerHTML = `
    <div class="profile-module">
      <div class="admin__list-header">
        <h2>Mi cuenta</h2>
      </div>
      <p class="profile-module__subtitle">
        Puedes cambiar tu nombre de usuario, tu contraseña o ambos.
        Ingresa siempre tu contraseña actual para confirmar los cambios.
      </p>

      <form id="profileForm" novalidate autocomplete="off">

        <div class="profile-section">
          <h3 class="profile-section__label">Cambiar nombre de usuario</h3>
          <div class="profile-field">
            <label for="pf-new-username">Nuevo usuario</label>
            <input id="pf-new-username" type="text"
                   placeholder="${escapeProfileHtml(currentUsername)}"
                   autocomplete="off" spellcheck="false">
            <span class="profile-hint">Déjalo vacío si no quieres cambiarlo.</span>
          </div>
        </div>

        <div class="profile-section">
          <h3 class="profile-section__label">Cambiar contraseña</h3>
          <div class="profile-field">
            <label for="pf-new-password">Nueva contraseña</label>
            <div class="profile-pwd-wrap">
              <input id="pf-new-password" type="password"
                     placeholder="Mínimo 6 caracteres"
                     autocomplete="new-password">
              <button type="button" class="profile-toggle-pwd"
                      data-target="pf-new-password" aria-label="Mostrar">
                <i class="fa-solid fa-eye"></i>
              </button>
            </div>
            <span class="profile-hint">Déjala vacía si no quieres cambiarla.</span>
          </div>
          <div class="profile-field">
            <label for="pf-confirm-password">Confirmar nueva contraseña</label>
            <div class="profile-pwd-wrap">
              <input id="pf-confirm-password" type="password"
                     placeholder="Repite la contraseña"
                     autocomplete="new-password">
              <button type="button" class="profile-toggle-pwd"
                      data-target="pf-confirm-password" aria-label="Mostrar">
                <i class="fa-solid fa-eye"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="profile-section profile-section--current">
          <h3 class="profile-section__label">
            <i class="fa-solid fa-lock" style="margin-right:5px;color:#ca8a04"></i>
            Confirmar identidad
          </h3>
          <div class="profile-field">
            <label for="pf-current-password">
              Contraseña actual <span class="profile-required">*</span>
            </label>
            <div class="profile-pwd-wrap">
              <input id="pf-current-password" type="password"
                     placeholder="Tu contraseña actual"
                     autocomplete="current-password" required>
              <button type="button" class="profile-toggle-pwd"
                      data-target="pf-current-password" aria-label="Mostrar">
                <i class="fa-solid fa-eye"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="profile-error" id="profileError" role="alert" style="display:none">
          <i class="fa-solid fa-circle-exclamation"></i>
          <span id="profileErrorMsg"></span>
        </div>

        <button type="submit" class="profile-submit" id="profileSubmitBtn">
          <span class="profile-spinner"></span>
          <span class="profile-btn-text">
            <i class="fa-solid fa-floppy-disk"></i> Guardar cambios
          </span>
        </button>

      </form>
    </div>
  `;

  // ── Toggle mostrar/ocultar contraseña ──────────────────────
  historyContent.querySelectorAll('.profile-toggle-pwd').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;
      const showing = input.type === 'text';
      input.type = showing ? 'password' : 'text';
      btn.querySelector('i').className =
        showing ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
    });
  });

  // ── Envío del formulario ───────────────────────────────────
  document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    _profileHideError();

    const newUsername     = document.getElementById('pf-new-username').value.trim();
    const newPassword     = document.getElementById('pf-new-password').value;
    const confirmPwd      = document.getElementById('pf-confirm-password').value;
    const currentPassword = document.getElementById('pf-current-password').value;

    if (!currentPassword) {
      return _profileShowError('Debes ingresar tu contraseña actual para guardar cambios.');
    }
    if (!newUsername && !newPassword) {
      return _profileShowError('Ingresa un nuevo usuario o una nueva contraseña.');
    }
    if (newPassword && newPassword !== confirmPwd) {
      return _profileShowError('Las contraseñas nuevas no coinciden.');
    }
    if (newPassword && newPassword.length < 6) {
      return _profileShowError('La nueva contraseña debe tener al menos 6 caracteres.');
    }

    _profileSetLoading(true);

    try {
      const body = { currentPassword };
      if (newUsername) body.newUsername = newUsername;
      if (newPassword) body.newPassword = newPassword;

      const res  = await authFetch(PROFILE_URL, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        return _profileShowError(json.message || 'No se pudo actualizar el perfil.');
      }

      // Actualizar token y datos de sesión con los nuevos valores
      saveSession(json.token, json.user);

      showToast('¡Perfil actualizado correctamente!', 'success');

      // Limpiar campos de contraseña y resetear placeholder del usuario
      document.getElementById('pf-new-password').value     = '';
      document.getElementById('pf-confirm-password').value = '';
      document.getElementById('pf-current-password').value = '';
      document.getElementById('pf-new-username').value     = '';
      document.getElementById('pf-new-username').placeholder =
        escapeProfileHtml(json.user.nombre || json.user.username);

    } catch (err) {
      _profileShowError(err.message || 'Error de conexión con el servidor.');
    } finally {
      _profileSetLoading(false);
    }
  });
}

// ── Helpers ────────────────────────────────────────────────────
function _profileShowError(msg) {
  const box = document.getElementById('profileError');
  const txt = document.getElementById('profileErrorMsg');
  if (box && txt) { txt.textContent = msg; box.style.display = 'flex'; }
}

function _profileHideError() {
  const box = document.getElementById('profileError');
  if (box) box.style.display = 'none';
}

function _profileSetLoading(active) {
  const btn = document.getElementById('profileSubmitBtn');
  if (!btn) return;
  btn.disabled = active;
  btn.classList.toggle('profile-submit--loading', active);
}

function escapeProfileHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g,
    (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
}
