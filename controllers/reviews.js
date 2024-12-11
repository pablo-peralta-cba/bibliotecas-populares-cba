const Review = require('../modelos/reviews');
const Biblioteca = require('../modelos/biblioteca');

module.exports.crearReview = async (req, res) => {
    const biblioteca = await Biblioteca.findById(req.params.id);
    const review = new Review(req.body.review);
    review.autor = req.user._id;
    biblioteca.reviews.push(review);
    await review.save();
    await biblioteca.save();
    // console.log(review);
    req.flash('success', 'Has dejado un nuevo comentario');
    res.redirect(`/bibliotecas/${biblioteca._id}`);
};

module.exports.borrarReview = async (req, res) => {
    const { reviewId, id } = req.params;
    // como buscar un comentario especifico y sacarlo del array de reviews 
    await Biblioteca.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(req.params.reviewId)
    req.flash('success', 'Comentario eliminado');
    res.redirect(`/bibliotecas/${id}`);
};
