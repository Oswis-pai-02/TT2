const express = require('express');
const router = express.Router();
const Tiempo = require('../models/tiempos');

// Ruta para obtener el último registro de tiempo de la base de datos
router.get('/', async (req, res) => {
    try {
      const ultimoTiempo = await Tiempo.findOne({})
                                       .sort({ fechaHoraRegistro: -1 }) // Ordena los registros por fecha en orden descendente
                                       .limit(1); // Limita los resultados al último registro

      if (ultimoTiempo) {
        res.json(ultimoTiempo);
      } else {
        res.json("No se encontraron registros de tiempo.");
      }
    } catch (error) {
     
      res.json(error.message);
    }
});

module.exports = router;