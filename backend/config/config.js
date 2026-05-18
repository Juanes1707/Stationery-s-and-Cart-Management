require('dotenv').config();
const path = require('path');

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: path.resolve(__dirname, '..', 'database.sqlite'), // archivo local, ignorado por git
    logging: false,
  },

  // Entorno de pruebas: SQLite en memoria (no persiste, util para CI)
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  },

  // Entorno de produccion (Render): PostgreSQL gestionado
  // Render inyecta DATABASE_URL automaticamente cuando vinculas la BD al servicio.
  // dialectOptions.ssl es obligatorio porque Render exige conexiones cifradas.
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
