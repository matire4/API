// ✅ index.js
const express = require('express');
const mongoose = require('mongoose');
const cassandra = require('cassandra-driver');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

// Cassandra
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

/* ========== CASO 1: TITULOS MAS VISTOS POR SEMANA ========== */
app.post('/caso1', async (req, res) => {
  const { ano_semana, id_contenido, titulo, vistas } = req.body;
  try {
    await cassandraClient.execute(
      `INSERT INTO titulos_mas_vistos_por_semana (ano_semana, id_contenido, titulo, vistas) VALUES (?, ?, ?, ?)`,
      [ano_semana, cassandra.types.Uuid.fromString(id_contenido), titulo, parseInt(vistas)],
      { prepare: true }
    );
    res.sendStatus(201);
  } catch (error) {
    console.error('❌ Error al insertar en caso1:', error);
    res.sendStatus(500);
  }
});

app.get('/caso1', async (req, res) => {
  const { semana } = req.query;
  try {
    let query = `SELECT * FROM titulos_mas_vistos_por_semana`;
    const params = [];
    if (semana) {
      query += ` WHERE ano_semana = ?`;
      params.push(semana);
    }
    const result = await cassandraClient.execute(query, params, { prepare: true });
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al consultar en caso1:', error);
    res.sendStatus(500);
  }
});

app.put('/caso1', async (req, res) => {
  const { ano_semana, id_contenido, titulo, vistas } = req.body;
  try {
    await cassandraClient.execute(
      `UPDATE titulos_mas_vistos_por_semana SET titulo = ?, vistas = ? WHERE ano_semana = ? AND id_contenido = ?`,
      [titulo, parseInt(vistas), ano_semana, cassandra.types.Uuid.fromString(id_contenido)],
      { prepare: true }
    );
    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Error al actualizar en caso1:', error);
    res.sendStatus(500);
  }
});

app.delete('/caso1', async (req, res) => {
  const { ano_semana, id_contenido } = req.body;
  try {
    await cassandraClient.execute(
      `DELETE FROM titulos_mas_vistos_por_semana WHERE ano_semana = ? AND id_contenido = ?`,
      [ano_semana, cassandra.types.Uuid.fromString(id_contenido)],
      { prepare: true }
    );
    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Error al eliminar en caso1:', error);
    res.sendStatus(500);
  }
});

/* ========== CASO 2: GENEROS POPULARES POR PAIS ========== */
app.post('/caso2', async (req, res) => {
  const { pais, genero, visualizaciones } = req.body;
  try {
    await cassandraClient.execute(
      `INSERT INTO generos_por_pais (pais, genero, visualizaciones) VALUES (?, ?, ?)`,
      [pais, genero, parseInt(visualizaciones)],
      { prepare: true }
    );
    res.sendStatus(201);
  } catch (error) {
    console.error('❌ Error al insertar en caso2:', error);
    res.sendStatus(500);
  }
});

app.get('/caso2', async (req, res) => {
  const { pais } = req.query;
  try {
    const result = await cassandraClient.execute(
      `SELECT * FROM generos_por_pais WHERE pais = ?`,
      [pais],
      { prepare: true }
    );
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al consultar en caso2:', error);
    res.sendStatus(500);
  }
});

app.put('/caso2', async (req, res) => {
  const { pais, genero, visualizaciones } = req.body;
  try {
    await cassandraClient.execute(
      `UPDATE generos_por_pais SET visualizaciones = ? WHERE pais = ? AND visualizaciones = ? AND genero = ?`,
      [parseInt(visualizaciones), pais, parseInt(visualizaciones), genero],
      { prepare: true }
    );
    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Error al actualizar en caso2:', error);
    res.sendStatus(500);
  }
});

app.delete('/caso2', async (req, res) => {
  const { pais, genero, visualizaciones } = req.body;
  try {
    await cassandraClient.execute(
      `DELETE FROM generos_por_pais WHERE pais = ? AND visualizaciones = ? AND genero = ?`,
      [pais, parseInt(visualizaciones), genero],
      { prepare: true }
    );
    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Error al eliminar en caso2:', error);
    res.sendStatus(500);
  }
});

/* ========== CASO 3: VISUALIZACIONES POR CONTENIDO ========== */
app.post('/caso3', async (req, res) => {
  const { id_contenido, fecha_visualizacion, id_visualizacion, id_perfil } = req.body;
  try {
    await cassandraClient.execute(
      `INSERT INTO visualizaciones_por_contenido (id_contenido, fecha_visualizacion, id_visualizacion, id_perfil) VALUES (?, ?, ?, ?)`,
      [
        cassandra.types.Uuid.fromString(id_contenido),
        new Date(fecha_visualizacion),
        cassandra.types.TimeUuid.fromString(id_visualizacion),
        cassandra.types.Uuid.fromString(id_perfil)
      ],
      { prepare: true }
    );
    res.sendStatus(201);
  } catch (error) {
    console.error('❌ Error al insertar en caso3:', error);
    res.sendStatus(500);
  }
});

app.get('/caso3', async (req, res) => {
  const { id_contenido, fecha_inicio, fecha_fin } = req.query;
  try {
    const result = await cassandraClient.execute(
      `SELECT COUNT(*) FROM visualizaciones_por_contenido WHERE id_contenido = ? AND fecha_visualizacion >= ? AND fecha_visualizacion <= ?`,
      [
        cassandra.types.Uuid.fromString(id_contenido),
        new Date(fecha_inicio),
        new Date(fecha_fin)
      ],
      { prepare: true }
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al consultar en caso3:', error);
    res.sendStatus(500);
  }
});

app.delete('/caso3', async (req, res) => {
  const { id_contenido, fecha_visualizacion, id_visualizacion } = req.body;
  try {
    await cassandraClient.execute(
      `DELETE FROM visualizaciones_por_contenido WHERE id_contenido = ? AND fecha_visualizacion = ? AND id_visualizacion = ?`,
      [
        cassandra.types.Uuid.fromString(id_contenido),
        new Date(fecha_visualizacion),
        cassandra.types.TimeUuid.fromString(id_visualizacion)
      ],
      { prepare: true }
    );
    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Error al eliminar en caso3:', error);
    res.sendStatus(500);
  }
});

app.listen(3001, () => {
  console.log('🚀 Servidor backend escuchando en puerto 3001');
});

// ===================
// CASO 4 - Contenidos con +1000 visualizaciones (MongoDB)
// ===================
app.get('/caso4', async (req, res) => {
  try {
    const resultados = await Contenido.find(
      { anio: 2025, cantidad_visualizaciones: { $gt: 1000 } },
      { titulo: 1, generos: 1, cantidad_visualizaciones: 1 }
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
    const N = 10;
    const resultados = await Contenido.find(
      { es_pelicula: false, cantidad_calificaciones: { $gte: N } },
      { titulo: 1, calificacion_promedio: 1, cantidad_calificaciones: 1 }
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
