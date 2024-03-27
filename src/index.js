const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./routes/user");
const reportRoutes = require('./routes/report'); 
const accesibilidadRoutes = require('./routes/accesibilidad');
const estacionesRoutes = require('./routes/estaciones');
const tweetRoutes = require('./routes/tweet');
const tiemposRoutes = require('./routes/tiempos');
const fetchTweets = require('./utils/fetchTweets');

const app = express();
const port = process.env.PORT || 9000;

// Configuración de CORS
const corsOptions = {
    origin: 'http://localhost:8100', // Permite solicitudes solo desde este origen
};

app.use(cors(corsOptions)); // Usa el middleware cors con tus opciones

//middleware
app.use(express.json());
app.use('/api', userRoutes);
app.use('/api', reportRoutes);
app.use('/api/accesibilidad', accesibilidadRoutes);
app.use('/api/estaciones', estacionesRoutes);
app.use('/api/tweets', tweetRoutes);
app.use('/api/tiempos', tiemposRoutes);

// routes
app.get("/", (req, res) => {
    res.send("Welcome to my API");
});

//tweets obtencion
fetchTweets().catch(console.error);

//Para ejecutar fetchTweets en intervalos regulares
setInterval(fetchTweets, 1000 * 60 * 5); // Cada 5 minutos

const path = require('path');

// Imprime la ruta absoluta para verificarla
console.log(path.resolve('./src/img/avance.png'));

//mongodb connection
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Conectado a mongo");
    })
    .catch((error) => console.error(error));

app.listen(port, () => console.log(`Servidor corriendo en http://localhost:${port}`));