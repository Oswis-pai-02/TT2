const express = require('express');
const router = express.Router();
const Accesibilidad = require('../models/accesibilidad');

// Obtener la lista de accesibilidad
router.get('/', async (req, res) => {
  try {
    const accesibilidadList = await Accesibilidad.find();
    res.json(accesibilidadList);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
