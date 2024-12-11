const Libro = require('../modelos/libro');
const Biblioteca = require('../modelos/biblioteca');


// Mostrar todos los libros
module.exports.index = async (req, res) => {
    const { titulo, autor, genero } = req.query;
    let query = {};  // Inicializamos el objeto de búsqueda

    // Determinar si se realizó una búsqueda
    const isBusqueda = titulo || autor || genero;

    let libros = [];

    if (isBusqueda) {
        // Si hay parámetros de búsqueda, realizamos la búsqueda
        query.titulo = { $regex: titulo, $options: 'i' };
        query.autor = { $regex: autor, $options: 'i' };
        query.genero = { $regex: genero, $options: 'i' };

        try {
            libros = await Libro.find(query);  // Buscar libros según los filtros
        } catch (error) {
            console.error(error);
            return res.status(500).send('Error al cargar los libros');
        }
    }

    // Pasamos `isBusqueda` para controlar el flujo en la vista
    res.render('libros/index', {
        title: 'Catálogo de libros',
        libros,
        isGeneral: true,
        isBusqueda,  // Indicador para saber si se está en una búsqueda
    });
};
// module.exports.index = async (req, res) => {
//     const libros = await Libro.find({});
//     res.render('libros/index', { libros, title: 'Catálogo General de Libros', isGeneral: true });
// };



// Mostrar detalles de un libro específico
module.exports.mostrarLibro = async (req, res) => {
    const { id } = req.params;
    const libro = await Libro.findById(id).populate('biblioteca');
    if (!libro) {
        req.flash('error', 'Libro no encontrado');
        return res.redirect('/libros');
    };
    // Aquí obtenemos la biblioteca
    const biblioteca = libro.biblioteca; // Obtiene la biblioteca del libro
    res.render('libros/showPage', { biblioteca, libro, title: libro.titulo });
};

module.exports.buscarLibros = async (req, res) => {
    const { titulo, autor, genero } = req.query;

    // Solo ejecutar la búsqueda si hay al menos un parámetro
    let libros = [];
    const isBusqueda = titulo || autor || genero;  // Verificamos si hay algún parámetro de búsqueda

    if (isBusqueda) {
        let query = {};
        if (titulo) query.titulo = { $regex: titulo, $options: 'i' }; // Búsqueda por título
        if (autor) query.autor = { $regex: autor, $options: 'i' };   // Búsqueda por autor
        if (genero) query.genero = { $regex: genero, $options: 'i' }; // Búsqueda por género

        try {
            // Realizar la búsqueda en la base de datos
            libros = await Libro.find(query);
        } catch (error) {
            console.error(error);
            return res.status(500).send('Error en la búsqueda de libros');
        }
    }

    // Renderizar la vista con los resultados de la búsqueda (si los hay)
    res.render('libros/index', {
        title: 'Resultados de la búsqueda',
        libros, // Pasamos la lista de libros (vacía si no hay búsqueda)
        isGeneral: true, // o false dependiendo del caso
        isBusqueda,  // Pasamos la variable isBusqueda
    });
};


// Formulario para agregar un nuevo libro
module.exports.nuevoLibroForm = async (req, res) => {
    const { id } = req.params; // Obtener el ID de la biblioteca
    const biblioteca = await Biblioteca.findById(id);
    res.render('libros/nuevo', { title: 'Agregar Nuevo Libro', biblioteca });
};

// Crear un nuevo libro vinculado a una biblioteca
module.exports.crearLibro = async (req, res) => {
    const { id } = req.params; // Obtener el id de la biblioteca
    const libro = new Libro(req.body.libro); // Asegúrate de que req.body tenga la estructura correcta
    libro.biblioteca = id; // Vincular el libro a la biblioteca

    try {
        // Guardar el libro en la base de datos
        await libro.save();

        // Buscar la biblioteca y agregar el libro al catálogo
        const biblioteca = await Biblioteca.findById(id);
        if (!biblioteca) {
            req.flash('error', 'Biblioteca no encontrada');
            return res.redirect('/bibliotecas');
        }

        // Agregar el libro al catálogo de la biblioteca
        biblioteca.catalogoLibros.push(libro._id);
        await biblioteca.save();

        req.flash('success', 'Libro creado exitosamente');
        res.redirect(`/bibliotecas/${id}/libros`); // Redirigir al catálogo de la biblioteca específica
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
    
    res.render('libros/editar', { libro, title: 'Editar Libro', bibliotecaId: req.params.id });
};

// Editar un libro
module.exports.editarLibro = async (req, res) => {
    const { id, libroId } = req.params;
    const libro = await Libro.findByIdAndUpdate(libroId, req.body.libro, { new: true });
    
    if (!libro) {
        req.flash('error', 'Libro no encontrado');
        return res.redirect(`/bibliotecas/${id}/libros`); // Redirigir a la lista de libros si no se encuentra
    }
    
    req.flash('success', 'Libro actualizado exitosamente');
    res.redirect(`/bibliotecas/${id}/libros/${libro._id}`);
    console.log('ID de biblioteca:', id);
    console.log('ID de libro:', libroId);
};


module.exports.borrarLibro = async (req, res) => {
    const { id, libroId } = req.params; // Obtener ambos IDs desde los parámetros
    console.log(req.params);
    try {
        // Elimina el libro de la base de datos
        await Libro.findByIdAndDelete(libroId);

        // También puedes eliminar el libro del catálogo de la biblioteca si es necesario
        await Biblioteca.findByIdAndUpdate(id, { $pull: { catalogoLibros: libroId } });

        req.flash('success', 'Libro eliminado exitosamente');
        res.redirect(`/bibliotecas/${id}/libros`); // Redirigir al catálogo de la biblioteca específica
    } catch (err) {
        req.flash('error', 'Error al eliminar el libro');
        res.redirect(`/bibliotecas/${id}/libros`); // Redirigir en caso de error
    }
    const bibliotecaActualizada = await Biblioteca.findById(id);
    console.log(bibliotecaActualizada.catalogoLibros); // Verifica el estado del catalogoLibros
};