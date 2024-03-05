const express = require('express');
const router = express.Router();
const Estacion = require('../models/estaciones');

// Obtener la lista de estaciones
router.get('/', async (req, res) => {
  try {
    const estacionesList = await Estacion.find();
    res.json(estacionesList);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
