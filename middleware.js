const { biblioSchema, reviewSchema, libroSchema } = require('./schemas.js');
const ExpressError = require('./utilities/expressError');
const Biblioteca = require('./modelos/biblioteca');
const Review = require('./modelos/reviews');

// ==================== API Middleware (JSON responses) ====================

module.exports.apiEstaLogueado = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Tenés que estar logueado' });
  }
  next();
};

module.exports.apiVerificarEmail = (req, res, next) => {
  if (!req.user || !req.user.isVerified) {
    return res.status(403).json({
      error: 'Tu email no fue verificado. Revisa tu casilla de correo.',
    });
  }
  next();
};

module.exports.apiEsAutor = async (req, res, next) => {
  const { id } = req.params;
  const biblio = await Biblioteca.findById(id);
  if (!biblio) {
    return res.status(404).json({ error: 'Biblioteca no encontrada' });
  }
  if (!req.user || !biblio.autor.equals(req.user._id)) {
    return res.status(403).json({ error: 'No tenés permiso para esto' });
  }
  req.biblioteca = biblio;
  next();
};

module.exports.apiEsReviewAutor = async (req, res, next) => {
  const { reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review) {
    return res.status(404).json({ error: 'Review no encontrada' });
  }
  if (!req.user || !review.autor.equals(req.user._id)) {
    return res.status(403).json({ error: 'No tenés permiso para esto' });
  }
  req.review = review;
  next();
};

module.exports.apiValidateBiblio = (req, res, next) => {
  if (!req.body.biblioteca) {
    return res.status(400).json({ error: 'Falta el objeto biblioteca' });
  }

  if (!Array.isArray(req.body.biblioteca.redes)) {
    if (req.body.biblioteca.redes) {
      req.body.biblioteca.redes = [req.body.biblioteca.redes];
    } else {
      req.body.biblioteca.redes = [];
    }
  }

  req.body.biblioteca.redes.forEach((red) => {
    if (red.checked === undefined) {
      red.checked = false;
    } else {
      red.checked = red.checked === 'true' || red.checked === true;
    }
  });

  if (req.method === 'POST' && req.body.biblioteca.deleteImages) {
    return res.status(400).json({ error: '"deleteImages" no se permite en creación' });
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    if (req.body.biblioteca.deleteImages && !Array.isArray(req.body.biblioteca.deleteImages)) {
      return res.status(400).json({ error: 'deleteImages debe ser un array' });
    }
  }

  if (req.body.biblioteca.deleteImages) {
    req.body.biblioteca.deleteImages = req.body.biblioteca.deleteImages.filter((img) => img.trim() !== '');
    if (!req.body.biblioteca.deleteImages.every((id) => typeof id === 'string')) {
      return res.status(400).json({ error: 'deleteImages debe contener solo strings' });
    }
  }

  const { error } = biblioSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    const msj = error.details.map((el) => el.message).join(', ');
    return res.status(400).json({ error: msj });
  }
  next();
};

module.exports.apiValidateLibro = (req, res, next) => {
  if (!req.body.libro) {
    return res.status(400).json({ error: 'Falta el objeto libro' });
  }
  const { error } = libroSchema.validate(req.body);
  if (error) {
    const msj = error.details.map((el) => el.message).join(', ');
    return res.status(400).json({ error: msj });
  }
  next();
};

module.exports.apiValidateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msj = error.details.map((el) => el.message).join(', ');
    return res.status(400).json({ error: msj });
  }
  next();
};
