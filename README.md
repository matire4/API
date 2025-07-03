# 🎬 Netflix Analytics - Proyecto NoSQL (MongoDB y Cassandra)

Este proyecto permite visualizar y gestionar información de títulos, géneros y visualizaciones utilizando bases de datos NoSQL: MongoDB y Cassandra.
Trabajo de Ingeniria de Datos 2

---

## 📁 Estructura del proyecto

```bash
proyecto-nosql/
├── backend/
│ ├── index.js
│ ├── cassandra.js
│ ├── package.json
│ └── .env ❌ (NO subir este archivo, contiene credenciales)
├── frontend/
│ ├── index.html
│ ├── style.css
│ ├── script.js
│ └── app.js
└── .gitignore
```

---

## 🔧 Requisitos para correr localmente

### 1. Instalar Node.js
Descargar desde: https://nodejs.org

Verificá con:

```bash
node -v
npm -v
```

### 2. Clonar el repositorio
```bash
git clone https://github.com/matire4/API.git
cd API/backend
```

### 3. Instalar dependencias
```bash
npm install
```

### 4. Crear archivo .env en backend/
```bash
MONGODB_URI=mongodb+srv://...
ASTRA_DB_BUNDLE_PATH=secure-connect-netflix-cassandra.zip
ASTRA_DB_USERNAME=token
ASTRA_DB_PASSWORD=tu_token_cassandra
KEYSPACE=prueba
```
💡 Importante: Debés descargar el archivo secure-connect-netflix-cassandra.zip desde Astra DB y ubicarlo en la raíz del proyecto o donde lo indique ASTRA_DB_BUNDLE_PATH.

▶️ Correr el backend localmente
```bash
npm start
```
El servidor debería levantar en:
```bash
http://localhost:3001
```

🌐 Conexión del frontend
Si estás trabajando local: asegurate de que script.js apunte a http://localhost:3001/....
Si estás usando la versión online: usá el backend en Render:
```bash
fetch("https://netflix-backend-qbml.onrender.com/caso1")
```

🚀 Deploy
- Backend: Render
- Frontend: Vercel (usá la carpeta frontend/ como root del proyecto)

📦 Dependencias del backend
```bash
"dependencies": {
  "cors": "^2.8.5",
  "dotenv": "^17.0.1",
  "express": "^4.18.2",
  "mongoose": "^7.6.1",
  "cassandra-driver": "^4.6.3"
}
```

❌ Agregar al .gitignore
```bash
node_modules/
.env
*.zip
```

🔑 Recordá
- Tener tu IP whitelistada en MongoDB Atlas.
- Usar dotenv para cargar las variables correctamente.
- Asegurarte de que los fetch() en el frontend apunten al entorno correcto.
