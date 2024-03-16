const express = require("express");
const router = express.Router();
const multer = require('multer'); // Multer se usa para manejar form-data, particularmente para la carga de archivos
const userSchema = require("../models/user");

// Configuración de Multer para manejar la carga de archivos
const storage = multer.memoryStorage(); // Guarda los archivos en la memoria como Buffer
const upload = multer({ storage: storage });

//Encriptacion
require('dotenv').config();
const crypto = require('crypto');
const ALGORITHM = process.env.ALGORITHM;
const SECRET_KEY = process.env.SECRET_KEY;

// Función para encriptar texto
function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY, 'hex'), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

// Función para descifrar texto
function decrypt(encryptedText) {
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encrypted = textParts.join(':');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY, 'hex'), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// create user
router.post("/users", (req, res) => {
    userSchema.findOne({ correo: req.body.correo })
        .then((existingUser) => {
            if (existingUser) {
                // Si el usuario ya existe, enviar un mensaje de error
                return res.json({
                    message: "El correo electrónico ya está registrado. Por favor, use uno diferente."
                });
            }

            // Si el usuario no existe, encriptar la contraseña antes de crear uno nuevo
            const encryptedPassword = encrypt(req.body.contrasenia);
            const user = new userSchema({
                ...req.body,
                contrasenia: encryptedPassword // Usa la contraseña encriptada
            });

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
        .select("correo nombreCompleto imagenPerfil")
        .then((data) => {
            const usuariosTransformados = data.map(usuario => {
                // Convertir imagenPerfil de Buffer a Base64 si existe
                let imagenPerfilBase64 = usuario.imagenPerfil ? `data:image/jpeg;base64,${usuario.imagenPerfil.toString('base64')}` : null;

                return {
                    correo: usuario.correo,
                    nombreCompleto: usuario.nombreCompleto,
                    imagenPerfil: imagenPerfilBase64 // Usar la imagen convertida o null si no existe
                };
            });

            res.json(usuariosTransformados); // Enviar los usuarios transformados
        })
        .catch((error) => res.json({ message: error }));
});

//get a user
router.get("/users/:id", (req, res) => {
    const { id } = req.params;
    userSchema
        .findById(id)
        .select("correo fechaDeNacimiento genero nombreCompleto imagenPerfil")
        .then((usuario) => {
            if (!usuario) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }

            // Crear un nuevo objeto para evitar la mutación directa del documento de Mongoose
            const usuarioTransformado = {
                correo: usuario.correo,
                fechaDeNacimiento: usuario.fechaDeNacimiento,
                genero: usuario.genero,
                nombreCompleto: usuario.nombreCompleto,
                imagenPerfil: usuario.imagenPerfil
            };

            // Si la imagen de perfil es un Buffer, se convierte a Base64
            if (Buffer.isBuffer(usuario.imagenPerfil)) {
                // Convierte el Buffer a Base64
                const imagenBase64 = usuario.imagenPerfil.toString('base64');
                // Agrega el prefijo adecuado para que se pueda mostrar como imagen en el frontend
                usuarioTransformado.imagenPerfil = `data:image/jpeg;base64,${imagenBase64}`;
            }

            res.json(usuarioTransformado);
        })
        .catch((error) => res.json({ message: error }));
});

//update a user
router.put("/users/:id", (req, res) => {
    const { id } = req.params;
    // Extraes solo nombreCompleto y contrasenia de req.body
    const { nombreCompleto, contrasenia } = req.body;

    // Actualizas en la base de datos solo los campos nombreCompleto y contrasenia
    userSchema
        .updateOne({ _id: id }, { $set: { nombreCompleto, contrasenia } })
        .then(data => {
            // Verifica si se actualizó algún documento
            if (data.modifiedCount > 0) {
                res.json({ message: "Información actualizada de forma correcta" });
            } else {
                res.json({ message: "No se encontró el usuario o la información es la misma" });
            }
        })
        .catch(error => res.json({ message: error }));
});

//update profile image
router.put("/users/:id/profile-image", upload.single('imagenPerfil'), (req, res) => {
    const { id } = req.params;

    if (!req.file) {
        return res.status(400).json({ message: "No se envió ninguna imagen" });
    }

    const imagenPerfil = req.file.buffer; // Accede al Buffer de la imagen cargada

    // Actualiza en la base de datos el campo imagenPerfil
    userSchema
        .updateOne({ _id: id }, { $set: { imagenPerfil } })
        .then(data => {
            // Verifica si se actualizó algún documento
            if (data.modifiedCount > 0) {
                res.json("Imagen de perfil actualizada de forma correcta" );
            } else {
                res.json("No se encontró el usuario o la imagen de perfil es la misma" );
            }
        })
        .catch(error => res.json({ message: error }));
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
                // Encriptar la contraseña antes de devolverla
                res.json({ id: user._id, contrasenia: user.contrasenia });
            } else {
                res.json({ message: 'Usuario no encontrado' });
            }
        })
        .catch((error) => res.json({ message: error.message }));
});

module.exports = router;