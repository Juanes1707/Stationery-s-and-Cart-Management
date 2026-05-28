'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Faltante extends Model {
    static associate(models) {}
  }

  Faltante.init({
    productoId: DataTypes.INTEGER,
    nombreProducto: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tipo: {
      type: DataTypes.ENUM('NO_EXISTE', 'AGOTADO'),
      allowNull: false
    },
    proveedor: DataTypes.STRING,
    cantidadSolicitada: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    cliente: DataTypes.STRING,
    notas: DataTypes.TEXT,
    resuelto: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    fechaResolucion: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Faltante',
    tableName: 'Faltantes'
  });

  return Faltante;
};
