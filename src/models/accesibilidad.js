const mongoose = require('mongoose');

const accesibilidadSchema = new mongoose.Schema({
  position: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  title: { type: String, required: true },
  accessibility: { type: String, required: true },
  icon: { type: String, required: true }
});

module.exports = mongoose.model('accesibilidad', accesibilidadSchema);
