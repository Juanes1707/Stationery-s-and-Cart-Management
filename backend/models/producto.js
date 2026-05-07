'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Producto extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Producto.init({
    nombre: DataTypes.STRING,
    categoria: DataTypes.STRING,
    precio: DataTypes.FLOAT,
    costo: DataTypes.FLOAT,
    codigo: DataTypes.STRING,
    stock: DataTypes.INTEGER,
    seguimientoInventario: DataTypes.BOOLEAN,
    imagen: DataTypes.STRING,
    descripcion: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Producto',
  });
  return Producto;
};
