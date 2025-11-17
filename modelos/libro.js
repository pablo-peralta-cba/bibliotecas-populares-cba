const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Biblioteca = require('./biblioteca');

const libroSchema = new Schema({
  titulo: {
    type: String,
    required: true,
  },
  autor: {
    type: String,
    required: true,
  },
  codigoCat: {
    type: String,
    required: true,
  },
  biblioteca: { type: Schema.Types.ObjectId, ref: 'Biblioteca' },
  genero: String,
  publishYear: Number,
});

module.exports = mongoose.model('Libro', libroSchema);
