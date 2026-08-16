const express = require('express');
const router = express.Router({ mergeParams: true });
const Review = require('../../modelos/reviews');
const Biblioteca = require('../../modelos/biblioteca');
const catchAsync = require('../../utilities/catchAsync');
const {
  apiEstaLogueado,
  apiVerificarEmail,
  apiEsReviewAutor,
  apiValidateReview,
} = require('../../middleware');

// POST /api/bibliotecas/:id/reviews - Create review (auth + verified + validation)
router.post(
  '/',
  apiEstaLogueado,
  apiVerificarEmail,
  apiValidateReview,
  catchAsync(async (req, res) => {
    const biblioteca = await Biblioteca.findById(req.params.id);
    if (!biblioteca) {
      return res.status(404).json({ error: 'Biblioteca no encontrada' });
    }

    const review = new Review(req.body.review);
    review.autor = req.user._id;
    biblioteca.reviews.push(review);
    await review.save();
    await biblioteca.save();

    res.json({
      success: true,
      flash: { success: ['Has dejado un nuevo comentario'] }
    });
  })
);

// DELETE /api/bibliotecas/:id/reviews/:reviewId - Delete review (auth + author)
router.delete(
  '/:reviewId',
  apiEstaLogueado,
  apiEsReviewAutor,
  catchAsync(async (req, res) => {
    const { reviewId, id } = req.params;

    await Biblioteca.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    res.json({
      success: true,
      flash: { success: ['Comentario eliminado'] }
    });
  })
);

module.exports = router;
