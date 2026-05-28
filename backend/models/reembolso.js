'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Reembolso extends Model {
    static associate(models) {}
  }

  Reembolso.init({
    ventaId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tipo: {
      type: DataTypes.ENUM('PARCIAL', 'TOTAL'),
      allowNull: false
    },
    total: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    retornaInventario: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    itemsJson: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    motivo: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Reembolso',
    tableName: 'Reembolsos'
  });

  return Reembolso;
};
