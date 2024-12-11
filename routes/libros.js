const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const libros = require('../controllers/libroCont');
const Libro = require('../modelos/libro');
const { validateLibro, esAutor, estaLogueado } = require('../middleware');


// Ruta para mostrar el catálogo de libros (catálogo general)
router.get('/', catchAsync(libros.index));


router.get('/buscar', catchAsync(libros.buscarLibros)); //busqueda de libros



// // Ruta para mostrar detalles de un libro específico
router.get('/:id', catchAsync(libros.mostrarLibro));

// Rutas para libros vinculados a bibliotecas
// router.get('/biblioteca/:id', catchAsync(libros.librosPorBiblio)); // Mostrar libros de una biblioteca



module.exports = router;

