const mongoose = require('mongoose');

const estacionSchema = new mongoose.Schema({
  position: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  estacion: { type: String, required: true },
  direccion: { type: String, required: true },
  linea: { type: String, required: true }
});

module.exports = mongoose.model('estaciones', estacionSchema, 'estaciones');
