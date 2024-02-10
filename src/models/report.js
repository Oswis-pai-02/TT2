const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    //id_usuario
    descripcion: { type: String, required: true },
    //fechaHora
    //titulo
    //autor
    //estacion
    //linea
    //direccion
    imagen: { type: Buffer, required: true }, 
    contentType: { type: String, required: true },  
    //listaDeUsuariosQueDieronLike
    likes: { type: Number, default: 0 }, //lista de identificadores de usuarios
    //listaDeUsuariosQueDieronDislike
    dislikes: { type: Number, default: 0 } //lista de identificadores de usuarios
});

module.exports = mongoose.model('reportes', reportSchema);
