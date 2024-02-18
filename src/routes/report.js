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
        .then(report => res.json("Reporte creado de forma exitosa"))
        .catch(err => res.json({ error: err.message }));
});

// Ruta para agregar un like a un reporte
router.post('/reportes/:reportId/like', async (req, res) => {
    const reportId = req.params.reportId;
    const userId = req.body.userId; // ID del usuario que da like
  
    try {
      const report = await Report.findById(reportId);
  
      if (!report.listaDeUsuariosQueDieronLike.includes(userId)) {
        // Agregar el ID del usuario a la lista de likes y aumentar el contador
        report.listaDeUsuariosQueDieronLike.push(userId);
        report.likes += 1;
        await report.save();
        
        res.status(200).json({ message: "Like agregado correctamente." });
      } else {
        // El usuario ya dio like, no hacer nada
        res.status(200).json({ message: "El usuario ya dio like a este reporte." });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

module.exports = router;
