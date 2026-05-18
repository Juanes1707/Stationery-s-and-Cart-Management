// ============================================================
// permissions.js — Matriz de permisos por rol
// Depende de auth.js (getUser debe estar disponible antes)
// ============================================================

const PERMISSIONS = {
  ADMIN: {
    editProductCard:  true,
    manageCatalog:    true,
    managePurchases:  true,
    manageEntities:   true,
    viewHistory:      true,
  },
  USER: {
    editProductCard:  false,
    manageCatalog:    false,
    managePurchases:  false,
    manageEntities:   false,
    viewHistory:      true,
  },
};

/**
 * Devuelve true si el usuario en sesión tiene el permiso indicado.
 * Si no hay sesión activa, devuelve false para todo.
 * @param {string} permission — clave del mapa PERMISSIONS
 */
function can(permission) {
  const user = (typeof getUser === 'function') ? getUser() : null;
  if (!user) return false;
  const rolePerms = PERMISSIONS[user.role] || PERMISSIONS.USER;
  return Boolean(rolePerms[permission]);
}
