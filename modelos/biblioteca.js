const { required } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./reviews');
const Libro = require('./libro');

const imageSchema = new Schema({
  url: {
    type: String,
  },
  filename: {
    type: String,
  },
  secure_url: {
    type: String,
  },
  public_id: {
    type: String, //ID público de Cloudinary
  },
});

imageSchema.virtual('thumbnail').get(function () {
  return this.url.replace('/upload', '/upload/w_200');
});

const biblioSchema = new Schema(
  {
    images: [imageSchema],
    description: String,
    nombre: {
      type: String,
      required: true,
    },
    localidad: {
      type: String,
      required: true,
    },
    direccion: {
      type: String,
      required: true,
    },
    actividades: {
      type: [String],
    },
    horario: {
      type: [String],
      required: true,
    },
    cuota: {
      type: Number,
      min: 0,
      required: true,
    },
    telefono: {
      type: String,
      validate: {
        validator: function (v) {
          return /^(?:[1-9]\d{2}|[1-9]\d{3})\d{7}$/.test(v);
        },
        message: (props) =>
          `${props.value} no es un número de teléfono válido!`,
      },
    },
    opcionesTelefono: {
      type: String,
      enum: ['Solo llamadas', 'Llamadas y WhatsApp', 'Solo WhatsApp'],
    },
    redes: [
      {
        nombre: { type: String, required: true },
        checked: { type: Boolean, default: false },
        link: { type: String, default: '' },
      },
    ],
    geometry: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        required: false,
      },
    },
    autor: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
    },
    // Acá lo relacionamos con nuestro reviewSchema
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
    registroConabip: {
      type: Number,
      required: true,
    },
    catalogoLibros: [{ type: Schema.Types.ObjectId, ref: 'Libro' }],
    deleteImages: [String],
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

biblioSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});

biblioSchema.virtual('properties.popUpMarkup').get(function () {
  return `
    <strong> <a href="/bibliotecas/${this._id}">${this.nombre}</a> <strong>
    <p>${this.localidad}...</p>`;
});

module.exports = mongoose.model('Biblioteca', biblioSchema);
