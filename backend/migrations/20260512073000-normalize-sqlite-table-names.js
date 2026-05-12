'use strict';

async function tableExists(queryInterface, tableName) {
  const tables = await queryInterface.showAllTables();
  return tables
    .map((table) => (typeof table === 'string' ? table : table.tableName))
    .includes(tableName);
}

async function renameIfNeeded(queryInterface, oldName, newName) {
  const hasOld = await tableExists(queryInterface, oldName);
  const hasNew = await tableExists(queryInterface, newName);

  if (hasOld && !hasNew) {
    await queryInterface.renameTable(oldName, newName);
  }
}

module.exports = {
  async up(queryInterface) {
    await renameIfNeeded(queryInterface, 'Categoria', 'Categorias');
    await renameIfNeeded(queryInterface, 'Venta', 'Ventas');
    await renameIfNeeded(queryInterface, 'Proveedors', 'Proveedores');
  },

  async down(queryInterface) {
    await renameIfNeeded(queryInterface, 'Categorias', 'Categoria');
    await renameIfNeeded(queryInterface, 'Ventas', 'Venta');
    await renameIfNeeded(queryInterface, 'Proveedores', 'Proveedors');
  },
};
