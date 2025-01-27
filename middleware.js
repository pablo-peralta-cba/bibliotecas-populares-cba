// const { biblioSchema, reviewSchema, libroSchema } = require('./schemas.js');
// const ExpressError = require('./utilities/expressError');
// const Biblioteca = require('./modelos/biblioteca');
// const Review = require('./modelos/reviews');
// const Usuario = require('./modelos/usuario.js');
// const biblioteca = require('./modelos/biblioteca');

// module.exports.estaLogueado = (req, res, next) => {
//     if (!req.isAuthenticated()) {
//         // Esta linea envia de nuevo a la pagina que ibamos antes del login 
//         // para que funcione, necesitamos la siguiente funcion 
//         // que evita que los datos se pierdan en session y se guarden en res.locals para su uso 
//         req.session.returnTo = req.originalUrl;
//         req.flash('error', 'Tenés que estar registrado y logueado para eso');
//         return res.redirect('/login');
//     }
//     next();
// }

// module.exports.storeReturnTo = (req, res, next) => {
//     if (req.session.returnTo) {
//         res.locals.returnTo = req.session.returnTo;
//     }
//     next();
// }

// module.exports.esAutor = async (req, res, next) => {
//     const { id } = req.params;
//     const biblioteca = await Biblioteca.findById(id);
//     if (!biblioteca) {
//         req.flash('error', 'Biblioteca no encontrada');
//         return res.redirect('/bibliotecas');
//     };
//     if (!req.user || !biblioteca.autor.equals(req.user._id)) {
//         req.flash('error', 'No tienes autorización para realizar esa acción!!!');
//         return res.redirect(`/bibliotecas/${id}`)
//     }
//     next();
// };


// module.exports.verificarEmail = async (req, res, next) => {
//     // Verificar si el usuario está autenticado y si su email está verificado
//     if (!req.user || !req.user.isVerified) {
//         req.flash('error', 'Por favor, verifica tu correo electrónico antes de continuar.');
//         return  res.render('usuarios/esperaVerificacion', {title: 'Verificación Pendiente'});  // Redirige a una página de verificación o login
//     }
//     next();
// };

// module.exports.esReviewAutor = async (req, res, next) => {
//     const { id, reviewId } = req.params;
//     const review = await Review.findById(reviewId);
//     if (!review.autor.equals(req.user._id)) {
//         req.flash('error', 'No tienes autorización para realizar esa acción!!!');
//         return res.redirect(`/bibliotecas/${id}`)
//     }
//     next();
// };


// module.exports.cuotaMiddleware = (req, res, next) => {
//     // Verifica que el campo cuota.existe sea convertido a booleano
//     if (req.body.biblioteca && req.body.biblioteca.cuota) {
//         console.log('Antes de modificar cuota:', req.body.biblioteca.cuota);
        
//         // Asegúrate de que cuota.existe sea un booleano
//         req.body.biblioteca.cuota.existe = req.body.biblioteca.cuota.existe === 'true';  // Convertir a booleano
        
//         console.log('Después de modificar cuota:', req.body.biblioteca.cuota);

//         // Si cuota.existe es true, asegurarse de que cuota.valor sea un número
//         if (req.body.biblioteca.cuota.existe && typeof req.body.biblioteca.cuota.valor !== 'number') {
//             req.body.biblioteca.cuota.valor = 0; // O el valor predeterminado que prefieras
//         }
//     }
//     next();
// };

// // Joi middleware function
// // we have to add this middleware func as an argument on our routing functions 
// // module.exports.validateBiblio = (req, res, next) => {
// //     console.log(req.body);

// //     // Asegurarse de que las redes sociales sean un array
// //     if (!Array.isArray(req.body.biblioteca.redes)) {
// //         if (req.body.biblioteca.redes) {
// //             req.body.biblioteca.redes = [req.body.biblioteca.redes]; // Convierte a array si es un objeto
// //         } else {
// //             req.body.biblioteca.redes = []; // Si no hay redes, inicializa como array vacío
// //         }
// //     };

// //     // Asegúrate de que todas las redes sociales tengan un valor de 'checked' por defecto (false) si no están seleccionadas
// //     req.body.biblioteca.redes.forEach(red => {
// //         if (red.checked === undefined) {
// //             red.checked = false;  // Si 'checked' no está definido, asigna 'false'
// //         } else {
// //             red.checked = red.checked === 'true';  // Asegúrate de que 'checked' sea booleano
// //         }
// //     });

