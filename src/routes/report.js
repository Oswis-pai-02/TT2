const express = require('express');
const multer = require('multer');
const router = express.Router();
const Report = require('../models/report');

// Configuración de Multer para manejar la carga de archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/report', upload.single('imagen'), async (req, res) => {
    try {
        let imagenBuffer = null;
        let contentType = null;

        // Verificar si se proporcionó una imagen en la solicitud
        if (req.file) {
            imagenBuffer = req.file.buffer;
            contentType = req.file.mimetype;
        }

        // Calcular la fecha y hora actual
        const fechaHoraActual = new Date();

        // Crear un nuevo reporte con la información proporcionada en la solicitud
        const newReport = new Report({
            descripcion: req.body.descripcion,
            imagen: imagenBuffer,
            contentType: contentType,
            id_usuario: req.body.id_usuario,
            titulo: req.body.titulo,
            autor: req.body.autor,
            estacion: req.body.estacion,
            linea: req.body.linea,
            direccion: req.body.direccion,
            fechaHora: fechaHoraActual
        });

        // Guardar el nuevo reporte en la base de datos
        await newReport.save();

        res.json("Reporte creado de forma exitosa");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
