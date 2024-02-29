const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const userRoutes = require("./routes/user");
const reportRoutes = require('./routes/report'); 
const cors = require("cors");
const accesibilidadRoutes = require('./routes/accesibilidad');
const estacionesRoutes = require('./routes/estaciones');
const fetchTweets = require('./src/utils/fetchTweets');

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

fetchTweets().then(console.log).catch(console.error);

// routes
app.get("/", (req, res) => {
    res.send("Welcome to my API");
});

//mongodb connection
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("Conectado a mongo"))
    .catch((error) => console.error(error));

app.listen(port, () => console.log("server listening on port", port));
