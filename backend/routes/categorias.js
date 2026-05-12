const express = require('express');
const ctrl = require('../controllers/categorias.controller');
const router = express.Router();

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;