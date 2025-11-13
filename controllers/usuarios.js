const Usuario = require('../modelos/usuario');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
// Generar un token único
function generarTokenVerificacion() {
  return crypto.randomBytes(20).toString('hex');
}

// Verificación del correo
module.exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const usuario = await Usuario.findOne({ verificationToken: token });

    if (!usuario) {
      req.flash('error', 'Token de verificación inválido o expirado.');
      return res.redirect('/login');
    }
    usuario.isVerified = true;
    usuario.verificationToken = null;
    await usuario.save();
    req.flash(
      'success',
      'Tu cuenta ha sido verificada exitosamente. ¡Ya puedes iniciar sesión!'
    );
    res.redirect('/login');
  } catch (err) {
    req.flash(
      'error',
      'Hubo un problema al verificar tu cuenta. Intenta nuevamente.'
    );
    res.redirect('/login');
  }
};

module.exports.registerForm = (req, res) => {
  res.render('usuarios/registro', { title: 'Nuevo Usuario' });
};

module.exports.registro = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const usuario = new Usuario({ email, username, isVerified: false });
    const registroUsuario = await Usuario.register(usuario, password);
    console.log(registroUsuario);

    const token = generarTokenVerificacion();
    usuario.verificationToken = token;
    await usuario.save();
    const verificationUrl = `${process.env.SITE_URL.replace(
      /\/$/,
      ''
    )}/verify/${token}`;

    // Configurar el correo
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verifica tu correo electrónico',
      text: `Por favor, haz clic en el siguiente enlace para verificar tu cuenta: ${verificationUrl}`,
      html: `<p>Por favor, haz clic en el siguiente enlace para verificar tu cuenta: <a href="${verificationUrl}">Verificar cuenta</a></p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error al enviar el correo de verificación: ', error);
        return res
          .status(500)
          .send('Error al enviar el correo de verificación');
      }
      console.log('Correo de verificación enviado: ' + info.response);
      res.render('usuarios/esperaVerificacion', {
        title: 'Verificación Pendiente',
      });
    });
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/registro');
  }
};

module.exports.contactoForm = (req, res) => {
  res.render('usuarios/contacto', { title: 'Contacto' });
};

module.exports.contacto = async (req, res, next) => {
  const { nombre, email, mensaje } = req.body;

  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER,
    subject: `Nuevo mensaje de ${nombre}`,
    text: `Has recibido un nuevo mensaje de ${nombre} (${email}):\n\n${mensaje}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error.stack);
      console.log(error.message);
      return res.status(500).send('Error al enviar el correo.');
    }
    req.flash('success', '¡Correo enviado con éxito!');
    console.log(info.response);
    res.redirect('/bibliotecas');
  });
};

module.exports.renderLoginForm = (req, res) => {
  res.render('usuarios/login', { title: 'Login Usuario' });
};

module.exports.login = (req, res) => {
  req.flash('success', 'Bienvenido de nuevo a Bibliotecas Populares Córdoba');
  const redirectUrl = res.locals.returnTo || '/bibliotecas';
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash('success', 'Nos vemos!');
    res.redirect('/bibliotecas');
  });
};
