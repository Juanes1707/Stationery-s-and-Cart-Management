const express = require('express');
const { Producto } = require('../models');
const router = express.Router();

// GET - obtener todos
router.get('/', async (req, res, next) => {
  try {
    const data = await Producto.findAll();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST - crear nuevo
router.post('/', async (req, res, next) => {
  try {
    const nuevo = await Producto.create(req.body);
    res.json({ success: true, data: nuevo });
  } catch (err) { next(err); }
});

// PUT - editar por id
router.put('/:id', async (req, res, next) => {
  try {
    await Producto.update(req.body, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// DELETE - eliminar por id
router.delete('/:id', async (req, res, next) => {
  try {
    await Producto.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;