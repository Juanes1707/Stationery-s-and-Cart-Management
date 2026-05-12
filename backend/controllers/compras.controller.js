const { Compra } = require('../models');

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
    const body = {
      ...req.body,
      itemsJson: stringifyItemsJson(req.body.itemsJson)
    };
    const nueva = await Compra.create(body);
    res.json({ success: true, data: nueva });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
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
    await Compra.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
};