const express = require('express');
const { Venta } = require('../models');
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

router.get('/', async (req, res, next) => {
  try {
    const data = await Venta.findAll();
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
    const body = {
      ...req.body,
      // Serializar el array de items antes de guardar
      itemsJson: stringifyItemsJson(req.body.itemsJson)
    };
    const nueva = await Venta.create(body);
    res.json({ success: true, data: nueva });
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