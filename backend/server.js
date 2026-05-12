require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

// Importamos los middlewares
const requestLogger = require('./middlewares/requestLogger');
const sanitizeIds  = require('./middlewares/sanitizeIds');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Middlewares transversales — se aplican a TODAS las rutas
app.use(requestLogger); // pre-procesamiento: registra cada petición en la BD
app.use(sanitizeIds);   // post-procesamiento: elimina campos que terminen en 'Id'

// Rutas
app.use('/api/productos',   require('./routes/productos'));
app.use('/api/ventas',      require('./routes/ventas'));
app.use('/api/compras',     require('./routes/compras'));
app.use('/api/clientes',    require('./routes/clientes'));
app.use('/api/proveedores', require('./routes/proveedores'));
app.use('/api/categorias',  require('./routes/categorias'));

// Middleware global de errores — siempre al final
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: status === 500 ? 'Error interno del servidor' : err.message,
  });
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a SQLite exitosa');
    await sequelize.sync();
    console.log('Tablas sincronizadas');
    app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
  }
})();