const { Op } = require('sequelize');
const { Faltante } = require('../models');

function buildWhere(query) {
  const where = {};
  if (query.tipo) where.tipo = query.tipo;
  if (query.proveedor) where.proveedor = { [Op.like]: `%${query.proveedor}%` };
  if (query.resuelto === 'true') where.resuelto = true;
  if (query.resuelto === 'false') where.resuelto = false;
  return where;
}

exports.list = async (req, res, next) => {
  try {
    const data = await Faltante.findAll({
      where: buildWhere(req.query),
      order: [['resuelto', 'ASC'], ['createdAt', 'DESC']]
    });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const nombreProducto = String(req.body.nombreProducto || '').trim();
    const tipo = String(req.body.tipo || '').toUpperCase();
    if (!nombreProducto) return res.status(400).json({ success: false, message: 'El producto faltante es obligatorio.' });
    if (!['NO_EXISTE', 'AGOTADO'].includes(tipo)) {
      return res.status(400).json({ success: false, message: 'El tipo debe ser NO_EXISTE o AGOTADO.' });
    }

    const nuevo = await Faltante.create({
      productoId: req.body.productoId || null,
      nombreProducto,
      tipo,
      proveedor: req.body.proveedor || '',
      cantidadSolicitada: Math.max(1, Number(req.body.cantidadSolicitada || 1)),
      cliente: req.body.cliente || '',
      notas: req.body.notas || '',
      resuelto: false
    });
    res.json({ success: true, data: nuevo });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const faltante = await Faltante.findByPk(req.params.id);
    if (!faltante) return res.status(404).json({ success: false, message: 'Faltante no encontrado.' });

    const resuelto = req.body.resuelto === true ? true : req.body.resuelto === false ? false : faltante.resuelto;
    await faltante.update({
      ...req.body,
      resuelto,
      fechaResolucion: resuelto && !faltante.resuelto ? new Date() : req.body.fechaResolucion ?? faltante.fechaResolucion
    });
    res.json({ success: true, data: faltante });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await Faltante.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
};
