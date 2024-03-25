const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Tweet = require('../models/tweet');

// Ruta para obtener los ultimos 10 tweets de la base de datos
router.get('/', async (req, res) => {
    try {
      // Asume que tus documentos tienen un campo 'createdAt' o 'tweetDate' para la fecha del tweet
      // Cambia 'createdAt' por el nombre real del campo de fecha en tu esquema si es necesario
      const tweets = await Tweet.find({})
                                .sort({ tweetDate: -1 }) // Ordena los tweets por fecha en orden descendente
                                .limit(10); // Limita los resultados a los últimos 10 tweets
  
      res.json(tweets);
    } catch (error) {
      console.error('Error al obtener tweets de MongoDB:', error);
      res.json({ error: error.message });
    }
});

module.exports = router;
