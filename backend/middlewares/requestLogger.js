// Importamos el modelo RequestLog para guardar cada petición en la BD
const { RequestLog } = require('../models');

// Middleware de pre-procesamiento — se ejecuta ANTES de que llegue al controlador
module.exports = async (req, res, next) => {
  try {
    // Guardamos en la BD el método HTTP, la ruta solicitada y la IP del cliente
    await RequestLog.create({
      method: req.method,      // ej: GET, POST, PUT, DELETE
      path:   req.originalUrl, // ej: /api/productos
      ip:     req.ip,          // IP de quien hizo la petición
    });
  } catch (err) {
    // Si falla el log, solo mostramos el error en consola
    // pero NO bloqueamos la petición — el cliente no debe sufrir por un fallo de logging
    console.error('Error guardando log:', err);
  }

  // Llamamos a next() para que la petición continúe hacia el controlador
  next();
};
