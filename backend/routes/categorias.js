const express = require('express');
const { Categoria } = require('../models');
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const data = await Categoria.findAll();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const nuevo = await Categoria.create(req.body);
    res.json({ success: true, data: nuevo });
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    await Categoria.update(req.body, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Categoria.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;