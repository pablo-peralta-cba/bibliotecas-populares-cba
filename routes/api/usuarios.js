const express = require('express');
const router = express.Router();
const passport = require('passport');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Usuario = require('../../modelos/usuario');
const catchAsync = require('../../utilities/catchAsync');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function generarTokenVerificacion() {
  return crypto.randomBytes(20).toString('hex');
}

// GET /api/auth/current-user
router.get('/auth/current-user', (req, res) => {
  if (req.user) {
    const user = req.user.toObject();
    delete user.verificationToken;
    delete user.hash;
    delete user.salt;
    return res.json({ user });
  }
  res.json({ user: null });
});

// POST /api/auth/login
router.post('/auth/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    if (!user) {
      return res.status(401).json({ error: info?.message || 'Credenciales inválidas' });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al iniciar sesión' });
      }
      const userObj = user.toObject();
      delete userObj.verificationToken;
      delete userObj.hash;
      delete userObj.salt;
      return res.json({
        user: userObj,
        flash: { success: ['Bienvenido de nuevo a Bibliotecas Populares Córdoba'] }
      });
    });
  })(req, res, next);
});

// POST /api/auth/register
router.post('/auth/register', catchAsync(async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    const usuario = new Usuario({ email, username, isVerified: false });
    await Usuario.register(usuario, password);

    const token = generarTokenVerificacion();
    usuario.verificationToken = token;
    await usuario.save();

    const verificationUrl = `${process.env.SITE_URL.replace(/\/$/, '')}/verify/${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verifica tu correo electrónico',
      text: `Por favor, haz clic en el siguiente enlace para verificar tu cuenta: ${verificationUrl}`,
      html: `<p>Por favor, haz clic en el siguiente enlace para verificar tu cuenta: <a href="${verificationUrl}">Verificar cuenta</a></p>`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.log('Error al enviar correo de verificación:', error.message);
      }
    });

    res.json({
      success: true,
      flash: { success: ['Cuenta creada exitosamente. Revisa tu correo para verificar tu cuenta.'] }
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Error al crear la cuenta' });
  }
}));

// GET /api/auth/logout
router.get('/auth/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error al cerrar sesión' });
    }
    res.json({ flash: { success: ['Nos vemos!'] } });
  });
});

// GET /api/auth/verify/:token
router.get('/auth/verify/:token', catchAsync(async (req, res) => {
  const { token } = req.params;
  const usuario = await Usuario.findOne({ verificationToken: token });

  if (!usuario) {
    return res.status(400).json({ error: 'Token de verificación inválido o expirado' });
  }

  usuario.isVerified = true;
  usuario.verificationToken = null;
  await usuario.save();

  res.json({
    success: true,
    flash: { success: ['Tu cuenta ha sido verificada exitosamente. ¡Ya puedes iniciar sesión!'] }
  });
}));

// POST /api/contacto
router.post('/contacto', catchAsync(async (req, res) => {
  const { nombre, email, mensaje } = req.body;
  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER,
    subject: `Nuevo mensaje de ${nombre}`,
    text: `Has recibido un nuevo mensaje de ${nombre} (${email}):\n\n${mensaje}`,
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.error('Error al enviar correo:', error.message);
      return res.status(500).json({ error: 'Error al enviar el correo' });
    }
    res.json({
      success: true,
      flash: { success: ['¡Correo enviado con éxito!'] }
    });
  });
}));

module.exports = router;
