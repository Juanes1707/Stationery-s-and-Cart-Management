const express = require('express');
const { Compra } = require('../models');
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const data = await Compra.findAll();
    const parsed = data.map(c => ({
      ...c.toJSON(),
      itemsJson: JSON.parse(c.itemsJson || '[]')
    }));
    res.json({ success: true, data: parsed });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const body = {
      ...req.body,
      itemsJson: JSON.stringify(req.body.itemsJson || [])
    };
    const nueva = await Compra.create(body);
    res.json({ success: true, data: nueva });
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const body = {
      ...req.body,
      itemsJson: JSON.stringify(req.body.itemsJson || [])
    };
    await Compra.update(body, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Compra.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;