// //     // Si el campo deleteImages está presente, asegúrate de que sea un array
// //     if (req.body.biblioteca.deleteImages) {
// //         // Si no es un array, convertirlo a uno
// //         if (!Array.isArray(req.body.biblioteca.deleteImages)) {
// //             req.body.biblioteca.deleteImages = [req.body.biblioteca.deleteImages]; // Convierte a array si es un valor único
// //         }

// //         // Limpiar el array de deleteImages eliminando cualquier valor vacío
// //         req.body.biblioteca.deleteImages = req.body.biblioteca.deleteImages.filter(image => image.trim() !== '');
// //     }

// //     // Verificar si la solicitud es un POST (creación) y bloquear el uso de deleteImages en este caso
// //     if (req.method === 'POST' && req.body.biblioteca.deleteImages) {
// //         return res.status(400).send('"deleteImages" is not allowed during creation');
// //     }

// //     // Si el método real es PUT o PATCH, entonces permitir deleteImages
// //     if ((req.method === 'PUT' || req.method === 'PATCH') && req.body.biblioteca.deleteImages) {
// //         // Asegurarse de que deleteImages es un array de cadenas de texto (IDs de imágenes)
// //         if (!Array.isArray(req.body.biblioteca.deleteImages)) {
// //             return res.status(400).send('deleteImages must be an array');
// //         }

// //         // Verifica que todos los valores en deleteImages sean cadenas (public_ids válidos)
// //         if (!req.body.biblioteca.deleteImages.every(id => typeof id === 'string')) {
// //             return res.status(400).send('deleteImages must contain only strings (public_ids)');
// //         }
// //     }

// //     // Validación del schema de biblioteca
// //     const { error } = biblioSchema.validate(req.body);
// //     if (error) {
// //         const msj = error.details.map(elem => elem.message).join(',');
// //         throw new ExpressError(msj, 400);
// //     } else {
// //         next();
// //     }

// //     console.log('Datos recibidos:', req.body);
// // };



// module.exports.validateBiblio = (req, res, next) => {
//     console.log(req.body);
    
//     if (!Array.isArray(req.body.biblioteca.redes)) {
//         if (req.body.biblioteca.redes) {
//             req.body.biblioteca.redes = [req.body.biblioteca.redes]; // Convierte a array si es un objeto
//         } else {
//             req.body.biblioteca.redes = []; // Si no hay redes, inicializa como array vacío
//         }
//     }

//     // Asegúrate de que todas las redes sociales tengan un valor de 'checked' por defecto (false) si no están seleccionadas
//     req.body.biblioteca.redes.forEach(red => {
//         if (red.checked === undefined) {
//             red.checked = false;  // Si 'checked' no está definido, asigna 'false'
//         } else {
//             red.checked = red.checked === 'true';  // Asegúrate de que 'checked' sea booleano
//         }
//     });

//     // Validar que deleteImages esté permitido solo en PUT o PATCH
//     if (req.body.biblioteca.deleteImages) {
//         // Si estamos en un POST, rechazamos el campo deleteImages
//         if (req.method === 'POST') {
//             return res.status(400).send('"deleteImages" is not allowed during creation');
//         }
//         // Si estamos en PUT o PATCH, permitimos el campo deleteImages
//         if (!Array.isArray(req.body.biblioteca.deleteImages)) {
//             return res.status(400).send('deleteImages must be an array');
//         }
//     }
//     if (req.body.deleteImages && !Array.isArray(req.body.deleteImages)) {
//         return res.status(400).send('deleteImages debe ser un array.');
//     }
    
//     const { error } = biblioSchema.validate(req.body);
//     if (error) {
//         const msj = error.details.map(elem => elem.message).join(',');
//         throw new ExpressError(msj, 400);
//     } else {
//         next();
//     }
//     console.log('Datos recibidos:', req.body);
// };

// module.exports.validateLibro = (req, res, next) => {
//     console.log(req.body); // Para depuración, puedes quitarlo después

//     // Asegúrate de que req.body.libro sea un objeto y no un array
//     if (!req.body.libro) {
//         throw new ExpressError('El libro no se ha proporcionado.', 400);
//     }

//     // Joi verification (server-side)
//     const { error } = libroSchema.validate(req.body); // Asegúrate de que req.body tenga la estructura correcta

//     if (error) {
//         const msj = error.details.map(el => el.message).join(', ');
//         throw new ExpressError(msj, 400);
//     } else {
//         next();
//     }
// };

const { biblioSchema, reviewSchema, libroSchema } = require('./schemas.js');
const ExpressError = require('./utilities/expressError');
const Biblioteca = require('./modelos/biblioteca');
const Review = require('./modelos/reviews');
const Usuario = require('./modelos/usuario.js');
const biblioteca = require('./modelos/biblioteca');

