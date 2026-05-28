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
    subtotal: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    iva: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    descuentoValor: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    descuentoJson: DataTypes.TEXT,
    total: DataTypes.FLOAT,
    itemsJson: DataTypes.TEXT,
    estado: {
      type: DataTypes.ENUM('ABIERTA', 'CERRADA'),
      defaultValue: 'CERRADA',
      allowNull: false
    },
    usuarioQuereCorrijo: DataTypes.INTEGER,
    fechaCorreccion: DataTypes.DATE,
    justificacionCorreccion: DataTypes.TEXT,
    ventaOriginalJson: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Venta',
    tableName: 'Ventas',
  });
  return Venta;
};
