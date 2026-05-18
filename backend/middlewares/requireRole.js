'use strict';

// ── Middleware de fábrica: restringe el acceso por rol ────────
//
// Es parametrizable: devuelve un middleware configurado para un rol específico.
// Debe usarse SIEMPRE después de authJwt, porque depende de que req.user exista.
//
// Roles válidos: 'USER' | 'ADMIN'
// (ADMIN puede hacer todo lo que USER puede, más operaciones sensibles)
//
// Uso:
//   router.post('/', authJwt, requireRole('ADMIN'), controller.create);
//   router.get('/reporte', authJwt, requireRole('USER'), controller.list);

module.exports = function requireRole(role) {
  return function (req, res, next) {
    // Si authJwt no se ejecutó antes, req.user no existe → 401
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado.',
      });
    }

    // Verificar que el usuario tenga exactamente el rol requerido.
    // ADMIN también puede acceder a rutas de USER.
    const userRole = req.user.role;
    const allowed =
      userRole === role ||
      (role === 'USER' && userRole === 'ADMIN'); // ADMIN hereda permisos de USER

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Se requiere rol ${role}.`,
      });
    }

    next();
  };
};
