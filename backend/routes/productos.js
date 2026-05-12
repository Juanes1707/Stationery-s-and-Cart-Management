const express = require('express');
const { Op } = require('sequelize');
const { Producto } = require('../models');
const router = express.Router();

function normalizeProductPayload(body = {}) {
  const normalized = {
    nombre: String(body.nombre ?? body.name ?? '').trim(),
    categoria: String(body.categoria ?? body.category ?? '').trim(),
    precio: Number(body.precio ?? body.price ?? 0),
    costo: Number(body.costo ?? body.cost ?? 0),
    codigo: String(body.codigo ?? body.code ?? '').trim(),
    stock: Number.parseInt(body.stock ?? 0, 10),
    seguimientoInventario: body.seguimientoInventario ?? body.tracking ?? true,
    imagen: String(body.imagen ?? body.image ?? '').trim(),
    descripcion: String(body.descripcion ?? body.description ?? '').trim(),
  };

  normalized.seguimientoInventario =
    normalized.seguimientoInventario === true ||
    normalized.seguimientoInventario === 'true' ||
    normalized.seguimientoInventario === 1 ||
    normalized.seguimientoInventario === '1';

  return normalized;
}

function validateProductPayload(data) {
  if (!data.nombre) return 'El nombre del producto es obligatorio.';
  if (!data.categoria) return 'La categoria es obligatoria.';
  if (!Number.isFinite(data.precio) || data.precio < 0) return 'El precio debe ser mayor o igual a cero.';
  if (!Number.isFinite(data.costo) || data.costo < 0) return 'El costo debe ser mayor o igual a cero.';
  if (!Number.isInteger(data.stock) || data.stock < 0) return 'El stock debe ser un entero mayor o igual a cero.';
  return null;
}

// GET - obtener todos con busqueda y orden estable para POS
router.get('/', async (req, res, next) => {
  try {
    const { q, categoria, bajoStock } = req.query;
    const where = {};

    if (q) {
      const term = `%${q.trim()}%`;
      where[Op.or] = [
        { nombre: { [Op.like]: term } },
        { codigo: { [Op.like]: term } },
        { categoria: { [Op.like]: term } },
      ];
    }

    if (categoria && categoria !== 'todos') where.categoria = categoria;
    if (bajoStock === 'true') where.stock = { [Op.lte]: 5 };

    const data = await Producto.findAll({
      where,
      order: [
        ['categoria', 'ASC'],
        ['nombre', 'ASC'],
      ],
    });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST - crear nuevo
router.post('/', async (req, res, next) => {
  try {
    const payload = normalizeProductPayload(req.body);
    const error = validateProductPayload(payload);
    if (error) return res.status(400).json({ success: false, message: error });

    const nuevo = await Producto.create(payload);
    res.json({ success: true, data: nuevo });
  } catch (err) { next(err); }
});

// PUT - editar por id
router.put('/:id', async (req, res, next) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) return res.status(404).json({ success: false, message: 'Producto no encontrado.' });

    const payload = normalizeProductPayload({ ...producto.toJSON(), ...req.body });
    const error = validateProductPayload(payload);
    if (error) return res.status(400).json({ success: false, message: error });

    await producto.update(payload);
    res.json({ success: true, data: producto });
  } catch (err) { next(err); }
});

// DELETE - eliminar por id
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await Producto.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
