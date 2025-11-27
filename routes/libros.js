const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const libros = require('../controllers/libroCont');

// Ruta para mostrar el catálogo de libros (catálogo general)
router.get('/', catchAsync(libros.index));

router.get('/buscar', catchAsync(libros.buscarLibros));

router.get('/:id', catchAsync(libros.mostrarLibro));

module.exports = router;
