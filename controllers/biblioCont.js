const Biblioteca = require('../modelos/biblioteca');
const Libro = require('../modelos/libro');
const { cloudinary } = require('../cloudinary');
const maptilerClient = require('@maptiler/client');
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Página actual
    const limit = 20; // Limite de bibliotecas por página
    const skip = (page - 1) * limit; // Número de bibliotecas a omitir
    // Obtener parámetros de búsqueda
    const { nombre, localidad, codigoConabip } = req.query;

    // Construir filtro para la búsqueda
    const query = {};
    if (codigoConabip) {
        query.registroConabip = codigoConabip;
    } else {
        if (nombre) {
            query.nombre = { $regex: new RegExp(nombre, 'i') }; // Búsqueda insensible a mayúsculas
        }
        if (localidad) {
            query.localidad = { $regex: new RegExp(localidad, 'i') };
        }
    }

    const bibliotecas = await Biblioteca.find(query).skip(skip).limit(limit);
    const total = await Biblioteca.countDocuments(query); // Total de bibliotecas

    if (bibliotecas.length === 0) {
        req.flash('error', 'No se encontraron bibliotecas con esos datos');
        return res.redirect('/bibliotecas'); // Redirige a la página de bibliotecas
    }

    res.render('bibliotecas/index', {
        title: 'Todas las bibliotecas',
        bibliotecas,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        nombre, // Para mantener el valor en el campo
        localidad, // Para mantener el valor en el campo
        codigoConabip, // Para mantener el valor en el campo
    });
};

module.exports.queEs = (req, res) => {
    res.render('bibliotecas/que-es', { title: 'Qué es una biblioteca popular' });
};

module.exports.requisitos = (req, res) => {
    res.render('bibliotecas/requisitos', { title: 'Requisitos para formar una biblioteca popular' });
};


module.exports.nuevoForm = (req, res) => {
    // Enviar un objeto vacío de biblioteca para evitar el error
    res.render('bibliotecas/nueva', {title: 'Cargar nueva biblioteca',
        biblioteca: { images: [] } // Asegura que siempre haya un arreglo de imágenes
    });
};
module.exports.crearBiblio = async (req, res, next) => {
    const biblioteca = new Biblioteca(req.body.biblioteca);

    // Maneja las coordenadas
    if (req.body.biblioteca.geometry && req.body.biblioteca.geometry.coordinates) {
        biblioteca.geometry = {
            type: 'Point',
            coordinates: [
                req.body.biblioteca.geometry.coordinates[0], // Longitud
                req.body.biblioteca.geometry.coordinates[1], // Latitud
            ],
        };
    } else {
        // Si no hay coordenadas, utiliza geocodificación
        const geoData = await maptilerClient.geocoding.forward(req.body.biblioteca.localidad, { limit: 1 });
        if (!geoData.features.length) {
            req.flash('error', 'Localidad no encontrada.');
            return res.redirect('/bibliotecas');
        }
        biblioteca.geometry = geoData.features[0].geometry;
    }

    // Manejo del catálogo de libros
    if (req.body.catalogoLibros && Array.isArray(req.body.catalogoLibros)) {
        const librosIds = [];
        for (const libroData of req.body.catalogoLibros) {
            const libro = new Libro(libroData); // Crear nuevo libro
            await libro.save(); // Guardar el libro
            librosIds.push(libro._id); // Agregar el ID del libro al array
        }
        biblioteca.catalogoLibros = librosIds; // Asignar solo los IDs al catálogo
    } else {
        biblioteca.catalogoLibros = []; // Inicializa como array vacío si no hay libros
    }

        // Procesar redes sociales
        const redes = req.body.biblioteca.redes || [];
        biblioteca.redes = redes.map(red => ({
            nombre: red.nombre,// || '',
            checked: red.checked,// === 'true',
            link: red.link,// || '',
        })).filter(red => red.nombre && red.checked);  // Filtra redes sin nombre y con 'checked' verdadero

        // Validación de redes sociales
        if (redes.some(red => !red.nombre)) {
            console.error('Falta nombre en redes sociales');
            return res.status(400).send('Todos los campos de nombre son requeridos en las redes sociales');
        }
    
        const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    biblioteca.images.push(...imgs);



    biblioteca.autor = req.user._id;

    await biblioteca.save();
    req.flash('success', 'Biblioteca creada exitosamente');
    res.redirect(`bibliotecas/${biblioteca._id}`);
};

module.exports.biblioDetails = async (req, res) => {
    const biblioteca = await Biblioteca.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'autor',
        },
    }).populate({
        path: 'catalogoLibros',
        model: 'Libro',
    }).populate('autor', 'nombre');

    if (!biblioteca) {
        req.flash('error', 'Biblioteca no encontrada');
        return res.redirect('/bibliotecas');
    }

    const redes = biblioteca.redes.map(red => ({
        nombre: red.nombre,
        checked: red.checked || false, // Aseguramos que sea booleano
        link: red.link || ''
    }));//filter(?)

    res.render('bibliotecas/details', {
        biblioteca,
        currentUser: req.user,
        redes, // Pasamos las redes directamente de la biblioteca
        title: biblioteca.nombre,
    });
};

