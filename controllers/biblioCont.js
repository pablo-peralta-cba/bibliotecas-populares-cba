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
            if(nombre) {
            query.nombre = { $regex: new RegExp(nombre,'i') }; // Búsqueda insensible a mayúsculas
        }
            if (localidad) {
            query.localidad = { $regex: new RegExp(localidad, 'i') };
        }
        }; 
       
    const bibliotecas = await Biblioteca.find(query).skip(skip).limit(limit); // Cambia según tu modelo;
    const total = await Biblioteca.countDocuments(query); // Total de bibliotecas

      // Comprobar si se encontraron bibliotecas
      if (bibliotecas.length === 0) {
        req.flash('error', 'No se encontraron bibliotecas con esos datos');
        return res.redirect('/bibliotecas'); // Redirige a la página de bibliotecas
    };

    res.render('bibliotecas/index', { title: 'Todas las bibliotecas',
        bibliotecas,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        nombre,          // Para mantener el valor en el campo
        localidad,       // Para mantener el valor en el campo
        codigoConabip    // Para mantener el valor en el campo;
    })
};

module.exports.queEs = (req, res) => {
    res.render('bibliotecas/que-es', {title: 'Qué es una biblioteca popular'});
};
module.exports.requisitos = (req, res) => {
    res.render('bibliotecas/requisitos', {title: 'Requisitos para formar una biblioteca popular'});
};

module.exports.nuevoForm = (req, res) => {
    res.render('bibliotecas/nueva', {title: 'Cargar nueva biblioteca'});
};
module.exports.crearBiblio = async (req, res, next) => {
    const biblioteca = new Biblioteca(req.body.biblioteca);

    // Maneja las coordenadas
    if (req.body.biblioteca.geometry && req.body.biblioteca.geometry.coordinates) {
        biblioteca.geometry = {
            type: 'Point',
            coordinates: [
                req.body.biblioteca.geometry.coordinates[0], // Longitud
                req.body.biblioteca.geometry.coordinates[1]  // Latitud
            ]
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

    // Manejo de redes
    if (req.body.redes && Array.isArray(req.body.redes)) {
        biblioteca.redes = req.body.redes.filter(red => red.checked && red.nombre).map(red => ({
            nombre: red.nombre,
            checked: red.checked === 'true',
            link: red.link
        }));
    } else {
        biblioteca.redes = []; // Inicializa como array vacío si no hay redes
    }

    // Manejo de imágenes
    biblioteca.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    biblioteca.autor = req.user._id;

    await biblioteca.save();
    req.flash('success', 'Biblioteca creada exitosamente');
    res.redirect(`bibliotecas/${biblioteca._id}`);
};



module.exports.biblioDetails = async (req, res) => {
    const biblioteca = await Biblioteca.findById(req.params.id).populate({
        // Aca agregamos las reviews y el autor de cada review en la biblio,
        // luego le sumamos el creador de la biblio en si 
        path: 'reviews',
        populate: {
            path: 'autor'
        }
    }).populate({
        path: 'catalogoLibros', // Asegúrate de hacer el populate aquí
        model: 'Libro' // Especifica el modelo si es necesario
    }).populate('autor', 'nombre');
    if (!biblioteca) {
        req.flash('error', 'Biblioteca no encontrada');
        return res.redirect('/bibliotecas');
    };
    const redes = biblioteca.redes.map(red => ({
        nombre: red.nombre,
        checked: red.checked || false, // Aseguramos que sea booleano
        link: red.link || ''
    }));
    
    res.render('bibliotecas/details', { biblioteca, redes, title: biblioteca.nombre });
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
    const biblioteca = await Biblioteca.findByIdAndUpdate(id, { ...req.body.biblioteca }, { new: true });
    if (!biblioteca) {
        return res.status(404).send('Biblioteca no encontrada');
    };
    // Verifica si las coordenadas están en el cuerpo de la solicitud
    if (req.body.biblioteca.geometry && req.body.biblioteca.geometry.coordinates) {
        // Asigna las coordenadas directamente
        biblioteca.geometry = {
            type: 'Point',
            coordinates: [
                req.body.biblioteca.geometry.coordinates[0], // Longitud
                req.body.biblioteca.geometry.coordinates[1]  // Latitud
            ]
        };
    } else {
        // Si no hay coordenadas, usa geocodificación
        const geoData = await maptilerClient.geocoding.forward(req.body.biblioteca.localidad, { limit: 1 });
        if (geoData.features.length > 0) {
            biblioteca.geometry = geoData.features[0].geometry;
        } else {
            return res.status(400).send('Localidad no encontrada.');
        }
    };
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    biblioteca.images.push(...imgs);
    const redes = req.body.biblioteca.redes || [];
    biblioteca.redes = redes.map(red => ({
        nombre: red.nombre || '', // Asegúrate de que siempre haya un valor
        checked: red.checked === 'true',
        link: red.link || ''
    })).filter(red => red.nombre);

    if (redes.some(red => !red.nombre)) {
        return res.status(400).send('Todos los campos de nombre son requeridos en las redes sociales');
    };
    const catalogoLibros = req.body.biblioteca.catalogoLibros || [];
    // Maneja el catálogo de libros
    biblioteca.catalogoLibros = catalogoLibros.map(libro => ({
            titulo: libro.titulo,
            autor: libro.autor,
            codigoCat: libro.codigoCat,
            genero: libro.genero,
            publishYear: libro.publishYear
            // Añade más campos según sea necesario
        })).filter(libro =>libro.titulo);
    // Maneja el catálogo de libros
    if (req.body.catalogoLibros) {
        // Filtra los libros que se quieren eliminar
        const librosAEliminar = req.body.deleteLibros ? req.body.deleteLibros.map(Number) : [];
        
        // Asigna los libros que no están marcados para eliminar
        biblioteca.catalogoLibros = req.body.catalogoLibros.filter((libro, index) => !librosAEliminar.includes(index));
    }

    await biblioteca.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            // eliminamos las imagenes de Cloudinary también 
            await cloudinary.uploader.destroy(filename);
        }
        await biblioteca.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    };
    req.flash('success', 'Biblioteca editada exitosamente');
    res.redirect(`/bibliotecas/${biblioteca._id}`);
 
};





module.exports.borrarBiblio = async (req, res) => {
    const { id } = req.params;
    await Biblioteca.findByIdAndDelete(id);
    req.flash('success', 'Biblioteca eliminada exitosamente');
    res.redirect('/bibliotecas');
};

// Mostrar libros de una biblioteca específica
module.exports.librosPorBiblio = async (req, res) => {
    const { id } = req.params; // ID de la biblioteca
    const { titulo, autor, genero } = req.query; // Obtenemos los parámetros de búsqueda
    const biblioteca = await Biblioteca.findById(id).populate('catalogoLibros');
    if (!biblioteca) {
        return res.status(404).send('Biblioteca no encontrada');
    };

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
   
       // Renderizar la vista con los libros filtrados
       res.render('libros/index', {
           biblioteca,
           libros,
           title: `Libros de ${biblioteca.nombre}`,
           isGeneral: false,
           isBusqueda, // Pasamos isBusqueda a la vista
       });
};