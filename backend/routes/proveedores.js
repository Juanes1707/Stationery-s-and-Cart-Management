const express = require('express');
const { Proveedor } = require('../models');
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const data = await Proveedor.findAll();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const nuevo = await Proveedor.create(req.body);
    res.json({ success: true, data: nuevo });
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    await Proveedor.update(req.body, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Proveedor.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;