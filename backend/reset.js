const mongoose = require('mongoose');
require('dotenv').config(); // lee MONGODB_URI del .env

const MONGODB_URI = process.env.MONGODB_URI;

const contenidoSchema = new mongoose.Schema({
  titulo: String,
  generos: [String],
  es_pelicula: Boolean,
  anio: Number,
  descripcion: String,
  duracion_minutos: Number,
  cantidad_visualizaciones: Number,
  calificacion_promedio: Number,
  cantidad_calificaciones: Number
});

const Contenido = mongoose.model('Contenido', contenidoSchema);

async function resetDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Conectado a MongoDB");

    const result = await Contenido.deleteMany({});
    console.log(`🗑️ ${result.deletedCount} documentos eliminados de la colección 'contenidos'`);

    mongoose.disconnect();
    console.log("🔌 Desconectado de MongoDB");
  } catch (error) {
    console.error("❌ Error reseteando datos:", error);
  }
}

resetDB();
