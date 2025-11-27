if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const mongoose = require('mongoose');
const Biblioteca = require('../modelos/biblioteca');
const {
  biblioCba,
  nombre,
  localidad,
  direccion,
  registroConabip,
} = require('./biblios');

const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/publiclib';

mongoose.connect(dbUrl);

const seedDB = async () => {
  await Biblioteca.deleteMany({});
  for (const biblio of biblioCba) {
    const nuevaBiblio = new Biblioteca({
      nombre: biblio.nombre,
      localidad: biblio.localidad,
      direccion: biblio.direccion,
      registroConabip: biblio.registroConabip,
    });
    await nuevaBiblio.save();
  }

  console.log('Base de datos inicializada con éxito.');
};

seedDB()
  .catch((err) => {
    console.error('Error al inicializar la base de datos:', err);
  })
  .finally(() => {
    mongoose.connection.close();
  });
