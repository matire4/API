const mongoose = require('mongoose');
require('dotenv').config(); // para leer MONGODB_URI

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


const datos = [
    {
        "titulo": "The Witcher",
        "generos": ["Fantasía", "Acción"],
        "es_pelicula": false,
        "anio": 2025,
        "descripcion": "Una historia épica de monstruos y magia.",
        "duracion_minutos": 60,
        "cantidad_visualizaciones": 1456,
        "calificacion_promedio": 4.75,
        "cantidad_calificaciones": 320
    },
    {
        "titulo": "Inception",
        "generos": ["Ciencia ficción", "Suspenso"],
        "es_pelicula": true,
        "anio": 2010,
        "descripcion": "Un ladrón que roba secretos del subconsciente.",
        "duracion_minutos": 148,
        "cantidad_visualizaciones": 23452,
        "calificacion_promedio": 4.8,
        "cantidad_calificaciones": 4500
    },
    {
        "titulo": "Breaking Bad",
        "generos": ["Drama", "Crimen"],
        "es_pelicula": false,
        "anio": 2008,
        "descripcion": "Un profesor de química se convierte en narcotraficante.",
        "duracion_minutos": 47,
        "cantidad_visualizaciones": 32100,
        "calificacion_promedio": 4.95,
        "cantidad_calificaciones": 6100
    },
    {
        "titulo": "Interstellar",
        "generos": ["Ciencia ficción", "Drama"],
        "es_pelicula": true,
        "anio": 2014,
        "descripcion": "Un grupo de astronautas viaja más allá de la galaxia.",
        "duracion_minutos": 169,
        "cantidad_visualizaciones": 19876,
        "calificacion_promedio": 4.7,
        "cantidad_calificaciones": 3900
    },
    {
        "titulo": "Stranger Things",
        "generos": ["Fantasía", "Terror"],
        "es_pelicula": false,
        "anio": 2016,
        "descripcion": "Niños enfrentan eventos paranormales en su ciudad.",
        "duracion_minutos": 50,
        "cantidad_visualizaciones": 27654,
        "calificacion_promedio": 4.6,
        "cantidad_calificaciones": 5200
    },
    {
        "titulo": "Avatar: El Camino del Agua",
        "generos": ["Aventura", "Fantasía"],
        "es_pelicula": true,
        "anio": 2022,
        "descripcion": "Una nueva amenaza llega a Pandora.",
        "duracion_minutos": 192,
        "cantidad_visualizaciones": 30420,
        "calificacion_promedio": 4.4,
        "cantidad_calificaciones": 4700
    },
    {
        "titulo": "Dark",
        "generos": ["Ciencia ficción", "Misterio"],
        "es_pelicula": false,
        "anio": 2017,
        "descripcion": "Viajes en el tiempo y secretos familiares en Alemania.",
        "duracion_minutos": 55,
        "cantidad_visualizaciones": 18900,
        "calificacion_promedio": 4.85,
        "cantidad_calificaciones": 3700
    },
    {
        "titulo": "John Wick",
        "generos": ["Acción", "Crimen"],
        "es_pelicula": true,
        "anio": 2014,
        "descripcion": "Un asesino a sueldo vuelve a la acción por venganza.",
        "duracion_minutos": 101,
        "cantidad_visualizaciones": 25670,
        "calificacion_promedio": 4.6,
        "cantidad_calificaciones": 4100
    },
    {
        "titulo": "The Crown",
        "generos": ["Drama", "Histórico"],
        "es_pelicula": false,
        "anio": 2016,
        "descripcion": "La vida de la Reina Isabel II desde su juventud.",
        "duracion_minutos": 58,
        "cantidad_visualizaciones": 10900,
        "calificacion_promedio": 4.4,
        "cantidad_calificaciones": 2100
    },
    {
        "titulo": "Parasite",
        "generos": ["Drama", "Suspenso"],
        "es_pelicula": true,
        "anio": 2019,
        "descripcion": "Dos familias enfrentadas por desigualdad social.",
        "duracion_minutos": 132,
        "cantidad_visualizaciones": 21300,
        "calificacion_promedio": 4.9,
        "cantidad_calificaciones": 4300
    },
    {
        "titulo": "Chernobyl",
        "generos": ["Drama", "Histórico"],
        "es_pelicula": false,
        "anio": 2019,
        "descripcion": "Recreación de la catástrofe nuclear de 1986.",
        "duracion_minutos": 62,
        "cantidad_visualizaciones": 11750,
        "calificacion_promedio": 4.85,
        "cantidad_calificaciones": 2500
    },
    {
        "titulo": "Oppenheimer",
        "generos": ["Biografía", "Drama"],
        "es_pelicula": true,
        "anio": 2023,
        "descripcion": "El creador de la bomba atómica frente a sus dilemas.",
        "duracion_minutos": 180,
        "cantidad_visualizaciones": 19900,
        "calificacion_promedio": 4.7,
        "cantidad_calificaciones": 3900
    },
    {
        "titulo": "House of the Dragon",
        "generos": ["Fantasía", "Drama"],
        "es_pelicula": false,
        "anio": 2022,
        "descripcion": "La casa Targaryen antes de la caída del trono.",
        "duracion_minutos": 55,
        "cantidad_visualizaciones": 27600,
        "calificacion_promedio": 4.65,
        "cantidad_calificaciones": 4800
    },
    {
        "titulo": "Matrix",
        "generos": ["Ciencia ficción", "Acción"],
        "es_pelicula": true,
        "anio": 1999,
        "descripcion": "Un hacker descubre la realidad detrás del mundo.",
        "duracion_minutos": 136,
        "cantidad_visualizaciones": 38500,
        "calificacion_promedio": 4.9,
        "cantidad_calificaciones": 7200
    },
    {
        "titulo": "The Mandalorian",
        "generos": ["Aventura", "Ciencia ficción"],
        "es_pelicula": false,
        "anio": 2019,
        "descripcion": "Un cazarrecompensas recorre el universo con un misterioso niño.",
        "duracion_minutos": 40,
        "cantidad_visualizaciones": 22850,
        "calificacion_promedio": 4.7,
        "cantidad_calificaciones": 4300
    }
];


async function seedDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Conectado a MongoDB");
    
        await Contenido.deleteMany({});
        console.log("🗑️ Base limpia");
    
        await Contenido.insertMany(datos);
        console.log("🌱 Datos precargados exitosamente");
    
        mongoose.disconnect();
        console.log("🔌 Desconectado de MongoDB");
    } catch (error) {
        console.error("❌ Error cargando datos:", error);
    }
    }
    
    seedDB();