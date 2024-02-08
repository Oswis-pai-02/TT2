const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    rol: {
        type: String,
        required: true
    },
    nombreCompleto: {
        type: String,
        required: true
    },
    correo: {
        type: String,
        required: true
    },
    contrasenia: {
        type: String,
        required: true
    },
    fechaDeNacimiento: {
        type: String,
        required: true
    },
    genero: {
        type: String,
        required: true
    }
});


module.exports = mongoose.model('usuarios', userSchema);