const { Descuento } = require('../models');

function validate(body) {
  const nombre = String(body.nombre || '').trim();
  const tipo = String(body.tipo || '').toUpperCase();
  const valor = Number(body.valor || 0);

  if (!nombre) return 'El nombre del descuento es obligatorio.';
  if (!['PORCENTAJE', 'FIJO'].includes(tipo)) return 'El tipo debe ser PORCENTAJE o FIJO.';
  if (valor <= 0) return 'El valor del descuento debe ser mayor a cero.';
  if (tipo === 'PORCENTAJE' && valor > 100) return 'El descuento porcentual no puede superar 100%.';
  return null;
}

exports.list = async (req, res, next) => {
  try {
    const where = req.query.activo === 'true' ? { activo: true } : {};
    const data = await Descuento.findAll({ where, order: [['activo', 'DESC'], ['nombre', 'ASC']] });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const error = validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error });

    const nuevo = await Descuento.create({
      nombre: req.body.nombre.trim(),
      tipo: req.body.tipo.toUpperCase(),
      valor: Number(req.body.valor),
      activo: req.body.activo !== false
    });
    res.json({ success: true, data: nuevo });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const descuento = await Descuento.findByPk(req.params.id);
    if (!descuento) return res.status(404).json({ success: false, message: 'Descuento no encontrado.' });

    const body = { ...descuento.toJSON(), ...req.body };
    const error = validate(body);
    if (error) return res.status(400).json({ success: false, message: error });

    await descuento.update({
      nombre: body.nombre.trim(),
      tipo: body.tipo.toUpperCase(),
      valor: Number(body.valor),
      activo: body.activo !== false
    });
    res.json({ success: true, data: descuento });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await Descuento.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
};
