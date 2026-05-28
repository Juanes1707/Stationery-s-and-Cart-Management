'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Descuentos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      nombre: { type: Sequelize.STRING, allowNull: false },
      tipo: { type: Sequelize.ENUM('PORCENTAJE', 'FIJO'), allowNull: false },
      valor: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 },
      activo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Descuentos');
  }
};
