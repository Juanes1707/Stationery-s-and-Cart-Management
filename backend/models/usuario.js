'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    static associate(models) {}
  }

  Usuario.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      // Nunca guardar la contraseña en texto plano.
      // bcryptjs.hash() la convierte en un hash irreversible de 60 caracteres.
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'USER', // valores válidos: 'USER' | 'ADMIN'
      },
      nombre: {
        type: DataTypes.STRING,
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'Usuario',
      tableName:  'Usuarios',
    }
  );

  return Usuario;
};