module.exports.editForm = async (req, res) => {
    const biblioteca = await Biblioteca.findById(req.params.id).populate('reviews');
    const redes = biblioteca.redes;
    const catalogoLibros = biblioteca.catalogoLibros;
    if (!biblioteca) {
        req.flash('error', 'Biblioteca no encontrada');
        return res.redirect('/bibliotecas');
    }
    res.render('bibliotecas/editar', { biblioteca, title: `Editar ${biblioteca.nombre}`, redes, catalogoLibros });
};

module.exports.editarBiblio = async (req, res) => {
    const { id } = req.params;
    console.log(`Iniciando edición para la biblioteca con ID: ${id}`);

    try {
        // Buscar la biblioteca para editar
        const biblioteca = await Biblioteca.findByIdAndUpdate(id, { ...req.body.biblioteca }, { new: true });
        if (!biblioteca) {
            console.error('Biblioteca no encontrada');
            return res.status(404).send('Biblioteca no encontrada');
        }
        console.log('Biblioteca encontrada:', biblioteca);

        // Verificar o actualizar las coordenadas
        if (req.body.biblioteca.geometry && req.body.biblioteca.geometry.coordinates) {
            biblioteca.geometry = {
                type: 'Point',
                coordinates: req.body.biblioteca.geometry.coordinates,
            };
        } else if (req.body.biblioteca.localidad) {
            // Si no se pasan coordenadas, obtenemos la localización a partir del nombre de la localidad
            const geoData = await maptilerClient.geocoding.forward(req.body.biblioteca.localidad, { limit: 1 });
            if (geoData.features.length > 0) {
                biblioteca.geometry = geoData.features[0].geometry;
            } else {
                console.error('Localidad no encontrada');
                return res.status(400).send('Localidad no encontrada.');
            }
        }

          const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
          biblioteca.images.push(...imgs);

        // Procesar redes sociales
        const redes = req.body.biblioteca.redes //|| [];
        biblioteca.redes = redes.map(red => ({
            nombre: red.nombre, //|| '',
            checked: red.checked,// === 'true',
            link: red.link,// || '',
        })).filter(red => red.nombre && red.checked);  // Filtra redes sin nombre y con 'checked' verdadero

        // Validación de redes sociales
        if (redes.some(red => !red.nombre)) {
            console.error('Falta nombre en redes sociales');
            return res.status(400).send('Todos los campos de nombre son requeridos en las redes sociales');
        }

        // Procesar catálogo de libros
        const catalogoLibros = req.body.biblioteca.catalogoLibros || [];
        biblioteca.catalogoLibros = catalogoLibros
            .map(libro => ({
                titulo: libro.titulo,
                autor: libro.autor,
                codigoCat: libro.codigoCat,
                genero: libro.genero,
                publishYear: libro.publishYear,
            }))
            .filter(libro => libro.titulo);  // Filtra libros sin título

        // Eliminar libros (si se indicó)
        if (req.body.deleteLibros) {
            const librosAEliminar = req.body.deleteLibros.map(Number);
            biblioteca.catalogoLibros = biblioteca.catalogoLibros.filter((libro, index) => !librosAEliminar.includes(index));
        }
        if (req.body.deleteImages) {
            for (let filename of req.body.deleteImages) {
                // eliminamos las imagenes de Cloudinary también 
                await cloudinary.uploader.destroy(filename);
            }
            await biblioteca.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
        };
        // Guardar los cambios en la base de datos
        await biblioteca.save();
        console.log('Biblioteca guardada correctamente.');

        // Respuesta final
        req.flash('success', 'Biblioteca editada exitosamente');
        res.redirect(`/bibliotecas/${biblioteca._id}`);


    }  catch (error) {
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
    const { id } = req.params; // ID de la biblioteca
    const { titulo, autor, genero } = req.query; // Obtenemos los parámetros de búsqueda
    const biblioteca = await Biblioteca.findById(id).populate('catalogoLibros');
    if (!biblioteca) {
        return res.status(404).send('Biblioteca no encontrada');
    }

    // Definir el filtro de búsqueda
    let query = { biblioteca: id };  // Filtro para asegurar que los libros pertenecen a esta biblioteca
    if (titulo) query.titulo = { $regex: titulo, $options: 'i' };   // Filtro por título
    if (autor) query.autor = { $regex: autor, $options: 'i' };       // Filtro por autor
    if (genero) query.genero = { $regex: genero, $options: 'i' };    // Filtro por género

    // Definir la variable isBusqueda para saber si se ha hecho una búsqueda
    const isBusqueda = titulo || autor || genero;

    // Realizar la búsqueda de los libros si hay filtros, si no, pasar el catálogo completo de la biblioteca
    let libros = [];
    if (isBusqueda) {
        libros = await Libro.find(query);  // Obtener libros filtrados
    } else {
        libros = biblioteca.catalogoLibros;  // Mostrar todos los libros si no hay filtros
    }

    res.render('libros/index', {
        biblioteca,
        libros,
        title: `Libros de ${biblioteca.nombre}`,
        isGeneral: false,
        isBusqueda, // Pasamos isBusqueda a la vista
    });
}
