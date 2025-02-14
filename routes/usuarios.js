const express = require('express');
const router = express.Router();
const passport = require('passport');
const { storeReturnTo } = require('../middleware');
const catchAsync = require('../utilities/catchAsync');
const Usuario = require('../modelos/usuario');
const usuarios = require('../controllers/usuarios');


// con router.route() usamos los path que se repiten y los agrupamos con sus distintos HTTP verbs
// esto nos sirve para no repetir routes ni confundirnos en el tipeo 
// no especificamos el path en cada HTTP verb, solo en route() 
router.route('/registro')
    .get(usuarios.registerForm)
    .post(catchAsync(usuarios.registro));

router.route('/login')
    .get(usuarios.renderLoginForm)
    // Authenticated login con passport 
    .post(storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), usuarios.login);

router.get('/logout', usuarios.logout);

// Ruta de verificación de correo
router.get('/verify/:token', catchAsync(usuarios.verifyEmail));

router.route('/contacto')
    .get(usuarios.contactoForm)
    .post(usuarios.contacto);

module.exports = router;