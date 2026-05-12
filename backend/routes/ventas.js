const express = require('express');
const { Venta, Producto, sequelize } = require('../models');
const router = express.Router();

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

function getSaleItems(body = {}) {
  const rawItems = body.items ?? body.itemsJson?.items ?? body.itemsJson ?? [];
  const items = Array.isArray(rawItems) ? rawItems : [];

  return items
    .map((item) => ({
      id: Number(item.id ?? item.productoId ?? item.productId),
      quantity: Number.parseInt(item.quantity ?? item.cantidad ?? 1, 10),
    }))
    .filter((item) => Number.isInteger(item.id) && item.id > 0 && Number.isInteger(item.quantity) && item.quantity > 0);
}

function getPayment(body = {}) {
  return body.payment ?? body.itemsJson?.payment ?? {
    method: body.metodoPago || 'efectivo',
  };
}

function getCustomer(body = {}) {
  return body.customer ?? body.itemsJson?.customer ?? {
    name: body.clienteId || 'Consumidor final',
  };
}

router.get('/', async (req, res, next) => {
  try {
    const data = await Venta.findAll({ order: [['fecha', 'DESC']] });
    // Parsear itemsJson antes de enviarlo al frontend
    const parsed = data.map(v => ({
      ...v.toJSON(),
      itemsJson: parseItemsJson(v.itemsJson)
    }));
    res.json({ success: true, data: parsed });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const items = getSaleItems(req.body);
    if (items.length === 0) {
      return res.status(400).json({ success: false, message: 'La venta debe tener al menos un producto.' });
    }

    const result = await sequelize.transaction(async (transaction) => {
      const saleItems = [];
      let subtotal = 0;

      for (const item of items) {
        const producto = await Producto.findByPk(item.id, { transaction });
        if (!producto) {
          const error = new Error(`Producto ${item.id} no encontrado.`);
          error.status = 404;
          throw error;
        }

        const tracking = producto.seguimientoInventario !== false;
        const stock = Number.parseInt(producto.stock ?? 0, 10);
        if (tracking && stock < item.quantity) {
          const error = new Error(`Stock insuficiente para ${producto.nombre}. Disponible: ${stock}.`);
          error.status = 409;
          throw error;
        }

        if (tracking) {
          await producto.update({ stock: stock - item.quantity }, { transaction });
        }

        const price = Number(producto.precio || 0);
        const lineSubtotal = price * item.quantity;
        subtotal += lineSubtotal;
        saleItems.push({
          id: producto.id,
          name: producto.nombre,
          code: producto.codigo,
          quantity: item.quantity,
          price,
          subtotal: lineSubtotal,
        });
      }

      const iva = subtotal * 0.19;
      const total = subtotal + iva;
      const customer = getCustomer(req.body);
      const payment = getPayment(req.body);

      const nueva = await Venta.create({
        fecha: req.body.fecha || new Date(),
        clienteId: customer?.name || req.body.clienteId || 'Consumidor final',
        metodoPago: payment?.method || req.body.metodoPago || 'efectivo',
        total,
        itemsJson: stringifyItemsJson({
          items: saleItems,
          customer,
          payment,
          subtotal,
          iva,
          total,
        }),
      }, { transaction });

      return { venta: nueva, items: saleItems, subtotal, iva, total, customer, payment };
    });

    res.status(201).json({
      success: true,
      data: {
        ...result.venta.toJSON(),
        itemsJson: {
          items: result.items,
          customer: result.customer,
          payment: result.payment,
          subtotal: result.subtotal,
          iva: result.iva,
          total: result.total,
        },
      },
    });
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const body = {
      ...req.body,
      itemsJson: stringifyItemsJson(req.body.itemsJson)
    };
    await Venta.update(body, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Venta.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
