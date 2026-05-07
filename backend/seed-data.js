const {
  sequelize,
  Categoria,
  Cliente,
  Compra,
  Producto,
  Proveedor,
  Venta,
} = require("./models");

const now = () => new Date();

async function seedIfEmpty(model, rows) {
  const count = await model.count();
  if (count > 0) return count;
  await model.bulkCreate(rows);
  return rows.length;
}

async function main() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  const categorias = [
    { nombre: "Cuadernos" },
    { nombre: "Escritura" },
    { nombre: "Arte" },
    { nombre: "Organizacion" },
    { nombre: "Oficina" },
  ];

  const clientes = [
    { nombre: "Laura Gomez", telefono: "3001234567", correo: "laura@example.com" },
    { nombre: "Carlos Ramirez", telefono: "3019876543", correo: "carlos@example.com" },
    { nombre: "Sofia Martinez", telefono: "3025557788", correo: "sofia@example.com" },
  ];

  const proveedores = [
    { nombre: "Distribuidora Andina", telefono: "6015550101", correo: "ventas@andina.com" },
    { nombre: "Papeles del Norte", telefono: "6015550102", correo: "contacto@papelesnorte.com" },
    { nombre: "Arte y Tinta SAS", telefono: "6015550103", correo: "pedidos@arteytinta.com" },
  ];

  const productos = [
    {
      nombre: "Cuaderno universitario 100 hojas",
      categoria: "Cuadernos",
      precio: 12500,
      costo: 7800,
      codigo: "CUA-100",
      stock: 40,
      seguimientoInventario: true,
      imagen: "./imagenes y recursos/default.jpg",
      descripcion: "Cuaderno rayado de uso diario.",
    },
    {
      nombre: "Agenda semanal minimalista",
      categoria: "Organizacion",
      precio: 28000,
      costo: 17000,
      codigo: "AGE-SEM",
      stock: 18,
      seguimientoInventario: true,
      imagen: "./imagenes y recursos/default.jpg",
      descripcion: "Agenda para planear tareas y entregas.",
    },
    {
      nombre: "Boligrafo gel negro",
      categoria: "Escritura",
      precio: 3500,
      costo: 1600,
      codigo: "BOL-GEL-N",
      stock: 80,
      seguimientoInventario: true,
      imagen: "./imagenes y recursos/default.jpg",
      descripcion: "Boligrafo de tinta gel punta fina.",
    },
    {
      nombre: "Set marcadores pastel x6",
      categoria: "Arte",
      precio: 22000,
      costo: 13500,
      codigo: "MAR-PAS-6",
      stock: 25,
      seguimientoInventario: true,
      imagen: "./imagenes y recursos/default.jpg",
      descripcion: "Marcadores en tonos pastel para lettering.",
    },
    {
      nombre: "Carpeta plastica oficio",
      categoria: "Oficina",
      precio: 4800,
      costo: 2200,
      codigo: "CAR-OFI",
      stock: 60,
      seguimientoInventario: true,
      imagen: "./imagenes y recursos/default.jpg",
      descripcion: "Carpeta resistente para documentos.",
    },
  ];

  const seeded = {};
  seeded.Categoria = await seedIfEmpty(Categoria, categorias);
  seeded.Cliente = await seedIfEmpty(Cliente, clientes);
  seeded.Proveedor = await seedIfEmpty(Proveedor, proveedores);
  seeded.Producto = await seedIfEmpty(Producto, productos);

  const createdProducts = await Producto.findAll();
  const firstClient = await Cliente.findOne();
  const firstProvider = await Proveedor.findOne();

  const saleItems = createdProducts.slice(0, 2).map((product) => ({
    productId: product.id,
    name: product.nombre,
    quantity: 1,
    price: product.precio,
  }));
  const saleTotal = saleItems.reduce((acc, item) => acc + item.price * item.quantity, 0) * 1.19;

  seeded.Venta = await seedIfEmpty(Venta, [
    {
      fecha: now(),
      clienteId: firstClient?.nombre || "Cliente mostrador",
      metodoPago: "efectivo",
      total: saleTotal,
      itemsJson: JSON.stringify({
        items: saleItems,
        customer: {
          name: firstClient?.nombre || "Cliente mostrador",
          email: firstClient?.correo || "",
          phone: firstClient?.telefono || "",
          address: "",
        },
        payment: { method: "efectivo", valuePaid: Math.ceil(saleTotal), change: 0 },
      }),
    },
  ]);

  const purchaseItems = createdProducts.slice(2, 5).map((product) => ({
    productId: product.id,
    name: product.nombre,
    quantity: 5,
    cost: product.costo,
    subtotal: product.costo * 5,
  }));
  const purchaseTotal = purchaseItems.reduce((acc, item) => acc + item.subtotal, 0);

  seeded.Compra = await seedIfEmpty(Compra, [
    {
      fecha: now(),
      proveedorId: firstProvider?.nombre || "Proveedor inicial",
      total: purchaseTotal,
      itemsJson: JSON.stringify(purchaseItems),
    },
  ]);

  console.log("Seed completado:");
  Object.entries(seeded).forEach(([table, count]) => {
    console.log(`- ${table}: ${count} registro(s) disponibles`);
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
