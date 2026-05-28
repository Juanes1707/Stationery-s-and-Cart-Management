const { Compra, Producto } = require('../models');

function parseItemsJson(value) {
  if (!value) return [];
  if (typeof value !== 'string') return value;
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === 'string' ? parseItemsJson(parsed) : parsed;
  } catch (error) {
    return [];
  }
}

function stringifyItemsJson(value) {
  if (!value) return JSON.stringify([]);
  return typeof value === 'string' ? value : JSON.stringify(value);
}

exports.list = async (req, res, next) => {
  try {
    const data = await Compra.findAll();
    const parsed = data.map(c => ({
      ...c.toJSON(),
      itemsJson: parseItemsJson(c.itemsJson)
    }));
    res.json({ success: true, data: parsed });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const items = parseItemsJson(req.body.itemsJson);

    const body = {
      ...req.body,
      itemsJson: stringifyItemsJson(req.body.itemsJson)
    };

    // Crear la compra
    const nueva = await Compra.create(body);

    // Incrementar el stock de cada producto
    for (const item of items) {
      await Producto.increment('stock', {
        by: item.cantidad,
        where: { id: item.productoId }
      });
    }

    res.json({ success: true, data: nueva });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const compra = await Compra.findByPk(req.params.id);
    if (!compra) {
      return res.status(404).json({ success: false, message: 'Compra no encontrada.' });
    }

    // Si se actualizan items, ajustar inventario
    if (req.body.itemsJson) {
      const itemsOriginales = parseItemsJson(compra.itemsJson);
      const itemsNuevos = parseItemsJson(req.body.itemsJson);

      // Devolver el stock de los items originales
      for (const item of itemsOriginales) {
        await Producto.decrement('stock', {
          by: item.cantidad,
          where: { id: item.productoId }
        });
      }

      // Incrementar el stock de los nuevos items
      for (const item of itemsNuevos) {
        await Producto.increment('stock', {
          by: item.cantidad,
          where: { id: item.productoId }
        });
      }
    }

    const body = {
      ...req.body,
      itemsJson: stringifyItemsJson(req.body.itemsJson)
    };
    await Compra.update(body, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const compra = await Compra.findByPk(req.params.id);
    if (compra) {
      // Devolver el stock al eliminar una compra
      const items = parseItemsJson(compra.itemsJson);
      for (const item of items) {
        await Producto.decrement('stock', {
          by: item.cantidad,
          where: { id: item.productoId }
        });
      }
    }
    await Compra.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
};