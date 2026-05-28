'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Faltantes', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      productoId: { type: Sequelize.INTEGER, allowNull: true },
      nombreProducto: { type: Sequelize.STRING, allowNull: false },
      tipo: { type: Sequelize.ENUM('NO_EXISTE', 'AGOTADO'), allowNull: false },
      proveedor: { type: Sequelize.STRING },
      cantidadSolicitada: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      cliente: { type: Sequelize.STRING },
      notas: { type: Sequelize.TEXT },
      resuelto: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      fechaResolucion: { type: Sequelize.DATE },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Faltantes');
  }
};
