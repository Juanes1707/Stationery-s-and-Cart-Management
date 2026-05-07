'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Venta extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Venta.init({
    fecha: DataTypes.DATE,
    clienteId: DataTypes.INTEGER,
    metodoPago: DataTypes.STRING,
    total: DataTypes.FLOAT,
    itemsJson: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Venta',
    tableName: 'Ventas',
  });
  return Venta;
};