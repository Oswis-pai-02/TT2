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
  
  //Eliminar reportes con su id
  router.delete('/reportes/:reportId', async (req, res) => {
    const reportId = req.params.reportId;
  
    try {
      // Busca y elimina el reporte por su ID
      const report = await Report.findByIdAndRemove(reportId);
  
      if (report) {
        res.status(200).json({ message: "Reporte eliminado con éxito." });
      } else {
        res.status(404).json({ message: "No se encontró el reporte con ese ID." });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  //Obtener reportes con diferentes filtros (linea, estacion, direccion, mas votados) segun admin
  router.get('/reportes', async (req, res) => {
    // Obtener los parámetros de filtro de la consulta
    const { linea, estacion, direccion, masVotados } = req.query;
  
    // Crear un objeto de filtro basado en los parámetros linea, estacion, direccion, mas votados aqui ya esta la logica 
    let filtro = {};
    if (linea) {
      filtro.linea = linea;
    }
    if (estacion) {
      filtro.estacion = estacion;
    }
    if (direccion) {
      filtro.direccion = direccion;
    }
  
    try {
      let reports;
      if (masVotados) {
        // Obtener los reportes más votados (likes - dislikes) obtenidos del anterior
        reports = await Report.find(filtro).sort({ 'likes': -1 }); // Ordena por likes en orden descendente 
      } else {
        // Obtener los reportes basados en los filtros linea, estacion, direccion, mas votados
        reports = await Report.find(filtro);
      }
      res.status(200).json(reports);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  

module.exports = router;
