const express = require('express');
const router = express.Router();
const passport = require('passport');
const { storeReturnTo } = require('../middleware');
const catchAsync = require('../utilities/catchAsync');
const usuarios = require('../controllers/usuarios');

router
  .route('/registro')
  .get(usuarios.registerForm)
  .post(catchAsync(usuarios.registro));

router
  .route('/login')
  .get(usuarios.renderLoginForm)
  // Authenticated login con passport
  .post(
    storeReturnTo,
    passport.authenticate('local', {
      failureFlash: true,
      failureRedirect: '/login',
    }),
    usuarios.login
  );

router.get('/logout', usuarios.logout);

// Ruta de verificación de correo
router.get('/verify/:token', catchAsync(usuarios.verifyEmail));

router.route('/contacto').get(usuarios.contactoForm).post(usuarios.contacto);

module.exports = router;
