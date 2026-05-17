'use strict';

async function isEmpty(queryInterface, tableName) {
  const [rows] = await queryInterface.sequelize.query(
    `SELECT COUNT(*) AS count FROM ${tableName}`
  );
  return Number(rows[0].count) === 0;
}

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    if (await isEmpty(queryInterface, 'Categorias')) {
      await queryInterface.bulkInsert('Categorias', [
        { nombre: 'Cuadernos', createdAt: now, updatedAt: now },
        { nombre: 'Escritura', createdAt: now, updatedAt: now },
        { nombre: 'Arte', createdAt: now, updatedAt: now },
        { nombre: 'Organizacion', createdAt: now, updatedAt: now },
        { nombre: 'Oficina', createdAt: now, updatedAt: now },
      ]);
    }

    if (await isEmpty(queryInterface, 'Clientes')) {
      await queryInterface.bulkInsert('Clientes', [
        { nombre: 'Laura Gomez', telefono: '3001234567', correo: 'laura@example.com', createdAt: now, updatedAt: now },
        { nombre: 'Carlos Ramirez', telefono: '3019876543', correo: 'carlos@example.com', createdAt: now, updatedAt: now },
        { nombre: 'Sofia Martinez', telefono: '3025557788', correo: 'sofia@example.com', createdAt: now, updatedAt: now },
      ]);
    }

    if (await isEmpty(queryInterface, 'Proveedores')) {
      await queryInterface.bulkInsert('Proveedores', [
        { nombre: 'Distribuidora Andina', telefono: '6015550101', correo: 'ventas@andina.com', createdAt: now, updatedAt: now },
        { nombre: 'Papeles del Norte', telefono: '6015550102', correo: 'contacto@papelesnorte.com', createdAt: now, updatedAt: now },
        { nombre: 'Arte y Tinta SAS', telefono: '6015550103', correo: 'pedidos@arteytinta.com', createdAt: now, updatedAt: now },
      ]);
    }

    if (await isEmpty(queryInterface, 'Productos')) {
      await queryInterface.bulkInsert('Productos', [
        {
          nombre: 'Cuaderno universitario 100 hojas',
          categoria: 'Cuadernos',
          precio: 12500,
          costo: 7800,
          codigo: 'CUA-100',
          stock: 40,
          seguimientoInventario: true,
          imagen: './imagenes y recursos/default.jpg',
          descripcion: 'Cuaderno rayado de uso diario.',
          createdAt: now,
          updatedAt: now,
        },
        {
          nombre: 'Agenda semanal minimalista',
          categoria: 'Organizacion',
          precio: 28000,
          costo: 17000,
          codigo: 'AGE-SEM',
          stock: 18,
          seguimientoInventario: true,
          imagen: './imagenes y recursos/default.jpg',
          descripcion: 'Agenda para planear tareas y entregas.',
          createdAt: now,
          updatedAt: now,
        },
        {
          nombre: 'Boligrafo gel negro',
          categoria: 'Escritura',
          precio: 3500,
          costo: 1600,
          codigo: 'BOL-GEL-N',
          stock: 80,
          seguimientoInventario: true,
          imagen: './imagenes y recursos/default.jpg',
          descripcion: 'Boligrafo de tinta gel punta fina.',
          createdAt: now,
          updatedAt: now,
        },
        {
          nombre: 'Set marcadores pastel x6',
          categoria: 'Arte',
          precio: 22000,
          costo: 13500,
          codigo: 'MAR-PAS-6',
          stock: 25,
          seguimientoInventario: true,
          imagen: './imagenes y recursos/default.jpg',
          descripcion: 'Marcadores en tonos pastel para lettering.',
          createdAt: now,
          updatedAt: now,
        },
        {
          nombre: 'Carpeta plastica oficio',
          categoria: 'Oficina',
          precio: 4800,
          costo: 2200,
          codigo: 'CAR-OFI',
          stock: 60,
          seguimientoInventario: true,
          imagen: './imagenes y recursos/default.jpg',
          descripcion: 'Carpeta resistente para documentos.',
          createdAt: now,
          updatedAt: now,
        },
      ]);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Productos', {
      codigo: ['CUA-100', 'AGE-SEM', 'BOL-GEL-N', 'MAR-PAS-6', 'CAR-OFI'],
    });
    await queryInterface.bulkDelete('Categorias', {
      nombre: ['Cuadernos', 'Escritura', 'Arte', 'Organizacion', 'Oficina'],
    });
    await queryInterface.bulkDelete('Clientes', {
      correo: ['laura@example.com', 'carlos@example.com', 'sofia@example.com'],
    });
    await queryInterface.bulkDelete('Proveedores', {
      correo: ['ventas@andina.com', 'contacto@papelesnorte.com', 'pedidos@arteytinta.com'],
    });
  },
};
