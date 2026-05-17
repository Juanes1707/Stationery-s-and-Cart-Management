require('dotenv').config();
const path = require('path');

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: path.resolve(__dirname, '..', 'database.sqlite'),  // archivo local, ignorado por git
    logging: false,
  }
};