module.exports.estaLogueado = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'Tenés que estar registrado y logueado para eso');
        return res.redirect('/login');
    }
    next();
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.esAutor = async (req, res, next) => {
    const { id } = req.params;
    const biblioteca = await Biblioteca.findById(id);
    if (!biblioteca) {
        req.flash('error', 'Biblioteca no encontrada');
        return res.redirect('/bibliotecas');
    };
    if (!req.user || !biblioteca.autor.equals(req.user._id)) {
        req.flash('error', 'No tienes autorización para realizar esa acción!!!');
        return res.redirect(`/bibliotecas/${id}`)
    }
    next();
};

module.exports.verificarEmail = async (req, res, next) => {
    if (!req.user || !req.user.isVerified) {
        req.flash('error', 'Por favor, verifica tu correo electrónico antes de continuar.');
        return res.render('usuarios/esperaVerificacion', { title: 'Verificación Pendiente' });
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
    if (req.body.biblioteca && req.body.biblioteca.cuota) {
        req.body.biblioteca.cuota.existe = req.body.biblioteca.cuota.existe === 'true';
        // if (req.body.biblioteca.cuota.existe && typeof req.body.biblioteca.cuota.valor !== 'number') {
        //     req.body.biblioteca.cuota.valor = 0;
        // }
    }
    next();
};

module.exports.validateBiblio = (req, res, next) => {
    console.log(req.body);

// Asegurarse de que las redes sociales sean un array
  // Asegurarse de que las redes sociales sean un array
  if (!Array.isArray(req.body.biblioteca.redes)) {
    if (req.body.biblioteca.redes) {
        req.body.biblioteca.redes = [req.body.biblioteca.redes]; // Convierte a array si es un objeto
    } else {
        req.body.biblioteca.redes = []; // Si no hay redes, inicializa como array vacío
    }
}
    // Asegúrate de que todas las redes sociales tengan un valor de 'checked' por defecto (false) si no están seleccionadas
    req.body.biblioteca.redes.forEach(red => {
        if (red.checked === undefined) {
            red.checked = false;  // Si 'checked' no está definido, asigna 'false'
        } else {
            red.checked = red.checked === 'true';  // Asegúrate de que 'checked' sea booleano
        }
    });

        // Si la solicitud es un POST (creación), no debe haber `deleteImages`
        if (req.method === 'POST' && req.body.biblioteca.deleteImages) {
            return res.status(400).send('"deleteImages" is not allowed during creation');
        }
    
        // Si la solicitud es PUT o PATCH, procesar `deleteImages`
        if (req.method === 'PUT' || req.method === 'PATCH') {
            // Si está presente, asegurarse de que sea un array
            if (req.body.biblioteca.deleteImages && !Array.isArray(req.body.biblioteca.deleteImages)) {
                return res.status(400).send('deleteImages must be an array');
            }
        }
    
        // Validar que `deleteImages` sea un array de cadenas (ID de imágenes)
        if (req.body.biblioteca.deleteImages) {
            // Limpiar el array de deleteImages eliminando cualquier valor vacío
            req.body.biblioteca.deleteImages = req.body.biblioteca.deleteImages.filter(image => image.trim() !== '');
    
            if (!req.body.biblioteca.deleteImages.every(id => typeof id === 'string')) {
                return res.status(400).send('deleteImages must contain only strings (public_ids)');
            }
        }

    const { error } = biblioSchema.validate(req.body, { allowUnknown: true }); // allowUnknown: true para permitir campos extra
    if (error) {
        const msj = error.details.map(elem => elem.message).join(',');
        throw new ExpressError(msj, 400);
    } else {
        next();
    }

    console.log('Datos recibidos:', req.body);
};

module.exports.validateLibro = (req, res, next) => {
    console.log(req.body); // Para depuración, puedes quitarlo después

    // Asegúrate de que req.body.libro sea un objeto y no un array
    if (!req.body.libro) {
        throw new ExpressError('El libro no se ha proporcionado.', 400);
    }

    // Joi verification (server-side)
    const { error } = libroSchema.validate(req.body); // Asegúrate de que req.body tenga la estructura correcta

    if (error) {
        const msj = error.details.map(el => el.message).join(', ');
        throw new ExpressError(msj, 400);
    } else {
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msj = error.details.map(el => el.message).join(',');
        throw new ExpressError(msj, 400);
    } else {
        next();
    }
}