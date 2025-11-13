const Biblioteca = require('../modelos/biblioteca');
const Libro = require('../modelos/libro');
const { cloudinary } = require('../cloudinary');
const maptilerClient = require('@maptiler/client');
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req, res) => {
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

  if (bibliotecas.length === 0) {
    req.flash('error', 'No se encontraron bibliotecas con esos datos');
    return res.redirect('/bibliotecas');
  }

  res.render('bibliotecas/index', {
    title: 'Todas las bibliotecas',
    bibliotecas,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    nombre,
    localidad,
    codigoConabip,
  });
};

module.exports.queEs = (req, res) => {
  res.render('bibliotecas/que-es', { title: 'Qué es una biblioteca popular' });
};

module.exports.requisitos = (req, res) => {
  res.render('bibliotecas/requisitos', {
    title: 'Requisitos para formar una biblioteca popular',
  });
};

module.exports.nuevoForm = (req, res) => {
  // Enviar un objeto vacío de biblioteca para evitar el error
  res.render('bibliotecas/nueva', {
    title: 'Cargar nueva biblioteca',
    biblioteca: { images: [] },
  });
};
module.exports.crearBiblio = async (req, res, next) => {
  const biblioteca = new Biblioteca(req.body.biblioteca);

  if (
    req.body.biblioteca.geometry &&
    req.body.biblioteca.geometry.coordinates
  ) {
    biblioteca.geometry = {
      type: 'Point',
      coordinates: [
        req.body.biblioteca.geometry.coordinates[0], // Longitud
        req.body.biblioteca.geometry.coordinates[1], // Latitud
      ],
    };
  } else {
    // Si no hay coordenadas, utiliza geocodificación
    const geoData = await maptilerClient.geocoding.forward(
      req.body.biblioteca.localidad,
      { limit: 1 }
    );
    if (!geoData.features.length) {
      req.flash('error', 'Localidad no encontrada.');
      return res.redirect('/bibliotecas');
    }
    biblioteca.geometry = geoData.features[0].geometry;
  }
  const cuota = req.body.biblioteca.cuota;

  if (req.body.catalogoLibros && Array.isArray(req.body.catalogoLibros)) {
    const librosIds = [];
    for (const libroData of req.body.catalogoLibros) {
      const libro = new Libro(libroData);
      await libro.save();
      librosIds.push(libro._id);
    }
    biblioteca.catalogoLibros = librosIds;
  } else {
    biblioteca.catalogoLibros = [];
  }

  const redes = req.body.biblioteca.redes || [];
  biblioteca.redes = redes
    .map((red) => ({
      nombre: red.nombre,
      checked: red.checked,
      link: red.link,
    }))
    .filter((red) => red.nombre && red.checked);

  if (redes.some((red) => !red.nombre)) {
    console.error('Falta nombre en redes sociales');
    return res
      .status(400)
      .send('Todos los campos de nombre son requeridos en las redes sociales');
  }

  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  biblioteca.images.push(...imgs);

  biblioteca.autor = req.user._id;

  await biblioteca.save();
  req.flash('success', 'Biblioteca creada exitosamente');
  res.redirect(`bibliotecas/${biblioteca._id}`);
};

module.exports.biblioDetails = async (req, res) => {
  const biblioteca = await Biblioteca.findById(req.params.id)
    .populate({
      path: 'reviews',
      populate: {
        path: 'autor',
      },
    })
    .populate({
      path: 'catalogoLibros',
      model: 'Libro',
    })
    .populate('autor', 'nombre');

  if (!biblioteca) {
    req.flash('error', 'Biblioteca no encontrada');
    return res.redirect('/bibliotecas');
  }

  const redes = biblioteca.redes.map((red) => ({
    nombre: red.nombre,
    checked: red.checked || false,
    link: red.link || '',
  }));

  res.render('bibliotecas/details', {
    biblioteca,
    currentUser: req.user,
    redes,
    title: biblioteca.nombre,
  });
};

