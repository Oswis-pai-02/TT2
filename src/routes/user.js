const express = require("express");
const userSchema = require("../models/user");

const router = express.Router();

// create user
router.post("/users", (req, res) => {
    const user = userSchema(req.body);
    user
        .save()
        .then((data)=> res.json(data))
        .catch((error) => res.json({message: error}));
});

//get all users
router.get("/users", (req, res) => {
    userSchema
        .find()
        .then((data)=> res.json(data))
        .catch((error) => res.json({message: error}));
});

//get a user
router.get("/users/:id", (req, res) => {
    const { id } = req.params;
    userSchema
        .findById(id)
        .then((data)=> res.json(data))
        .catch((error) => res.json({message: error}));
});

//update a user
router.put("/users/:id", (req, res) => {
    const { id } = req.params;
    const {rol, nombreCompleto, correo, contrasenia, fechaDeNacimiento, genero } = req.body;
    userSchema
        .updateOne({ _id: id }, { $set: {rol, nombreCompleto, correo, contrasenia, fechaDeNacimiento, genero}})
        .then((data)=> res.json(data))
        .catch((error) => res.json({message: error}));
});

//delete a user
router.delete("/users/:id", (req, res) => {
    const { id } = req.params;
    userSchema
        .findByIdAndDelete(id)
        .then((data)=> res.json(data))
        .catch((error) => res.json({message: error}));
});


// Ruta para obtener la contraseña por correo electrónico
router.get('/recover-password/:correo', (req, res) => {
    const { correo } = req.params;
    userSchema
        .findOne({ correo: correo }) // Usar findOne y pasar el objeto de consulta correcto
        .select('contrasenia -_id') // Solo seleccionar la contraseña y excluir el _id
        .then((user) => {
            if (user) {
                // Devolver solo la contraseña, aunque esto sigue siendo inseguro
                res.json({ contrasenia: user.contrasenia });
            } else {
                // Manejar el caso en que no se encuentre el usuario
                res.status(404).json({ message: 'Usuario no encontrado' });
            }
        })
        .catch((error) => res.status(500).json({ message: error.message }));
});

module.exports = router;