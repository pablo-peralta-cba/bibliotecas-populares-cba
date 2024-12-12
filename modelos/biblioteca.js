const { required } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./reviews');
const Libro = require('./libro');

const imageSchema = new Schema({
    url: {
        type: String
    },
    filename: String,
})

// usamos esta funcion para mostrar imagenes chicas en la pagina editar 
imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
})

// necesitamos definir virtuals: true  
// para poder pasar nuestros virtuals al JSON object 
// const opts = { toJSON: { virtuals: true } };



const biblioSchema = new Schema({
    images: [imageSchema],
    description: String,
    nombre: {
        type: String,
        required: true
    },
    localidad: {
        type: String,
        required: true
    },
    direccion: {
        type: String,
        required: true
    },
    actividades: {
        type: [String],
       // required: true
    },
    horario: {
        type: [String],
        required: true
      },
    cuota: {
        type: {
            existe: {
                type: Boolean,
                default: false,
            },
            valor: {
                type: Number,
                min: 0, // Asegura que el valor no sea negativo
                required: function() {
                    return this.cuota && this.cuota.existe; // Solo es requerido si existe la cuota
                },
                
            }
        },
    },
      telefono: {
        type: String, // Cambiado a String para permitir códigos de área
       // required: true,
        validate: {
            validator: function(v) {
                return /^(?:[1-9]\d{2}|[1-9]\d{3})\d{7}$/.test(v); // Valida el formato de código de área y número
            },
            message: props => `${props.value} no es un número de teléfono válido!`
        }
    },
      opcionesTelefono: {
        type: String,
        enum: ['Solo llamadas', 'Llamadas y WhatsApp', 'Solo WhatsApp'],
       // required: true
      },
      redes: [{
        nombre: { type: String, required: true },
        checked: { type: Boolean, default: false },
        link: { type: String, default: '' }
    }],
    // esta parte es la localizacion en el formato indicado de GeoJson 
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            // required: true
        },
        coordinates: {
            type: [Number],
            required: false
        }
    },
    // le agregamos autor para saber quién crea y puede modificar cada biblio/review 
    autor: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    // Acá lo relacionamos con nuestro reviewSchema,
    // agregando un array de ObjectID en cada biblio con comentarios
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review',
    }],
    registroConabip: {
        type: Number,
        required: true
    },
    catalogoLibros: [{ type: Schema.Types.ObjectId, ref: 'Libro' }] // Catálogo de libros
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } }); //acá agregamos la variable opts que nos deja agregar virtuals al JSON

// Esta middleware function sirve para borrar los comentarios
// de una biblio cuando eliminamos ese camping 
biblioSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews,
            }
        })
    }
})



// A este virtual lo creamos para poder agregar Properties
// que se lean en el mapa interactivo al hacer click en cada camping 
biblioSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong> <a href="/bibliotecas/${this._id}">${this.nombre}</a> <strong>
    <p>${this.localidad}...</p>`
});

// Exportar para usar este schema/ modelo en otros docuentos 
module.exports = mongoose.model('Biblioteca', biblioSchema);