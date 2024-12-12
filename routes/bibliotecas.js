const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const ExpressError = require('../utilities/expressError');
const Review = require('../modelos/reviews');
const Biblioteca = require('../modelos/biblioteca');
const bibliotecas = require('../controllers/biblioCont');
const libros = require('../controllers/libroCont');
const { cuotaMiddleware, estaLogueado, validateBiblio, validateLibro, esAutor, isVerified } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary/index');
const upload = multer({ storage });


// Rutas para bibliotecas
router.route('/')
    .get(catchAsync(bibliotecas.index))
    .post(estaLogueado, isVerified, upload.array('image', 10), cuotaMiddleware, validateBiblio, catchAsync(bibliotecas.crearBiblio)); 

router.get('/nueva', estaLogueado, isVerified, bibliotecas.nuevoForm);

router.get('/que-es', bibliotecas.queEs);
router.get('/requisitos', bibliotecas.requisitos);

router.route('/:id')
    .get(catchAsync(bibliotecas.biblioDetails))
    .put(estaLogueado, isVerified, esAutor, upload.array('image', 10), cuotaMiddleware, validateBiblio, catchAsync(bibliotecas.editarBiblio)) 
    .delete(estaLogueado, esAutor, isVerified, catchAsync(bibliotecas.borrarBiblio));

router.get('/:id/editar', estaLogueado, esAutor, isVerified, catchAsync(bibliotecas.editForm));


router.route('/:id/libros')
    .get(catchAsync(bibliotecas.librosPorBiblio))// // Ruta para mostrar libros en una biblioteca específica
    .post(estaLogueado, esAutor, isVerified, validateLibro, catchAsync(libros.crearLibro));// Rutas para crear, editar y borrar libros


// Ruta para mostrar el formulario para agregar un nuevo libro
router.get('/:id/libros/nuevo', estaLogueado, isVerified, catchAsync(libros.nuevoLibroForm));

router.get('/:id/libros/:libroId/editar', estaLogueado, isVerified, catchAsync(libros.editarLibroForm)); // Para mostrar el formulario

router.route('/:id/libros/:libroId')
    .get(catchAsync(libros.mostrarLibro))
    .put(estaLogueado, esAutor, isVerified, validateLibro, catchAsync(libros.editarLibro))
    .delete(estaLogueado, esAutor, isVerified, catchAsync(libros.borrarLibro));



module.exports = router;




