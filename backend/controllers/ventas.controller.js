const { Venta, Producto, Descuento, Reembolso, sequelize } = require('../models');

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

function normalizeItemsPayload(value) {
  const payload = parseItemsJson(value);
  if (Array.isArray(payload)) return { items: payload };
  return {
    ...payload,
    items: Array.isArray(payload.items) ? payload.items : []
  };
}

function getItemProductoId(item) {
  return Number(item.productoId ?? item.id);
}

function getItemCantidad(item) {
  return Number(item.cantidad ?? item.quantity ?? 0);
}

function getItemPrecio(item) {
  return Number(item.precio ?? item.price ?? 0);
}

function stringifyPayload(value) {
  return JSON.stringify(normalizeItemsPayload(value));
}

function parseDescuento(value) {
  if (!value) return null;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch (error) { return null; }
  }
  return value;
}

function calcularDescuento(subtotal, descuento) {
  if (!descuento) return 0;
  const valor = Number(descuento.valor || 0);
  if (valor <= 0) return 0;
  if (descuento.tipo === 'PORCENTAJE') {
    return Math.min(subtotal, subtotal * (Math.min(valor, 100) / 100));
  }
  return Math.min(subtotal, valor);
}

async function resolveDescuento(descuentoId, descuentoJson) {
  if (descuentoId) {
    const descuento = await Descuento.findByPk(descuentoId);
    if (!descuento || !descuento.activo) {
      const error = new Error('El descuento no existe o no esta activo.');
      error.status = 400;
      throw error;
    }
    return {
      id: descuento.id,
      nombre: descuento.nombre,
      tipo: descuento.tipo,
      valor: Number(descuento.valor)
    };
  }
  return parseDescuento(descuentoJson);
}

function calcularTotales(items, descuento) {
  const subtotal = items.reduce((acc, item) => acc + getItemPrecio(item) * getItemCantidad(item), 0);
  const descuentoValor = calcularDescuento(subtotal, descuento);
  const base = Math.max(0, subtotal - descuentoValor);
  const iva = base * 0.19;
  const total = base + iva;

  return { subtotal, descuentoValor, iva, total };
}

function serializeVenta(venta) {
  const row = venta.toJSON();
  return {
    ...row,
    itemsJson: normalizeItemsPayload(row.itemsJson),
    descuentoJson: parseDescuento(row.descuentoJson)
  };
}

