const express = require('express');
const router = express.Router();
const Libro = require('../../modelos/libro');
const Biblioteca = require('../../modelos/biblioteca');
const catchAsync = require('../../utilities/catchAsync');
const { escapeRegex } = require('../../utilities/regexEscape');
const {
  apiEstaLogueado,
  apiVerificarEmail,
  apiEsAutor,
  apiValidateLibro,
} = require('../../middleware');

// GET /api/libros - General catalog with search (public)
router.get('/', catchAsync(async (req, res) => {
  const { titulo, autor, genero } = req.query;
  const isBusqueda = titulo || autor || genero;
  let query = {};

  if (isBusqueda) {
    if (titulo) query.titulo = { $regex: escapeRegex(titulo), $options: 'i' };
    if (autor) query.autor = { $regex: escapeRegex(autor), $options: 'i' };
    if (genero) query.genero = { $regex: escapeRegex(genero), $options: 'i' };
  }

  const libros = isBusqueda ? await Libro.find(query).populate('biblioteca') : [];
  res.json({ libros, isBusqueda });
}));

// GET /api/libros/:id - Get single book (public)
router.get('/:id', catchAsync(async (req, res) => {
  const libro = await Libro.findById(req.params.id).populate('biblioteca');
  if (!libro) {
    return res.status(404).json({ error: 'Libro no encontrado' });
  }
  res.json({ libro });
}));

// POST /api/libros/bibliotecas/:biblioId - Create book (auth + verified + author + validation)
router.post(
  '/bibliotecas/:biblioId',
  apiEstaLogueado,
  apiVerificarEmail,
  apiEsAutor,
  apiValidateLibro,
  catchAsync(async (req, res) => {
    const libro = new Libro(req.body.libro);
    libro.biblioteca = req.params.biblioId;
    await libro.save();

    req.biblioteca.catalogoLibros.push(libro._id);
    await req.biblioteca.save();

    res.json({ success: true, libro, flash: { success: ['Libro creado exitosamente'] } });
  })
);

// PUT /api/libros/bibliotecas/:biblioId/:libroId - Update book (auth + verified + author + validation)
router.put(
  '/bibliotecas/:biblioId/:libroId',
  apiEstaLogueado,
  apiVerificarEmail,
  apiEsAutor,
  apiValidateLibro,
  catchAsync(async (req, res) => {
    const libro = await Libro.findByIdAndUpdate(req.params.libroId, req.body.libro, { new: true });
    if (!libro) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }

    res.json({ success: true, libro, flash: { success: ['Libro actualizado exitosamente'] } });
  })
);

// DELETE /api/libros/bibliotecas/:biblioId/:libroId - Delete book (auth + verified + author)
router.delete(
  '/bibliotecas/:biblioId/:libroId',
  apiEstaLogueado,
  apiVerificarEmail,
  apiEsAutor,
  catchAsync(async (req, res) => {
    await Libro.findByIdAndDelete(req.params.libroId);
    await Biblioteca.findByIdAndUpdate(req.params.biblioId, {
      $pull: { catalogoLibros: req.params.libroId },
    });

    res.json({ success: true, flash: { success: ['Libro eliminado exitosamente'] } });
  })
);

module.exports = router;
