const Libro = require('../modelos/libro');
const Biblioteca = require('../modelos/biblioteca');

// Mostrar todos los libros
module.exports.index = async (req, res) => {
  const { titulo, autor, genero } = req.query;
  let query = {};

  const isBusqueda = titulo || autor || genero;

  let libros = [];

  if (isBusqueda) {
    query.titulo = { $regex: titulo, $options: 'i' };
    query.autor = { $regex: autor, $options: 'i' };
    query.genero = { $regex: genero, $options: 'i' };

    try {
      libros = await Libro.find(query);
    } catch (error) {
      console.error(error);
      return res.status(500).send('Error al cargar los libros');
    }
  }

  res.render('libros/index', {
    title: 'Catálogo de libros',
    libros,
    isGeneral: true,
    isBusqueda,
  });
};

module.exports.mostrarLibro = async (req, res) => {
  const { id } = req.params;
  const libro = await Libro.findById(id).populate('biblioteca');
  if (!libro) {
    req.flash('error', 'Libro no encontrado');
    return res.redirect('/libros');
  }
  const biblioteca = libro.biblioteca;
  res.render('libros/showPage', { biblioteca, libro, title: libro.titulo });
};

module.exports.buscarLibros = async (req, res) => {
  const { titulo, autor, genero } = req.query;
  let libros = [];
  const isBusqueda = titulo || autor || genero;

  if (isBusqueda) {
    let query = {};
    if (titulo) query.titulo = { $regex: titulo, $options: 'i' };
    if (autor) query.autor = { $regex: autor, $options: 'i' };
    if (genero) query.genero = { $regex: genero, $options: 'i' };

    try {
      libros = await Libro.find(query);
    } catch (error) {
      console.error(error);
      return res.status(500).send('Error en la búsqueda de libros');
    }
  }
  res.render('libros/index', {
    title: 'Resultados de la búsqueda',
    libros,
    isGeneral: true,
    isBusqueda,
  });
};

module.exports.nuevoLibroForm = async (req, res) => {
  const { id } = req.params;
  const biblioteca = await Biblioteca.findById(id);
  res.render('libros/nuevo', { title: 'Agregar Nuevo Libro', biblioteca });
};

// Crear un nuevo libro vinculado a una biblioteca
module.exports.crearLibro = async (req, res) => {
  const { id } = req.params;
  const libro = new Libro(req.body.libro);
  libro.biblioteca = id;

  try {
    await libro.save();
    const biblioteca = await Biblioteca.findById(id);
    if (!biblioteca) {
      req.flash('error', 'Biblioteca no encontrada');
      return res.redirect('/bibliotecas');
    }

    biblioteca.catalogoLibros.push(libro._id);
    await biblioteca.save();

    req.flash('success', 'Libro creado exitosamente');
    res.redirect(`/bibliotecas/${id}/libros`);
  } catch (error) {
    req.flash('error', 'Error al crear el libro');
    res.redirect(`/bibliotecas/${id}/libros/nuevo`);
  }
};

module.exports.editarLibroForm = async (req, res) => {
  const { libroId } = req.params;
  const libro = await Libro.findById(libroId);

  if (!libro) {
    req.flash('error', 'Libro no encontrado');
    return res.redirect('/libros');
  }

  res.render('libros/editar', {
    libro,
    title: 'Editar Libro',
    bibliotecaId: req.params.id,
  });
};

// Editar un libro
module.exports.editarLibro = async (req, res) => {
  const { id, libroId } = req.params;
  const libro = await Libro.findByIdAndUpdate(libroId, req.body.libro, {
    new: true,
  });

  if (!libro) {
    req.flash('error', 'Libro no encontrado');
    return res.redirect(`/bibliotecas/${id}/libros`);
  }

  req.flash('success', 'Libro actualizado exitosamente');
  res.redirect(`/bibliotecas/${id}/libros/${libro._id}`);
  console.log('ID de biblioteca:', id);
  console.log('ID de libro:', libroId);
};

module.exports.borrarLibro = async (req, res) => {
  const { id, libroId } = req.params;
  console.log(req.params);
  try {
    await Libro.findByIdAndDelete(libroId);
    await Biblioteca.findByIdAndUpdate(id, {
      $pull: { catalogoLibros: libroId },
    });

    req.flash('success', 'Libro eliminado exitosamente');
    res.redirect(`/bibliotecas/${id}/libros`);
  } catch (err) {
    req.flash('error', 'Error al eliminar el libro');
    res.redirect(`/bibliotecas/${id}/libros`);
  }
  const bibliotecaActualizada = await Biblioteca.findById(id);
  console.log(bibliotecaActualizada.catalogoLibros);
};
