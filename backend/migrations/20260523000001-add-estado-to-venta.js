'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Ventas', 'estado', {
      type: Sequelize.ENUM('ABIERTA', 'CERRADA'),
      defaultValue: 'CERRADA',
      allowNull: false
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Ventas', 'estado');
  }
};
