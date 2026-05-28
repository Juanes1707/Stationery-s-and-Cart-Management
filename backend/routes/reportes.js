const express = require('express');
const controller = require('../controllers/reportes.controller');
const router = express.Router();

router.get('/basicos', controller.basicos);

module.exports = router;
