const express = require("express");
const userSchema = require("../models/user");

const router = express.Router();

// create user
router.post("/users", (req, res) => {
    const user = userSchema(req.body);
    user
        .save()
        .then((savedUser) => res.json({ 
            message: "Usuario registrado correctamente",
            userId: savedUser._id // Devuelve el ID del usuario creado
        }))
        .catch((error) => res.json({ message: error.message }));
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
router.get('/users/getPassword/:correo', (req, res) => {
    const { correo } = req.params;
    userSchema
        .findOne({ correo: correo }) // Usar findOne y pasar el objeto de consulta correcto
        .select('contrasenia') // Solo seleccionar la contraseña, _id se incluye por defecto
        .then((user) => {
            if (user) {
                // Devolver el ID y la contraseña
                res.json({ id: user._id, contrasenia: user.contrasenia });
            } else {
                // Manejar el caso en que no se encuentre el usuario
                res.status(404).json({ message: 'Usuario no encontrado' });
            }
        })
        .catch((error) => res.status(500).json({ message: error.message }));
});

module.exports = router;