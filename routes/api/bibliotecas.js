const express = require('express');
const router = express.Router();
const multer = require('multer');
const Biblioteca = require('../../modelos/biblioteca');
const Libro = require('../../modelos/libro');
const catchAsync = require('../../utilities/catchAsync');
const { storage } = require('../../cloudinary/index');
const maptilerClient = require('@maptiler/client');
const {
  apiEstaLogueado,
  apiVerificarEmail,
  apiEsAutor,
  apiValidateBiblio,
} = require('../../middleware');
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

const upload = multer({ storage });

// GET /api/bibliotecas - List/search bibliotecas (public)
router.get('/', catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;
  const { nombre, localidad, codigoConabip } = req.query;

  const query = {};
  if (codigoConabip) {
    query.registroConabip = codigoConabip;
  } else {
    if (nombre) {
      query.nombre = { $regex: new RegExp(nombre, 'i') };
    }
    if (localidad) {
      query.localidad = { $regex: new RegExp(localidad, 'i') };
    }
  }

  const bibliotecas = await Biblioteca.find(query).skip(skip).limit(limit);
  const total = await Biblioteca.countDocuments(query);

  res.json({
    bibliotecas,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    nombre: nombre || '',
    localidad: localidad || '',
    codigoConabip: codigoConabip || ''
  });
}));

// POST /api/bibliotecas - Create biblioteca (auth + verified + validation)
router.post(
  '/',
  apiEstaLogueado,
  apiVerificarEmail,
  upload.array('image', 10),
  apiValidateBiblio,
  catchAsync(async (req, res) => {
    const data = req.body.biblioteca || {};
    const biblioteca = new Biblioteca(data);

    if (data.geometry?.coordinates) {
      biblioteca.geometry = {
        type: 'Point',
        coordinates: data.geometry.coordinates,
      };
    } else if (data.localidad) {
      const geoData = await maptilerClient.geocoding.forward(data.localidad, { limit: 1 });
      if (geoData.features.length) {
        biblioteca.geometry = geoData.features[0].geometry;
      }
    }

    if (data.redes && Array.isArray(data.redes)) {
      biblioteca.redes = data.redes
        .filter(r => r.nombre && r.checked)
        .map(r => ({ nombre: r.nombre, checked: true, link: r.link || '' }));
    }

    if (req.files?.length) {
      biblioteca.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    }

    biblioteca.autor = req.user._id;
    await biblioteca.save();

    res.json({
      success: true,
      biblioteca,
      flash: { success: ['Biblioteca creada exitosamente'] }
    });
  })
);

// GET /api/bibliotecas/:id - Get single biblioteca (public)
router.get('/:id', catchAsync(async (req, res) => {
  const biblioteca = await Biblioteca.findById(req.params.id)
    .populate({ path: 'reviews', populate: { path: 'autor' } })
    .populate({ path: 'catalogoLibros', model: 'Libro' })
    .populate('autor', 'username');

  if (!biblioteca) {
    return res.status(404).json({ error: 'Biblioteca no encontrada' });
  }

  const redes = biblioteca.redes.map((red) => ({
    nombre: red.nombre,
    checked: red.checked || false,
    link: red.link || '',
  }));

  res.json({ biblioteca, redes });
}));

// PUT /api/bibliotecas/:id - Update biblioteca (auth + author + validation)
router.put(
  '/:id',
  apiEstaLogueado,
  apiVerificarEmail,
  apiEsAutor,
  upload.array('image', 10),
  apiValidateBiblio,
  catchAsync(async (req, res) => {
    const data = req.body.biblioteca || {};
    Object.assign(req.biblioteca, data);

    if (data.geometry?.coordinates) {
      req.biblioteca.geometry = {
        type: 'Point',
        coordinates: data.geometry.coordinates,
      };
    } else if (data.localidad) {
      const geoData = await maptilerClient.geocoding.forward(data.localidad, { limit: 1 });
      if (geoData.features.length) {
        req.biblioteca.geometry = geoData.features[0].geometry;
      }
    }

    if (data.redes && Array.isArray(data.redes)) {
      req.biblioteca.redes = data.redes
        .filter(r => r.nombre && r.checked)
        .map(r => ({ nombre: r.nombre, checked: true, link: r.link || '' }));
    }

    if (req.files?.length) {
      const newImages = req.files.map(f => ({ url: f.path, filename: f.filename }));
      req.biblioteca.images.push(...newImages);
    }

    if (req.body.deleteImages?.length) {
      const { cloudinary } = require('../../cloudinary');
      for (const filename of req.body.deleteImages) {
        await cloudinary.uploader.destroy(filename);
      }
      await req.biblioteca.updateOne({
        $pull: { images: { filename: { $in: req.body.deleteImages } } },
      });
    }

    await req.biblioteca.save();

    res.json({
      success: true,
      biblioteca: req.biblioteca,
      flash: { success: ['Biblioteca editada exitosamente'] }
    });
  })
);

// DELETE /api/bibliotecas/:id - Delete biblioteca (auth + author)
router.delete(
  '/:id',
  apiEstaLogueado,
  apiEsAutor,
  catchAsync(async (req, res) => {
    await Biblioteca.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      flash: { success: ['Biblioteca eliminada exitosamente'] }
    });
  })
);

// GET /api/bibliotecas/:id/libros - Books for biblioteca (public)
router.get('/:id/libros', catchAsync(async (req, res) => {
  const { id } = req.params;
  const { titulo, autor, genero } = req.query;
  const biblioteca = await Biblioteca.findById(id).populate('catalogoLibros');
  if (!biblioteca) {
    return res.status(404).json({ error: 'Biblioteca no encontrada' });
  }

  let query = { biblioteca: id };
  if (titulo) query.titulo = { $regex: titulo, $options: 'i' };
  if (autor) query.autor = { $regex: autor, $options: 'i' };
  if (genero) query.genero = { $regex: genero, $options: 'i' };

  const isBusqueda = titulo || autor || genero;
  let libros = [];
  if (isBusqueda) {
    libros = await Libro.find(query);
  } else {
    libros = biblioteca.catalogoLibros;
  }

  res.json({ biblioteca, libros, isBusqueda });
}));

module.exports = router;
