"use strict";
const express     = require("express");
const { Producto } = require("../models");
const authJwt     = require("../middlewares/authJwt");
const requireRole = require("../middlewares/requireRole");
const router      = express.Router();

// GET - PUBLICO: cualquiera puede ver el catalogo
router.get("/", async (req, res, next) => {
  try {
    const data = await Producto.findAll();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST - ADMIN: solo el administrador puede crear productos
router.post("/", authJwt, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const nuevo = await Producto.create(req.body);
    res.json({ success: true, data: nuevo });
  } catch (err) { next(err); }
});

// PUT - ADMIN: solo el administrador puede editar productos
router.put("/:id", authJwt, requireRole("ADMIN"), async (req, res, next) => {
  try {
    await Producto.update(req.body, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// DELETE - ADMIN: solo el administrador puede eliminar productos
router.delete("/:id", authJwt, requireRole("ADMIN"), async (req, res, next) => {
  try {
    await Producto.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
