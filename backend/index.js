// ✅ index.js
const express = require('express');
const mongoose = require('mongoose');
const cassandra = require('cassandra-driver');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // 👈 Carga variables del .env

const app = express();
app.use(cors({
  origin: "https://api-rho-eight-93.vercel.app"  // tu frontend
}));
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

// Conexión a Cassandra
const cassandraClient = new cassandra.Client({
  cloud: {
    secureConnectBundle: path.join(__dirname, '..', process.env.ASTRA_DB_BUNDLE_PATH)
  },
  credentials: {
    username: process.env.ASTRA_DB_USERNAME,
    password: process.env.ASTRA_DB_PASSWORD
  },
  keyspace: process.env.KEYSPACE
});

cassandraClient.connect()
  .then(() => console.log('✅ Conectado a Cassandra'))
  .catch(err => console.error('❌ Error conectando a Cassandra:', err));

// MODELO MongoDB
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
// CASO 1 - Visualizaciones (Cassandra)
// ===================
app.post('/caso1', async (req, res) => {
  let { ano_semana, titulo, vistas } = req.body;

  const vistasInt = parseInt(vistas);
  if (
    !ano_semana ||
    !titulo ||
    isNaN(vistasInt) ||
    vistasInt < 0 ||
    vistasInt > Number.MAX_SAFE_INTEGER
  ) {
    return res.status(400).json({
      error: '❌ Datos incompletos o inválidos (vistas debe ser un número entero válido)',
    });
  }

  try {
    const nuevoId = cassandra.types.Uuid.random();

    await cassandraClient.execute(
      `INSERT INTO vistas_por_semana (ano_semana, id_contenido, titulo, vistas)
       VALUES (?, ?, ?, ?)`,
      [ano_semana, nuevoId, titulo, vistasInt], // ✅ vistasInt como número
      { prepare: true }
    );

    res.json({ mensaje: '✅ Registro creado', id_contenido: nuevoId.toString() });
  } catch (error) {
    res.status(500).json({ error: '❌ Error al crear registro', detalle: error.message });
  }
});

app.get('/caso1', async (req, res) => {
  try {
    const result = await cassandraClient.execute(`SELECT * FROM vistas_por_semana`);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: '❌ Error al consultar todos los registros', detalle: error.message });
  }
});

app.get('/caso1/:ano_semana', async (req, res) => {
  const { ano_semana } = req.params;
  try {
    const result = await cassandraClient.execute(
      `SELECT * FROM vistas_por_semana WHERE ano_semana = ?`,
      [ano_semana]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: '❌ Error al consultar registros', detalle: error.message });
  }
});

