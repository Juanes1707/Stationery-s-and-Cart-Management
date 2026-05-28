const { Op } = require('sequelize');
const { Venta, Compra, Faltante } = require('../models');

function parseJson(value) {
  if (!value) return {};
  if (typeof value !== 'string') return value;
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === 'string' ? parseJson(parsed) : parsed;
  } catch (error) {
    return {};
  }
}

function itemsFrom(value) {
  const parsed = parseJson(value);
  return Array.isArray(parsed) ? parsed : parsed.items || [];
}

function dateRange(query) {
  const desde = query.desde ? new Date(`${query.desde}T00:00:00`) : new Date();
  const hasta = query.hasta ? new Date(`${query.hasta}T23:59:59`) : new Date(desde);
  if (!query.hasta) hasta.setHours(23, 59, 59, 999);
  return { [Op.between]: [desde, hasta] };
}

exports.basicos = async (req, res, next) => {
  try {
    const range = dateRange(req.query);
    const ventas = await Venta.findAll({ where: { fecha: range } });
    const compras = await Compra.findAll({ where: { fecha: range } });
    const faltantes = await Faltante.findAll();

    const productos = new Map();
    ventas.forEach((venta) => {
      itemsFrom(venta.itemsJson).forEach((item) => {
        const id = item.productoId ?? item.id ?? item.nombre ?? item.name;
        const current = productos.get(id) || {
          productoId: item.productoId ?? item.id,
          nombre: item.nombre || item.name || 'Producto',
          cantidad: 0,
          total: 0
        };
        const cantidad = Number(item.cantidad ?? item.quantity ?? 0);
        const precio = Number(item.precio ?? item.price ?? 0);
        current.cantidad += cantidad;
        current.total += cantidad * precio;
        productos.set(id, current);
      });
    });

    const faltantesFrecuentes = new Map();
    faltantes.forEach((faltante) => {
      const key = faltante.nombreProducto.toLowerCase();
      const current = faltantesFrecuentes.get(key) || {
        nombreProducto: faltante.nombreProducto,
        tipo: faltante.tipo,
        proveedor: faltante.proveedor,
        veces: 0,
        cantidadSolicitada: 0,
        pendientes: 0
      };
      current.veces += 1;
      current.cantidadSolicitada += Number(faltante.cantidadSolicitada || 0);
      if (!faltante.resuelto) current.pendientes += 1;
      faltantesFrecuentes.set(key, current);
    });

    res.json({
      success: true,
      data: {
        ventasTotales: {
          cantidad: ventas.length,
          total: ventas.reduce((acc, venta) => acc + Number(venta.total || 0), 0)
        },
        productosMasVendidos: Array.from(productos.values()).sort((a, b) => b.cantidad - a.cantidad),
        comprasRegistradas: {
          cantidad: compras.length,
          total: compras.reduce((acc, compra) => acc + Number(compra.total || 0), 0),
          compras
        },
        faltantesFrecuentes: Array.from(faltantesFrecuentes.values()).sort((a, b) => b.cantidadSolicitada - a.cantidadSolicitada)
      }
    });
  } catch (err) { next(err); }
};
