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

  //Ruta para agregar un dislike a un reporte
  router.post('/reportes/:reportId/dislike', async (req, res) => {
    const reportId = req.params.reportId;
    const userId = req.body.userId; // ID del usuario que da dislike
  
    try {
      const report = await Report.findById(reportId);
  
      if (!report.listaDeUsuariosQueDieronDislike.includes(userId)) {
        // Agregar el ID del usuario a la lista de dislikes y aumentar el contador
        report.listaDeUsuariosQueDieronDislike.push(userId);
        report.dislikes += 1;
        await report.save();
        
        res.status(200).json({ message: "Dislike agregado correctamente." });
      } else {
        // El usuario ya dio dislike, no hacer nada
        res.status(200).json({ message: "El usuario ya dio dislike a este reporte." });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });  

  //Ruta para traer la lista de todos los reportes
  router.get('/reportes', async (req, res) => {
    try {
      const reports = await Report.find({}); // Encuentra todos los reportes
      res.status(200).json(reports);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  

module.exports = router;
