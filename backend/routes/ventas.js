const express = require('express');
const ventasController = require('../controllers/ventas.controller');
const router = express.Router();

router.get('/', ventasController.list);
router.post('/', ventasController.create);
router.put('/:id', ventasController.update);
router.delete('/:id', ventasController.remove);

router.patch('/:id/estado', ventasController.cambiarEstado);
router.post('/:id/recalcular-totales', ventasController.recalcularTotales);

router.get('/:id/reembolsos', ventasController.listarReembolsos);
router.post('/:id/reembolsos', ventasController.crearReembolso);

module.exports = router;
