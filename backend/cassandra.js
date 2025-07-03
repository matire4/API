const cassandra = require('cassandra-driver');

const client = new cassandra.Client({
  cloud: {
    secureConnectBundle: './secure-connect-netflix-cassandra', // asegúrate que este nombre coincide con tu carpeta
  },
  credentials: {
    username: 'token',
    password: 'AstraCS:ON3HTN8UWrOKoTzM3BQ1aWse', // reemplazado con tu token real
  },
  keyspace: 'streaming', // este nombre lo definiste cuando creaste la base en Astra
});

module.exports = client;
