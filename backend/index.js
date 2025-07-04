const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: "https://api-rho-eight-93.vercel.app"
}));
app.use(express.json());

// ✅ Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

// ✅ MODELO MongoDB
const Contenido = mongoose.model('Contenido', new mongoose.Schema({
  titulo: String,
  generos: [String],
  es_pelicula: Boolean,
  anio: Number,
  descripcion: String,
  duracion_minutos: Number,
  cantidad_visualizaciones: Number,
  calificacion_promedio: Number,
  cantidad_calificaciones: Number
}));

// ===================
// CASO 4 - Contenidos con +1000 visualizaciones (MongoDB)
// ===================
app.get('/caso4', async (req, res) => {
  try {
    const anio = parseInt(req.query.anio) || 2025;

    const resultados = await Contenido.find(
      {
        anio,
        cantidad_visualizaciones: { $gt: 1000 }
      },
      {
        titulo: 1,
        generos: 1,
        cantidad_visualizaciones: 1
      }
    ).sort({ cantidad_visualizaciones: -1 });

    res.json(resultados);
  } catch (error) {
    res.status(500).json({ error: 'Error en Caso 4', detalle: error.message });
  }
});

// ===================
// CASO 6 - Series con mejor calificación (MongoDB)
// ===================
app.get('/caso6', async (req, res) => {
  try {
    const min = parseInt(req.query.min) || 10;

    const resultados = await Contenido.find(
      {
        es_pelicula: false,
        cantidad_calificaciones: { $gte: min }
      },
      {
        titulo: 1,
        calificacion_promedio: 1,
        cantidad_calificaciones: 1
      }
    ).sort({ calificacion_promedio: -1 }).limit(5);

    res.json(resultados);
  } catch (error) {
    res.status(500).json({ error: 'Error en Caso 6', detalle: error.message });
  }
});

// ===================
// CRUD completo para MongoDB (opcional)
// ===================
app.get('/contenidos', async (req, res) => {
  try {
    const contenidos = await Contenido.find().sort({ cantidad_visualizaciones: -1 });
    res.json(contenidos);
  } catch (error) {
    res.status(500).json({ error: 'Error listando contenidos', detalle: error.message });
  }
});

app.post('/contenidos', async (req, res) => {
  try {
    const nuevo = new Contenido(req.body);
    const guardado = await nuevo.save();
    res.json(guardado);
  } catch (error) {
    res.status(500).json({ error: 'Error creando contenido', detalle: error.message });
  }
});

app.put('/contenidos/:id', async (req, res) => {
  try {
    const actualizado = await Contenido.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando contenido', detalle: error.message });
  }
});

app.delete('/contenidos/:id', async (req, res) => {
  try {
    await Contenido.findByIdAndDelete(req.params.id);
    res.json({ mensaje: '✅ Contenido eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error eliminando contenido', detalle: error.message });
  }
});

// ✅ Iniciar servidor
app.listen(3001, () => {
  console.log('🚀 Servidor backend escuchando en puerto 3001');
});
