'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Ventas', 'descuentoJson', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('Ventas', 'descuentoValor', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0
    });
    await queryInterface.addColumn('Ventas', 'subtotal', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0
    });
    await queryInterface.addColumn('Ventas', 'iva', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Ventas', 'iva');
    await queryInterface.removeColumn('Ventas', 'subtotal');
    await queryInterface.removeColumn('Ventas', 'descuentoValor');
    await queryInterface.removeColumn('Ventas', 'descuentoJson');
  }
};
