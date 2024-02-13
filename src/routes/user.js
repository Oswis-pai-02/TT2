const express = require("express");
const userSchema = require("../models/user");

const router = express.Router();

// create user
router.post("/users", (req, res) => {
    // Buscar si ya existe un usuario con el mismo correo electrónico
    userSchema.findOne({ correo: req.body.correo })
        .then((existingUser) => {
            console.log(existingUser);
            if (existingUser) {
                // Si el usuario ya existe, enviar un mensaje de error
                return res.json({
                    message: "El correo electrónico ya está registrado. Por favor, use uno diferente."
                });
            }

            // Si el usuario no existe, crear uno nuevo
            const user = new userSchema(req.body);
            user.save()
                .then((savedUser) => res.json({
                    message: "Usuario registrado correctamente",
                    id: savedUser._id // Devuelve el ID del usuario creado
                }))
                .catch((error) => res.json({ message: error.message }));
        })
        .catch((error) => res.json({ message: error.message }));
});

//get users
router.get("/users", (req, res) => {
    userSchema
        .find()
        .select("_id nombreCompleto correo") 
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});

//get a user
router.get("/users/:id", (req, res) => {
    const { id } = req.params;
    userSchema
        .findById(id)
        .select("correo fechaDeNacimiento genero nombreCompleto") 
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
        .then((data)=> res.json("Usuario eliminado de forma correcta"))
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
                res.json({ message: 'Usuario no encontrado' });
            }
        })
        .catch((error) => res.json({ message: error.message }));
});

module.exports = router;