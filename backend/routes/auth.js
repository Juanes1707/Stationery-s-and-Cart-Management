'use strict';

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/auth.controller');
const authJwt    = require('../middlewares/authJwt');

// POST /api/auth/login — PÚBLICA (no requiere token)
router.post('/login', controller.login);

// GET /api/auth/me — PROTEGIDA (requiere token válido)
router.get('/me', authJwt, controller.me);

// PUT /api/auth/profile — PROTEGIDA (cambiar username y/o contraseña)
router.put('/profile', authJwt, controller.updateProfile);

module.exports = router;