app.put('/caso1/:ano_semana/:id_contenido', async (req, res) => {
  const { ano_semana: originalSemana, id_contenido } = req.params;
  let { ano_semana: nuevaSemana, titulo, vistas } = req.body;

  const vistasInt = parseInt(vistas);
  if (!titulo || !nuevaSemana || isNaN(vistasInt) || vistasInt < 0) {
    return res.status(400).json({ error: '❌ Datos inválidos para actualizar' });
  }

  try {
    // 1. Eliminar el registro anterior
    await cassandraClient.execute(
      `DELETE FROM vistas_por_semana WHERE ano_semana = ? AND id_contenido = ?`,
      [originalSemana, cassandra.types.Uuid.fromString(id_contenido)],
      { prepare: true }
    );

    // 2. Insertar el nuevo con el nuevo año-semana (se mantiene el mismo id)
    await cassandraClient.execute(
      `INSERT INTO vistas_por_semana (ano_semana, id_contenido, titulo, vistas)
       VALUES (?, ?, ?, ?)`,
      [nuevaSemana, cassandra.types.Uuid.fromString(id_contenido), titulo, vistasInt],
      { prepare: true }
    );

    res.json({ mensaje: '✅ Registro actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: '❌ Error al actualizar', detalle: error.message });
  }
});

app.delete('/caso1/:ano_semana/:id_contenido', async (req, res) => {
  const { ano_semana, id_contenido } = req.params;

  try {
    await cassandraClient.execute(
      `DELETE FROM vistas_por_semana WHERE ano_semana = ? AND id_contenido = ?`,
      [ano_semana, cassandra.types.Uuid.fromString(id_contenido)]
    );
    res.json({ mensaje: '🗑️ Registro eliminado' });
  } catch (error) {
    res.status(500).json({ error: '❌ Error al eliminar registro', detalle: error.message });
  }
});

// ===================
// CASO 2 - Géneros populares por país (Cassandra)
// ===================
app.post('/caso2', async (req, res) => {
  const { pais, genero, visualizaciones } = req.body;

  const visInt = parseInt(visualizaciones);
  if (!pais || !genero || isNaN(visInt) || visInt < 0) {
    return res.status(400).json({ error: '❌ Datos inválidos para insertar.' });
  }

  try {
    await cassandraClient.execute(
      `INSERT INTO generos_por_pais (pais, genero, visualizaciones) VALUES (?, ?, ?)`,
      [pais, genero, visInt],
      { prepare: true }
    );
    res.json({ mensaje: '✅ Género insertado correctamente' });
  } catch (error) {
    res.status(500).json({ error: '❌ Error al insertar género', detalle: error.message });
  }
});

app.get('/caso2/:pais', async (req, res) => {
  try {
    const { pais } = req.params;
    const result = await cassandraClient.execute(
      `SELECT * FROM generos_por_pais WHERE pais = ?`,
      [pais],
      { prepare: true }
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error consultando', detalle: error.message });
  }
});

app.get('/caso2', async (req, res) => {
  try {
    const result = await cassandraClient.execute(`SELECT * FROM generos_por_pais`);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error consultando todos', detalle: error.message });
  }
});

app.put('/caso2/:pais/:genero', async (req, res) => {
  const { pais, genero } = req.params;
  const { visualizaciones } = req.body;

  const visInt = parseInt(visualizaciones);
  if (isNaN(visInt) || visInt < 0) {
    return res.status(400).json({ error: 'Visualizaciones inválidas' });
  }

  try {
    // Borrar y volver a insertar (por cambio de clustering key)
    await cassandraClient.execute(
      `DELETE FROM generos_por_pais WHERE pais = ? AND visualizaciones = ? AND genero = ?`,
      [pais, visInt, genero],
      { prepare: true }
    );

    await cassandraClient.execute(
      `INSERT INTO generos_por_pais (pais, visualizaciones, genero) VALUES (?, ?, ?)`,
      [pais, visInt, genero],
      { prepare: true }
    );

    res.json({ mensaje: '✅ Registro actualizado' });
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando', detalle: error.message });
  }
});

app.delete('/caso2/:pais/:visualizaciones/:genero', async (req, res) => {
  const { pais, visualizaciones, genero } = req.params;

  try {
    await cassandraClient.execute(
      `DELETE FROM generos_por_pais WHERE pais = ? AND visualizaciones = ? AND genero = ?`,
      [pais, parseInt(visualizaciones), genero],
      { prepare: true }
    );
    res.json({ mensaje: '🗑️ Registro eliminado' });
  } catch (error) {
    res.status(500).json({ error: '❌ Error al eliminar', detalle: error.message });
  }
});

// ===================
// CASO 3 - Visualizaciones de una serie específica (Cassandra)
// ===================
// Crear visualización (solo se mandan fecha_visualizacion y id_perfil)
// ===================
app.post('/caso3', async (req, res) => {
  const { fecha_visualizacion, id_perfil } = req.body;

  if (!fecha_visualizacion || !id_perfil) {
    return res.status(400).json({ error: '❌ Debes proporcionar fecha y ID perfil.' });
  }

  try {
    const id_contenido = cassandra.types.Uuid.random();
    const id_visualizacion = cassandra.types.TimeUuid.now();
    const fecha = new Date(fecha_visualizacion);

    await cassandraClient.execute(
      `INSERT INTO visualizaciones_por_contenido (id_contenido, fecha_visualizacion, id_visualizacion, id_perfil)
       VALUES (?, ?, ?, ?)`,
      [id_contenido, fecha, id_visualizacion, cassandra.types.Uuid.fromString(id_perfil)],
      { prepare: true }
    );

    res.json({ mensaje: '✅ Visualización registrada correctamente', id_contenido: id_contenido.toString() });
  } catch (error) {
    res.status(500).json({ error: '❌ Error creando visualización', detalle: error.message });
  }
});

app.get('/caso3/:id_contenido', async (req, res) => {
  const { id_contenido } = req.params;
  const { desde, hasta } = req.query;

  if (!desde || !hasta) {
    return res.status(400).json({ error: '❌ Debes indicar fechas desde y hasta.' });
  }

  try {
    const result = await cassandraClient.execute(
      `SELECT COUNT(*) FROM visualizaciones_por_contenido
       WHERE id_contenido = ?
         AND fecha_visualizacion >= ?
         AND fecha_visualizacion <= ?
       ALLOW FILTERING`,
      [cassandra.types.Uuid.fromString(id_contenido), new Date(desde), new Date(hasta)],
      { prepare: true }
    );

    const cantidad = result.rows[0]['count'];
    res.json({ cantidad });
  } catch (error) {
    res.status(500).json({ error: '❌ Error consultando visualizaciones', detalle: error.message });
  }
});

// Consultar cantidad por ID y fechas
app.post('/caso3/consulta', async (req, res) => {
  const { id_contenido, desde, hasta } = req.body;

  if (!id_contenido || !desde || !hasta) {
    return res.status(400).json({ error: '❌ Faltan parámetros de consulta' });
  }

  try {
    const result = await cassandraClient.execute(
      `SELECT COUNT(*) FROM visualizaciones_por_contenido
       WHERE id_contenido = ? AND fecha_visualizacion >= ? AND fecha_visualizacion <= ? ALLOW FILTERING`,
      [cassandra.types.Uuid.fromString(id_contenido), desde, hasta]
    );

    const cantidad = result.rows[0]['count'];
    res.json({ cantidad });
  } catch (error) {
    res.status(500).json({ error: '❌ Error en la consulta', detalle: error.message });
  }
});

// Eliminar visualización por ID contenido, fecha y visualización
app.delete('/caso3', async (req, res) => {
  const { id_contenido, fecha_visualizacion, id_visualizacion } = req.body;

  if (!id_contenido || !fecha_visualizacion || !id_visualizacion) {
    return res.status(400).json({ error: '❌ Parámetros incompletos para eliminar' });
  }

  try {
    await cassandraClient.execute(
      `DELETE FROM visualizaciones_por_contenido
       WHERE id_contenido = ? AND fecha_visualizacion = ? AND id_visualizacion = ?`,
      [
        cassandra.types.Uuid.fromString(id_contenido),
        fecha_visualizacion,
        cassandra.types.TimeUuid.fromString(id_visualizacion)
      ],
      { prepare: true }
    );

    res.json({ mensaje: '🗑️ Visualización eliminada' });
  } catch (error) {
    res.status(500).json({ error: '❌ Error al eliminar visualización', detalle: error.message });
  }
});

// GET /caso3 - Listar todas o filtrar por id_contenido y fechas
app.get('/caso3', async (req, res) => {
  const { id_contenido, desde, hasta } = req.query;

  try {
    let query = `SELECT * FROM visualizaciones_por_contenido`;
    const params = [];
    const conditions = [];

    if (id_contenido) {
      conditions.push(`id_contenido = ?`);
      params.push(cassandra.types.Uuid.fromString(id_contenido));
    }

    if (desde) {
      conditions.push(`fecha_visualizacion >= ?`);
      params.push(new Date(desde));
    }

    if (hasta) {
      conditions.push(`fecha_visualizacion <= ?`);
      params.push(new Date(hasta));
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')} ALLOW FILTERING`;
    }

    const result = await cassandraClient.execute(query, params, { prepare: true });
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      error: '❌ Error al obtener visualizaciones',
      detalle: error.message,
    });
  }
});

// ✅ Servidor
app.listen(3001, () => {
  console.log('🚀 Backend escuchando en http://localhost:3001');
});

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
// CRUD - Colección Contenido (MongoDB)
// ===================

// Obtener todos los contenidos
app.get('/contenidos', async (req, res) => {
  try {
    const contenidos = await Contenido.find().sort({ cantidad_visualizaciones: -1 });
    res.json(contenidos);
  } catch (error) {
    res.status(500).json({ error: 'Error listando contenidos', detalle: error.message });
  }
});

// Crear nuevo contenido
app.post('/contenidos', async (req, res) => {
  try {
    const nuevo = new Contenido(req.body);
    const guardado = await nuevo.save();
    res.json(guardado);
  } catch (error) {
    res.status(500).json({ error: 'Error creando contenido', detalle: error.message });
  }
});

// Modificar contenido por ID
app.put('/contenidos/:id', async (req, res) => {
  try {
    const actualizado = await Contenido.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando contenido', detalle: error.message });
  }
});

// Eliminar contenido por ID
app.delete('/contenidos/:id', async (req, res) => {
  try {
    await Contenido.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Contenido eliminado correctamente ✅' });
  } catch (error) {
    res.status(500).json({ error: 'Error eliminando contenido', detalle: error.message });
  }
});

// ===================
// CASO 5 - Top 3 dispositivos por país (Cassandra)
// ===================
app.get('/caso5', async (req, res) => {
  try {
    const result = await cassandraClient.execute(`
      SELECT tipo_dispositivo, visualizaciones 
      FROM dispositivos_por_pais 
      WHERE pais = 'Argentina' 
      LIMIT 3
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error en Caso 5', detalle: error.message });
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

// ✅ Levantar servidor
app.listen(3001, () => {
  console.log('🚀 Servidor backend escuchando en puerto 3001');
});
