// En este documento vamos a incluir server side validation
// para lo cual usamos Joi, que tenemos que descargar y requerir
const baseJoi = require('joi');
const { validate } = require('./modelos/reviews');
 //este package limpia de HTML tags o sintaxis a las queries 
//  y requests de los usuarios, con lo que evitamos vulnerabilidad en la seguridad 
const sanitizeHtml = require('sanitize-html');


const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', {value});
                return clean;
            }
        }
    }
});

// aca agregamos la funcion que acabamos de crear (de limpiar las queries de HTML)
// para que se pueda usar en todas las verificaciones de Joi
const Joi = baseJoi.extend(extension);

module.exports.biblioSchema = baseJoi.object({
    biblioteca: Joi.object({
        nombre: Joi.string().required().escapeHTML(),
        localidad: Joi.string().required().escapeHTML(),
        registroConabip: Joi.number().required().min(0),
        telefono: Joi.string().required(),
        opcionesTelefono: Joi.string().valid('Solo llamadas', 'Llamadas y WhatsApp', 'Solo WhatsApp'),
        direccion: Joi.string().required().escapeHTML(),
        actividades: Joi.string().required().escapeHTML(),
        horario: Joi.string().required().escapeHTML(),
        redes: baseJoi.array().items(
            baseJoi.object({
                nombre: baseJoi.string().required(),
                checked: baseJoi.boolean().optional(),
                link: baseJoi.string().allow('').optional() // Permite un string vacío para el link
            }).optional()
        ).optional(),
        catalogoLibros: baseJoi.array().items(
            Joi.string()
        ).optional(),
        // image: joi.string().optional()
        geometry: Joi.object({
            existe: Joi.string().valid('Point').optional(), // Puede ser 'Point', opcional
            coordinates: Joi.array().items(Joi.number()).length(2).optional() // Dos números para longitud y latitud
        }).optional(),
        cuota: Joi.object({
            existe: Joi.boolean().required(),  // Se asegura de que sea booleano
            valor: Joi.number().min(0).when('existe', {
                is: true,
                then: Joi.required()
            }).optional(),
        }).optional(),
    deleteImages: Joi.array(),
    deleteLibros: Joi.array(),
})
});


module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML(),
    }).required()
})

module.exports.libroSchema = Joi.object({
    libro: Joi.object({
        titulo: Joi.string().required().escapeHTML(),
        autor: Joi.string().required().escapeHTML(),
        codigoCat: Joi.string().required().escapeHTML(),
        genero: Joi.string().optional().escapeHTML(),
        publishYear: Joi.number().optional(),
    }).required()
});
