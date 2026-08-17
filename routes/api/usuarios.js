const express = require('express');
const router = express.Router();
const passport = require('passport');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const Usuario = require('../../modelos/usuario');
const catchAsync = require('../../utilities/catchAsync');

// Rate limiters
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: { error: 'Demasiados intentos de registro. Intentá de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: { error: 'Demasiados intentos de login. Intentá de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: { error: 'Demasiados intentos. Intentá de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

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

// Equalizes response time across resend branches to prevent timing-based user enumeration
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// GET /api/auth/current-user
router.get('/auth/current-user', (req, res) => {
  if (req.user) {
    const user = req.user.toObject();
    delete user.verificationToken;
    delete user.verificationTokenExpiry;
    delete user.hash;
    delete user.salt;
    return res.json({ user });
  }
  res.json({ user: null });
});

// POST /api/auth/login
router.post('/auth/login', loginLimiter, (req, res, next) => {
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
      delete userObj.verificationTokenExpiry;
      delete userObj.hash;
      delete userObj.salt;
      return res.json({
        user: userObj,
        needsVerification: !user.isVerified,
        flash: { success: ['Bienvenido de nuevo a Bibliotecas Populares Córdoba'] }
      });
    });
  })(req, res, next);
});

// POST /api/auth/register
router.post('/auth/register', registerLimiter, catchAsync(async (req, res) => {
  try {
    // Honeypot check - bots will fill this hidden field
    if (req.body.website) {
      return res.status(400).json({ error: 'Error de registro' });
    }

    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const token = generarTokenVerificacion();
    const usuario = new Usuario({
      email,
      username,
      isVerified: false,
      verificationToken: token,
      verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });
    await Usuario.register(usuario, password);

    const verificationUrl = `${process.env.SITE_URL.replace(/\/$/, '')}/verify/${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verifica tu correo electrónico',
      text: `Por favor, haz clic en el siguiente enlace para verificar tu cuenta: ${verificationUrl}`,
      html: `<p>Por favor, haz clic en el siguiente enlace para verificar tu cuenta: <a href="${verificationUrl}">Verificar cuenta</a></p>`,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.json({
        success: true,
        flash: { success: ['Cuenta creada exitosamente. Revisa tu correo para verificar tu cuenta.'] }
      });
    } catch (emailError) {
      console.log('Error al enviar correo de verificación:', emailError.message);
      res.json({
        success: true,
        flash: { warning: ['Tu cuenta fue creada, pero no pudimos enviar el correo de verificación. Usá la opción de reenvío en la página siguiente.'] }
      });
    }
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
    return res.status(400).json({ error: 'Token de verificación inválido' });
  }

  // Check if token has expired
  if (usuario.verificationTokenExpiry && usuario.verificationTokenExpiry < new Date()) {
    return res.status(400).json({ error: 'Token de verificación expirado. Solicitá uno nuevo.' });
  }

  usuario.isVerified = true;
  usuario.verificationToken = null;
  usuario.verificationTokenExpiry = null;
  await usuario.save();

  res.json({
    success: true,
    flash: { success: ['Tu cuenta ha sido verificada exitosamente. ¡Ya puedes iniciar sesión!'] }
  });
}));

// POST /api/auth/resend-verification
router.post('/auth/resend-verification', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 requests per window
  message: { error: 'Demasiados intentos. Intentá de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
}), catchAsync(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'El email es requerido' });
  }

  // Generic response for all cases to prevent user enumeration
  const genericResponse = {
    success: true,
    flash: { success: ['Si el email está registrado y no está verificado, recibirás un correo de verificación.'] }
  };

  const usuario = await Usuario.findOne({ email });
  if (!usuario || usuario.isVerified) {
    // Don't reveal if user exists or is already verified. Keep a similar response
    // time to the real path to prevent timing-based user enumeration.
    await delay(300);
    return res.json(genericResponse);
  }

  // Generate new token
  const token = generarTokenVerificacion();
  usuario.verificationToken = token;
  usuario.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  await usuario.save();

  const verificationUrl = `${process.env.SITE_URL.replace(/\/$/, '')}/verify/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verifica tu correo electrónico',
    text: `Por favor, haz clic en el siguiente enlace para verificar tu cuenta: ${verificationUrl}`,
    html: `<p>Por favor, haz clic en el siguiente enlace para verificar tu cuenta: <a href="${verificationUrl}">Verificar cuenta</a></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (emailError) {
    console.log('Error al enviar correo de verificación:', emailError.message);
  }

  res.json(genericResponse);
}));

// POST /api/contacto
router.post('/contacto', contactLimiter, catchAsync(async (req, res) => {
  // Honeypot check - bots will fill this hidden field
  if (req.body.website) {
    return res.status(400).json({ error: 'Error al enviar el mensaje' });
  }

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

  try {
    await transporter.sendMail(mailOptions);
    res.json({
      success: true,
      flash: { success: ['¡Correo enviado con éxito!'] }
    });
  } catch (error) {
    console.error('Error al enviar correo:', error.message);
    return res.status(500).json({ error: 'Error al enviar el correo' });
  }
}));

module.exports = router;
