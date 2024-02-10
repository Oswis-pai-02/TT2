const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    descripcion: { type: String, required: true },
    imagen: { type: Buffer, required: true },  // Almacenar la imagen como Buffer
    contentType: { type: String, required: true },  // Tipo MIME de la imagen
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 }
});

module.exports = mongoose.model('Report', reportSchema);
