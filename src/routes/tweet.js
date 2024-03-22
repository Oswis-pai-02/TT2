// Podría ser parte de tus rutas en un archivo como tweetRoutes.js o donde gestiones las rutas

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Tweet = require('../models/tweet');

// Ruta para cargar tweets desde un archivo JSON a la base de datos
router.post('/loadTweets', async (req, res) => {
  try {
    // Asume que tu archivo JSON está en la raíz del proyecto o ajusta la ruta según sea necesario
    const tweetsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../tweets.json'), 'utf-8'));

    // Insertar los tweets en la base de datos usando el modelo Tweet
    await Tweet.insertMany(tweetsData);
    res.status(200).send('Tweets cargados exitosamente en MongoDB');
  } catch (error) {
    console.error('Error al cargar tweets en MongoDB:', error);
    res.status(500).json({ error: error.message });
  }
});

console.log("Estoy en la ruta de la funcionalidad de obtencion de tweet.");
  
module.exports = router;
