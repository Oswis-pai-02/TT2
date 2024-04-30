const mongoose = require('mongoose');

const afluenciaSchema = new mongoose.Schema({
  linea: { type: String, required: true },
  estacion: { type: String, required: true },
  direccion: { type: String, required: true },
  prediccion: { type: Number, required: true },
  timestamp: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('Afluencia', afluenciaSchema, 'afluencias');