const express = require('express');
const multer = require('multer');
const router = express.Router();
const Report = require('../models/report'); // Asegúrate de reemplazar esto con tu path correcto

// Configuración de Multer para manejar la carga de archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/report', upload.single('imagen'), (req, res) => {

    if (!req.file) {
        return res.status(400).send('No se encontró archivo de imagen.');
    }

    // Crear un nuevo reporte con la imagen recibida
    const newReport = new Report({
        descripcion: req.body.descripcion,
        imagen: req.file.buffer,  // Imagen como Buffer
        contentType: req.file.mimetype  // Tipo MIME de la imagen
    });

    newReport.save()
        .then(report => res.status(201).json(report))
        .catch(err => res.status(500).json({ error: err.message }));
});

module.exports = router;
