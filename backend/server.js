require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const { runMigrations } = require('./migrate');

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

app.use(express.static(path.join(__dirname, '..')));

// Middleware global de errores — siempre al final
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a SQLite exitosa');
    await runMigrations();
    console.log('Migraciones verificadas');
    app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
  }
})();
