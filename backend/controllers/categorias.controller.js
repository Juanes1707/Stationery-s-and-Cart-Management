const { Categoria } = require('../models');

exports.list = async (req, res, next) => {
  try {
    const data = await Categoria.findAll();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const nuevo = await Categoria.create(req.body);
    res.json({ success: true, data: nuevo });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    await Categoria.update(req.body, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await Categoria.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
};