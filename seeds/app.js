if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const mongoose = require('mongoose');
const Biblioteca = require('../modelos/biblioteca');
const { biblioCba } = require('./biblios');

const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/publiclib';

mongoose.connect(dbUrl);

const seedDB = async () => {
  let created = 0;
  let updated = 0;

  for (const biblio of biblioCba) {
    const result = await Biblioteca.updateOne(
      { registroConabip: biblio.registroConabip },
      {
        $set: {
          nombre: biblio.nombre,
          localidad: biblio.localidad,
          direccion: biblio.direccion,
          ...(biblio.geometry && { geometry: biblio.geometry }),
          ...(biblio.redes && { redes: biblio.redes }),
        },
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      created++;
    } else if (result.modifiedCount > 0) {
      updated++;
    }
  }

  console.log(`Seed completado: ${created} creadas, ${updated} actualizadas, ${biblioCba.length - created - updated} sin cambios.`);
};

seedDB()
  .catch((err) => {
    console.error('Error al inicializar la base de datos:', err);
  })
  .finally(() => {
    mongoose.connection.close();
  });
