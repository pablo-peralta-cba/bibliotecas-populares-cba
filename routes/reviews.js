const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utilities/catchAsync');
const ExpressError = require('../utilities/expressError');
const Review = require('../modelos/reviews');
const Biblioteca = require('../modelos/biblioteca');
const { reviewSchema } = require('../schemas.js');
const { verificarEmail, validateReview, estaLogueado, esReviewAutor } = require('../middleware');
const reviews = require('../controllers/reviews');


router.post('/',  verificarEmail, estaLogueado, validateReview, catchAsync(reviews.crearReview));

router.delete('/:reviewId', estaLogueado, esReviewAutor, catchAsync(reviews.borrarReview));

module.exports = router;