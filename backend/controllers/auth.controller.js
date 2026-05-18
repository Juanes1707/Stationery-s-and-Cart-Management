'use strict';

const jwt    = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Usuario } = require('../models');

// ── POST /api/auth/login ──────────────────────────────────────
// Ruta pública. Valida credenciales y devuelve un JWT.
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validar que vengan los dos campos
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Los campos username y password son obligatorios.',
      });
    }

    // Buscar el usuario en la base de datos
    const usuario = await Usuario.findOne({ where: { username } });

    // Si no existe o está desactivado → 401 (mismo mensaje para no revelar si existe)
    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas.',
      });
    }

    // bcrypt.compare compara el texto plano con el hash guardado
    // Nunca se guarda ni se transmite la contraseña real
    const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
    if (!passwordValida) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas.',
      });
    }

    // Construir el payload del JWT
    // sub = subject (estándar JWT) → id del usuario
    const payload = {
      sub:      usuario.id,
      username: usuario.username,
      role:     usuario.role,
    };

    // Firmar el token con la clave secreta y la expiración del .env
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });

    return res.json({
      success: true,
      token,
      user: {
        id:       usuario.id,
        username: usuario.username,
        role:     usuario.role,
        nombre:   usuario.nombre,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────
// Ruta protegida. Devuelve los datos del usuario autenticado.
// authJwt ya verificó el token y guardó el payload en req.user.
exports.me = (req, res) => {
  res.json({
    success: true,
    user: {
      sub:      req.user.sub,
      username: req.user.username,
      role:     req.user.role,
    },
  });
};

// ── PUT /api/auth/profile ─────────────────────────────────────
// Ruta protegida. Permite cambiar username y/o contraseña.
// Requiere la contraseña actual para confirmar la identidad.
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { currentPassword, newUsername, newPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña actual es obligatoria.',
      });
    }

    const trimmedUsername = newUsername ? newUsername.trim() : '';
    const trimmedPassword = newPassword ? newPassword.trim() : '';

    if (!trimmedUsername && !trimmedPassword) {
      return res.status(400).json({
        success: false,
        message: 'Debes proporcionar un nuevo usuario o una nueva contraseña.',
      });
    }

    const usuario = await Usuario.findByPk(userId);
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    // Verificar contraseña actual antes de cualquier cambio
    const passwordValida = await bcrypt.compare(currentPassword, usuario.passwordHash);
    if (!passwordValida) {
      return res.status(401).json({
        success: false,
        message: 'La contraseña actual es incorrecta.',
      });
    }

    // Cambiar username si se proporcionó uno diferente
    if (trimmedUsername && trimmedUsername !== usuario.username) {
      const existe = await Usuario.findOne({ where: { username: trimmedUsername } });
      if (existe) {
        return res.status(409).json({
          success: false,
          message: 'Ese nombre de usuario ya está en uso.',
        });
      }
      usuario.username = trimmedUsername;
    }

    // Cambiar contraseña si se proporcionó
    if (trimmedPassword) {
      if (trimmedPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'La nueva contraseña debe tener al menos 6 caracteres.',
        });
      }
      usuario.passwordHash = await bcrypt.hash(trimmedPassword, 12);
    }

    await usuario.save();

    // Emitir un nuevo token con el username actualizado
    const payload = { sub: usuario.id, username: usuario.username, role: usuario.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });

    return res.json({
      success: true,
      message: 'Perfil actualizado correctamente.',
      token,
      user: {
        id:       usuario.id,
        username: usuario.username,
        role:     usuario.role,
        nombre:   usuario.nombre,
      },
    });
  } catch (err) {
    next(err);
  }
};