exports.list = async (req, res, next) => {
  try {
    const data = await Venta.findAll({ order: [['fecha', 'DESC'], ['id', 'DESC']] });
    res.json({ success: true, data: data.map(serializeVenta) });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const payload = normalizeItemsPayload(req.body.itemsJson);
    const items = payload.items;
    const descuento = await resolveDescuento(req.body.descuentoId, req.body.descuentoJson);
    const calculo = calcularTotales(items, descuento);

    for (const item of items) {
      const productoId = getItemProductoId(item);
      const cantidad = getItemCantidad(item);
      const producto = await Producto.findByPk(productoId, { transaction });
      if (!producto) {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: `Producto con ID ${productoId} no encontrado.` });
      }
      if (producto.seguimientoInventario !== false && Number(producto.stock) < cantidad) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente de ${producto.nombre}. Disponible: ${producto.stock}, solicitado: ${cantidad}.`
        });
      }
    }

    const nueva = await Venta.create({
      ...req.body,
      estado: 'CERRADA',
      subtotal: calculo.subtotal,
      iva: calculo.iva,
      descuentoValor: calculo.descuentoValor,
      descuentoJson: descuento ? JSON.stringify(descuento) : null,
      total: calculo.total,
      itemsJson: stringifyPayload({ ...payload, total: calculo.total, descuento })
    }, { transaction });

    for (const item of items) {
      const productoId = getItemProductoId(item);
      const cantidad = getItemCantidad(item);
      await Producto.decrement('stock', { by: cantidad, where: { id: productoId }, transaction });
    }

    await transaction.commit();
    res.json({ success: true, data: serializeVenta(nueva) });
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
};

exports.update = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const venta = await Venta.findByPk(req.params.id, { transaction });
    if (!venta) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Venta no encontrada.' });
    }

    if (venta.estado === 'CERRADA' && req.body.estado !== 'ABIERTA') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'No se puede editar una venta cerrada. Debe abrirla primero mediante la opcion de correccion.'
      });
    }

    const originalPayload = normalizeItemsPayload(venta.itemsJson);
    const nextPayload = req.body.itemsJson ? normalizeItemsPayload(req.body.itemsJson) : originalPayload;
    const nextDescuento = await resolveDescuento(req.body.descuentoId, req.body.descuentoJson ?? venta.descuentoJson);
    const calculo = calcularTotales(nextPayload.items, nextDescuento);

    if (req.body.itemsJson) {
      for (const item of originalPayload.items) {
        await Producto.increment('stock', {
          by: getItemCantidad(item),
          where: { id: getItemProductoId(item) },
          transaction
        });
      }

      for (const item of nextPayload.items) {
        const productoId = getItemProductoId(item);
        const cantidad = getItemCantidad(item);
        const producto = await Producto.findByPk(productoId, { transaction });
        if (!producto) {
          await transaction.rollback();
          return res.status(400).json({ success: false, message: `Producto con ID ${productoId} no encontrado.` });
        }
        if (producto.seguimientoInventario !== false && Number(producto.stock) < cantidad) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: `Stock insuficiente de ${producto.nombre}. Disponible: ${producto.stock}, solicitado: ${cantidad}.`
          });
        }
        await Producto.decrement('stock', { by: cantidad, where: { id: productoId }, transaction });
      }
    }

    await venta.update({
      ...req.body,
      subtotal: calculo.subtotal,
      iva: calculo.iva,
      descuentoValor: calculo.descuentoValor,
      descuentoJson: nextDescuento ? JSON.stringify(nextDescuento) : null,
      total: calculo.total,
      itemsJson: stringifyPayload({ ...nextPayload, total: calculo.total, descuento: nextDescuento })
    }, { transaction });

    await transaction.commit();
    const ventaActualizada = await Venta.findByPk(req.params.id);
    res.json({ success: true, data: serializeVenta(ventaActualizada) });
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const venta = await Venta.findByPk(req.params.id, { transaction });
    if (venta) {
      const payload = normalizeItemsPayload(venta.itemsJson);
      for (const item of payload.items) {
        await Producto.increment('stock', {
          by: getItemCantidad(item),
          where: { id: getItemProductoId(item) },
          transaction
        });
      }
    }
    await Venta.destroy({ where: { id: req.params.id }, transaction });
    await transaction.commit();
    res.json({ success: true });
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
};

exports.cambiarEstado = async (req, res, next) => {
  try {
    const { nuevoEstado, justificacion } = req.body;
    if (!nuevoEstado || !['ABIERTA', 'CERRADA'].includes(nuevoEstado)) {
      return res.status(400).json({ success: false, message: 'Estado invalido. Use ABIERTA o CERRADA.' });
    }

    const venta = await Venta.findByPk(req.params.id);
    if (!venta) return res.status(404).json({ success: false, message: 'Venta no encontrada.' });

    if (venta.estado === nuevoEstado) {
      return res.status(400).json({ success: false, message: `La venta ya esta en estado ${nuevoEstado}.` });
    }

    const body = { estado: nuevoEstado };
    if (venta.estado === 'CERRADA' && nuevoEstado === 'ABIERTA') {
      body.usuarioQuereCorrijo = req.user ? req.user.sub : null;
      body.fechaCorreccion = new Date();
      body.justificacionCorreccion = justificacion || 'Sin justificacion';
      body.ventaOriginalJson = venta.itemsJson;
    }

    await venta.update(body);
    const ventaActualizada = await Venta.findByPk(req.params.id);
    res.json({ success: true, data: serializeVenta(ventaActualizada) });
  } catch (err) { next(err); }
};

exports.recalcularTotales = async (req, res, next) => {
  try {
    const venta = await Venta.findByPk(req.params.id);
    if (!venta) return res.status(404).json({ success: false, message: 'Venta no encontrada.' });

    const payload = normalizeItemsPayload(venta.itemsJson);
    const descuento = parseDescuento(venta.descuentoJson);
    const calculo = calcularTotales(payload.items, descuento);
    await venta.update({
      subtotal: calculo.subtotal,
      iva: calculo.iva,
      descuentoValor: calculo.descuentoValor,
      total: calculo.total,
      itemsJson: stringifyPayload({ ...payload, total: calculo.total, descuento })
    });

    const ventaActualizada = await Venta.findByPk(req.params.id);
    res.json({ success: true, data: serializeVenta(ventaActualizada), calculo });
  } catch (err) { next(err); }
};

exports.crearReembolso = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const venta = await Venta.findByPk(req.params.id, { transaction });
    if (!venta) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Venta no encontrada.' });
    }

    const ventaPayload = normalizeItemsPayload(venta.itemsJson);
    const requestedItems = normalizeItemsPayload(req.body.itemsJson || req.body.items || []).items;
    const items = req.body.tipo === 'TOTAL' ? ventaPayload.items : requestedItems;

    if (!items.length) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Seleccione al menos un producto para reembolsar.' });
    }

    const normalizedRefundItems = [];
    for (const item of items) {
      const productoId = getItemProductoId(item);
      const cantidad = getItemCantidad(item);
      const original = ventaPayload.items.find((vItem) => getItemProductoId(vItem) === productoId);
      if (!original) {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: `El producto ${productoId} no pertenece a la venta.` });
      }
      if (cantidad <= 0 || cantidad > getItemCantidad(original)) {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: `Cantidad invalida para ${original.name || original.nombre}.` });
      }
      normalizedRefundItems.push({
        productoId,
        nombre: original.nombre || original.name,
        cantidad,
        precio: getItemPrecio(original)
      });
    }

    const subtotalReembolso = normalizedRefundItems.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    const ratio = Number(venta.subtotal || 0) > 0 ? subtotalReembolso / Number(venta.subtotal) : 0;
    const descuentoProporcional = Number(venta.descuentoValor || 0) * ratio;
    const base = Math.max(0, subtotalReembolso - descuentoProporcional);
    const totalReembolso = base * 1.19;
    const retornaInventario = req.body.retornaInventario === true;

    const reembolso = await Reembolso.create({
      ventaId: venta.id,
      tipo: req.body.tipo === 'TOTAL' ? 'TOTAL' : 'PARCIAL',
      total: totalReembolso,
      retornaInventario,
      motivo: req.body.motivo || '',
      itemsJson: JSON.stringify(normalizedRefundItems)
    }, { transaction });

    if (retornaInventario) {
      for (const item of normalizedRefundItems) {
        await Producto.increment('stock', { by: item.cantidad, where: { id: item.productoId }, transaction });
      }
    }

    await transaction.commit();
    res.json({
      success: true,
      data: {
        ...reembolso.toJSON(),
        itemsJson: normalizedRefundItems
      }
    });
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
};

exports.listarReembolsos = async (req, res, next) => {
  try {
    const where = req.params.id ? { ventaId: req.params.id } : {};
    const reembolsos = await Reembolso.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json({
      success: true,
      data: reembolsos.map((r) => ({ ...r.toJSON(), itemsJson: parseItemsJson(r.itemsJson) }))
    });
  } catch (err) { next(err); }
};