module.exports.editForm = async (req, res) => {
  const biblioteca = await Biblioteca.findById(req.params.id).populate(
    'reviews'
  );
  const redes = biblioteca.redes;
  const catalogoLibros = biblioteca.catalogoLibros;
  if (!biblioteca) {
    req.flash('error', 'Biblioteca no encontrada');
    return res.redirect('/bibliotecas');
  }
  res.render('bibliotecas/editar', {
    biblioteca,
    title: `Editar ${biblioteca.nombre}`,
    redes,
    catalogoLibros,
  });
};

module.exports.editarBiblio = async (req, res) => {
  const { id } = req.params;
  console.log(`Iniciando edición para la biblioteca con ID: ${id}`);

  try {
    const biblioteca = await Biblioteca.findByIdAndUpdate(
      id,
      { ...req.body.biblioteca },
      { new: true }
    );
    if (!biblioteca) {
      console.error('Biblioteca no encontrada');
      return res.status(404).send('Biblioteca no encontrada');
    }
    console.log('Biblioteca encontrada:', biblioteca);

    if (
      req.body.biblioteca.geometry &&
      req.body.biblioteca.geometry.coordinates
    ) {
      biblioteca.geometry = {
        type: 'Point',
        coordinates: req.body.biblioteca.geometry.coordinates,
      };
    } else if (req.body.biblioteca.localidad) {
      // Si no se pasan coordenadas, obtenemos la localización a partir del nombre de la localidad
      const geoData = await maptilerClient.geocoding.forward(
        req.body.biblioteca.localidad,
        { limit: 1 }
      );
      if (geoData.features.length > 0) {
        biblioteca.geometry = geoData.features[0].geometry;
      } else {
        console.error('Localidad no encontrada');
        return res.status(400).send('Localidad no encontrada.');
      }
    }

    const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    biblioteca.images.push(...imgs);

    const redes = req.body.biblioteca.redes;
    biblioteca.redes = redes
      .map((red) => ({
        nombre: red.nombre,
        checked: red.checked,
        link: red.link,
      }))
      .filter((red) => red.nombre && red.checked);

    if (redes.some((red) => !red.nombre)) {
      console.error('Falta nombre en redes sociales');
      return res
        .status(400)
        .send(
          'Todos los campos de nombre son requeridos en las redes sociales'
        );
    }
    const cuota = req.body.biblioteca.cuota;

    const catalogoLibros = req.body.biblioteca.catalogoLibros || [];
    biblioteca.catalogoLibros = catalogoLibros
      .map((libro) => ({
        titulo: libro.titulo,
        autor: libro.autor,
        codigoCat: libro.codigoCat,
        genero: libro.genero,
        publishYear: libro.publishYear,
      }))
      .filter((libro) => libro.titulo);

    if (req.body.deleteLibros) {
      const librosAEliminar = req.body.deleteLibros.map(Number);
      biblioteca.catalogoLibros = biblioteca.catalogoLibros.filter(
        (libro, index) => !librosAEliminar.includes(index)
      );
    }
    if (req.body.deleteImages) {
      for (let filename of req.body.deleteImages) {
        await cloudinary.uploader.destroy(filename);
      }
      await biblioteca.updateOne({
        $pull: { images: { filename: { $in: req.body.deleteImages } } },
      });
    }

    await biblioteca.save();
    console.log('Biblioteca guardada correctamente.');

    req.flash('success', 'Biblioteca editada exitosamente');
    res.redirect(`/bibliotecas/${biblioteca._id}`);
  } catch (error) {
    console.error('Error en editarBiblio:', error);
    res.status(500).send('Error interno del servidor');
  }
};

module.exports.borrarBiblio = async (req, res) => {
  const { id } = req.params;
  await Biblioteca.findByIdAndDelete(id);
  req.flash('success', 'Biblioteca eliminada exitosamente');
  res.redirect('/bibliotecas');
};

module.exports.librosPorBiblio = async (req, res) => {
  const { id } = req.params;
  const { titulo, autor, genero } = req.query;
  const biblioteca = await Biblioteca.findById(id).populate('catalogoLibros');
  if (!biblioteca) {
    return res.status(404).send('Biblioteca no encontrada');
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

  res.render('libros/index', {
    biblioteca,
    libros,
    title: `Libros de ${biblioteca.nombre}`,
    isGeneral: false,
    isBusqueda,
  });
};
