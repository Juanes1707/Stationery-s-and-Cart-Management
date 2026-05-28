'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Descuento extends Model {
    static associate(models) {}
  }

  Descuento.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tipo: {
      type: DataTypes.ENUM('PORCENTAJE', 'FIJO'),
      allowNull: false
    },
    valor: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Descuento',
    tableName: 'Descuentos'
  });

  return Descuento;
};
