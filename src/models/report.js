const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    descripcion: {
        type: String,
        required: true
    },
    imagen: {
        type: Buffer,
        required: true
    },
    contentType: {
        type: String,
        required: true
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
        type: mongoose.Schema.Types.ObjectId, // Suponiendo que es una referencia a un usuario
        required: true
    },
    fechaHora: {
        type: Date, // Suponiendo que quieres almacenar tanto la fecha como la hora
        required: true
    },
    titulo: {
        type: String,
        required: true
    },
    autor: {
        type: String, // Suponiendo que 'autor' es un nombre o identificador en texto
        required: true
    },
    estacion: {
        type: String, // Suponiendo que 'estacion' se refiere a una estación de metro o similar
        required: true
    },
    linea: {
        type: String, // Suponiendo que 'linea' se refiere a la línea de un metro o autobús
        required: true
    },
    direccion: {
        type: String, // Suponiendo que 'direccion' se refiere a una dirección o un sentido
        required: true
    },
    listaDeUsuariosQueDieronLike: [{
        type: mongoose.Schema.Types.ObjectId, // Suponiendo que es una lista de identificadores de usuarios
        ref: 'Usuario' // Asumiendo que tienes un modelo 'Usuario'
    }],
    listaDeUsuariosQueDieronDislike: [{
        type: mongoose.Schema.Types.ObjectId, // Suponiendo que es una lista de identificadores de usuarios
        ref: 'Usuario' // Asumiendo que tienes un modelo 'Usuario'
    }]
});

module.exports = mongoose.model('reportes', reportSchema);
