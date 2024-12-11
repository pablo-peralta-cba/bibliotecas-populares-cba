const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const ExpressError = require('../utilities/expressError');
const infor = require('../controllers/infoCont')
// const Review = require('../modelos/reviews');
// const Biblioteca = require('../modelos/biblioteca');
// const bibliotecas = require('../controllers/biblioCont');
// const libros = require('../controllers/libroCont');
// const { estaLogueado, validateBiblio, validateLibro, esAutor } = require('../middleware');
// const multer = require('multer');
// const { storage } = require('../cloudinary/index');
// const upload = multer({ storage });

router.route('/legislacion')
    .get(catchAsync(infor.legis));



module.exports = router;

