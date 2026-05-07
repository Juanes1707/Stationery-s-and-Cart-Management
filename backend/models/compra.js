'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Compra extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Compra.init({
    fecha: DataTypes.DATE,
    proveedorId: DataTypes.INTEGER,
    total: DataTypes.FLOAT,
    itemsJson: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Compra',
  });
  return Compra;
};