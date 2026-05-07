const express = require('express');
const ctrl = require('../controllers/productos.controller');
const { createRules, updateRules, handleValidationErrors } = require('../validators/producto.validator');
const router = express.Router();

router.get('/', ctrl.list);
router.post('/', createRules, handleValidationErrors, ctrl.create);
router.put('/:id', updateRules, handleValidationErrors, ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;