const mongoose = require('mongoose');

const tiemposSchema = new mongoose.Schema({
  fechaHoraRegistro: {
    type: Date,
    required: true
  },
  tiempos: {
    type: Map,
    of: String
  }
});

module.exports = mongoose.model('Tiempo', tiemposSchema);