'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Reembolsos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      ventaId: { type: Sequelize.INTEGER, allowNull: false },
      tipo: { type: Sequelize.ENUM('PARCIAL', 'TOTAL'), allowNull: false },
      total: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 },
      retornaInventario: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      itemsJson: { type: Sequelize.TEXT, allowNull: false },
      motivo: { type: Sequelize.TEXT },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Reembolsos');
  }
};
