const express = require('express');
const controller = require('../controllers/descuentos.controller');
const requireRole = require('../middlewares/requireRole');
const router = express.Router();

router.get('/', controller.list);
router.post('/', requireRole('ADMIN'), controller.create);
router.put('/:id', requireRole('ADMIN'), controller.update);
router.delete('/:id', requireRole('ADMIN'), controller.remove);

module.exports = router;
