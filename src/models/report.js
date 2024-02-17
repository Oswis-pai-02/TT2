const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    descripcion: {
        type: String,
        required: false
    },
    imagen: {
        type: Buffer,
        required: false
    },
    contentType: {
        type: String,
        required: false
    },
    likes: {
        type: Number,
        default: 0
    },
    dislikes: {
        type: Number,
        default: 0
    },
    id_usuario: {
        type: String,
        required: true
    },
    fechaHora: {
        type: Date, 
        required: true
    },
    titulo: {
        type: String,
        required: true
    },
    autor: {
        type: String,
        required: true
    },
    estacion: {
        type: String,
        required: true
    },
    linea: {
        type: String,
        required: true
    },
    direccion: {
        type: String,
        required: true
    },
    listaDeUsuariosQueDieronLike: [{
        type: String, 
    }],
    listaDeUsuariosQueDieronDislike: [{
        type: String,
    }]
});

module.exports = mongoose.model('reportes', reportSchema);
