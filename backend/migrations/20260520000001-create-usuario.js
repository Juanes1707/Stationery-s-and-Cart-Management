'use strict';

// Esta migración crea la tabla Usuarios y carga dos usuarios de prueba.
// Las contraseñas se hashean con bcryptjs antes de insertarse,
// así nunca quedan en texto plano en la base de datos.

module.exports = {
  async up(queryInterface, Sequelize) {
    const bcrypt = require('bcryptjs');

    await queryInterface.createTable('Usuarios', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      passwordHash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'USER',
      },
      nombre: {
        type: Sequelize.STRING,
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // Usuarios de prueba — contraseñas hasheadas con saltRounds = 10
    const adminHash  = await bcrypt.hash('admin123',  10);
    const cajeroHash = await bcrypt.hash('cajero123', 10);

    await queryInterface.bulkInsert('Usuarios', [
      {
        username:     'admin',
        passwordHash: adminHash,
        role:         'ADMIN',
        nombre:       'Administrador',
        activo:       1,
        createdAt:    new Date(),
        updatedAt:    new Date(),
      },
      {
        username:     'cajero',
        passwordHash: cajeroHash,
        role:         'USER',
        nombre:       'Cajero',
        activo:       1,
        createdAt:    new Date(),
        updatedAt:    new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Usuarios');
  },
};
