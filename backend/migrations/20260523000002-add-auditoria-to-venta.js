'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Ventas', 'usuarioQuereCorrijo', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
    await queryInterface.addColumn('Ventas', 'fechaCorreccion', {
      type: Sequelize.DATE,
      allowNull: true
    });
    await queryInterface.addColumn('Ventas', 'justificacionCorreccion', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('Ventas', 'ventaOriginalJson', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Ventas', 'usuarioQuereCorrijo');
    await queryInterface.removeColumn('Ventas', 'fechaCorreccion');
    await queryInterface.removeColumn('Ventas', 'justificacionCorreccion');
    await queryInterface.removeColumn('Ventas', 'ventaOriginalJson');
  }
};
