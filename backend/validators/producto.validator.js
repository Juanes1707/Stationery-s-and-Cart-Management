const { body, validationResult } = require('express-validator');

exports.createRules = [
  body('nombre')
    .isString().notEmpty()
    .withMessage('El nombre es obligatorio'),
  body('precio')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número mayor o igual a 0'),
  body('costo')
    .isFloat({ min: 0 })
    .withMessage('El costo debe ser un número mayor o igual a 0'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('El stock debe ser un número entero mayor o igual a 0'),
  body('categoria')
    .isString().notEmpty()
    .withMessage('La categoría es obligatoria'),
];

exports.updateRules = [
  body('nombre')
    .optional().isString().notEmpty()
    .withMessage('El nombre no puede estar vacío'),
  body('precio')
    .optional().isFloat({ min: 0 })
    .withMessage('El precio debe ser un número mayor o igual a 0'),
  body('costo')
    .optional().isFloat({ min: 0 })
    .withMessage('El costo debe ser un número mayor o igual a 0'),
  body('stock')
    .optional().isInt({ min: 0 })
    .withMessage('El stock debe ser un número entero mayor o igual a 0'),
];

exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};