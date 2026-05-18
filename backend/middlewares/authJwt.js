'use strict';

const jwt = require('jsonwebtoken');

// ── Middleware: verifica que la petición lleve un JWT válido ──
//
// Flujo:
//   1. Lee el header Authorization
//   2. Verifica que tenga el formato "Bearer <token>"
//   3. Valida la firma y la expiración del token con JWT_SECRET
//   4. Si todo es correcto → guarda el payload en req.user y llama a next()
//   5. Si algo falla → responde 401 inmediatamente
//
// Uso:
//   router.get('/ruta-protegida', authJwt, (req, res) => { ... });
//   El controlador puede leer req.user.sub, req.user.username, req.user.role

module.exports = function authJwt(req, res, next) {
  const authHeader = req.headers['authorization'];

  // El header debe existir y tener el formato "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token no proporcionado. Debes iniciar sesión.',
    });
  }

  // Extraer el token (quitar "Bearer " del principio)
  const token = authHeader.slice(7);

  try {
    // jwt.verify lanza excepción si el token es inválido o expiró
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // disponible en todos los controladores siguientes
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'La sesión expiró. Inicia sesión nuevamente.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token inválido.',
    });
  }
};
