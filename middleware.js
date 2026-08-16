const { biblioSchema, reviewSchema, libroSchema } = require('./schemas.js');
const ExpressError = require('./utilities/expressError');
const Biblioteca = require('./modelos/biblioteca');
const Review = require('./modelos/reviews');
const Usuario = require('./modelos/usuario.js');
const biblioteca = require('./modelos/biblioteca');
const { Joi } = require('joi');

module.exports.estaLogueado = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'Tenés que estar registrado y logueado para eso');
    return res.redirect('/login');
  }
  next();
};

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

module.exports.esAutor = async (req, res, next) => {
  const { id } = req.params;
  const biblioteca = await Biblioteca.findById(id);
  if (!biblioteca) {
    req.flash('error', 'Biblioteca no encontrada');
    return res.redirect('/bibliotecas');
  }
  if (!req.user || !biblioteca.autor.equals(req.user._id)) {
    req.flash('error', 'No tienes autorización para realizar esa acción!!!');
    return res.redirect(`/bibliotecas/${id}`);
  }
  next();
};

module.exports.verificarEmail = async (req, res, next) => {
  if (!req.user || !req.user.isVerified) {
    req.flash(
      'error',
      'Por favor, verifica tu correo electrónico antes de continuar.'
    );
    return res.render('usuarios/esperaVerificacion', {
      title: 'Verificación Pendiente',
    });
  }
  next();
};

module.exports.esReviewAutor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.autor.equals(req.user._id)) {
    req.flash('error', 'No tienes autorización para realizar esa acción!!!');
    return res.redirect(`/bibliotecas/${id}`);
  }
  next();
};

module.exports.cuotaMiddleware = (req, res, next) => {
  next();
};

module.exports.validateBiblio = (req, res, next) => {
  console.log(req.body);

  if (!Array.isArray(req.body.biblioteca.redes)) {
    if (req.body.biblioteca.redes) {
      req.body.biblioteca.redes = [req.body.biblioteca.redes]; // Convierte a array
    } else {
      req.body.biblioteca.redes = [];
    }
  }
  // Redes sociales tienen valor de 'checked' por defecto (false) si no están seleccionadas
  req.body.biblioteca.redes.forEach((red) => {
    if (red.checked === undefined) {
      red.checked = false;
    } else {
      red.checked = red.checked === 'true';
    }
  });

  // Si la solicitud es un POST (creación), no debe haber `deleteImages`
  if (req.method === 'POST' && req.body.biblioteca.deleteImages) {
    return res
      .status(400)
      .send('"deleteImages" is not allowed during creation');
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    if (
      req.body.biblioteca.deleteImages &&
      !Array.isArray(req.body.biblioteca.deleteImages)
    ) {
      return res.status(400).send('deleteImages must be an array');
    }
  }

  // Validar que `deleteImages` sea un array de cadenas (ID de imágenes)
  if (req.body.biblioteca.deleteImages) {
    req.body.biblioteca.deleteImages = req.body.biblioteca.deleteImages.filter(
      (image) => image.trim() !== ''
    );

    if (
      !req.body.biblioteca.deleteImages.every((id) => typeof id === 'string')
    ) {
      return res
        .status(400)
        .send('deleteImages must contain only strings (public_ids)');
    }
  }

  const { error } = biblioSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    const msj = error.details.map((elem) => elem.message).join(',');
    throw new ExpressError(msj, 400);
  } else {
    next();
  }

  console.log('Datos recibidos:', req.body);
};

module.exports.validateLibro = (req, res, next) => {
  console.log(req.body);

  if (!req.body.libro) {
    throw new ExpressError('El libro no se ha proporcionado.', 400);
  }

  // Joi verification (server-side)
  const { error } = libroSchema.validate(req.body);

  if (error) {
    const msj = error.details.map((el) => el.message).join(', ');
    throw new ExpressError(msj, 400);
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msj = error.details.map((el) => el.message).join(',');
    throw new ExpressError(msj, 400);
  } else {
    next();
  }
};

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
