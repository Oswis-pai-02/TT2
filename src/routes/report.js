const express = require('express');
const multer = require('multer');
const router = express.Router();
const reportSchema = require('../models/report');

// Configuración de Multer para manejar la carga de archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//Ruta para subir un reporte
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
        const newReport = new reportSchema({
            descripcion: req.body.descripcion,
            imagen: imagenBuffer,
            contentType: contentType,
            id_usuario: req.body.id_usuario,
            titulo: req.body.titulo,
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
router.post('/report/:reportId/like', async (req, res) => {
    const reportId = req.params.reportId;
    const userId = req.body.userId; // ID del usuario que da like
  
    try {
      const report = await reportSchema.findById(reportId);
  
      if (!report.listaDeUsuariosQueDieronLike.includes(userId)) {
        // Agregar el ID del usuario a la lista de likes y aumentar el contador
        report.listaDeUsuariosQueDieronLike.push(userId);
        report.likes += 1;
        await report.save();
        
        res.status(200).json("Like agregado correctamente." );
      } else {
        // El usuario ya dio like, no hacer nada
        res.status(200).json("El usuario ya dio like a este reporte.");
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  //Ruta para agregar un dislike a un reporte
  router.post('/report/:reportId/dislike', async (req, res) => {
    const reportId = req.params.reportId;
    const userId = req.body.userId; // ID del usuario que da dislike
  
    try {
      const report = await reportSchema.findById(reportId);
  
      if (!report.listaDeUsuariosQueDieronDislike.includes(userId)) {
        // Agregar el ID del usuario a la lista de dislikes y aumentar el contador
        report.listaDeUsuariosQueDieronDislike.push(userId);
        report.dislikes += 1;
        await report.save();
        
        res.status(200).json("Dislike agregado correctamente.");
      } else {
        // El usuario ya dio dislike, no hacer nada
        res.status(200).json("El usuario ya dio dislike a este reporte.");
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });  

  //Ruta para obtener todos los reportes incluyendo filtros
  router.get("/report", (req, res) => {
    // Parámetros de consulta
    const { sort, linea, direccion, estacion } = req.query;
  
    // Construir el objeto de consulta basado en los parámetros proporcionados
    let query = {};
    if (linea) query.linea = linea;
    if (direccion) query.direccion = direccion;
    if (estacion) query.estacion = estacion;
  
    // Inicializar la variable de ordenación
    let sortOption = {};
  
    // Determinar el ordenamiento basado en el parámetro 'sort'
    switch (sort) {
      case 'masVotados':
        sortOption = { likes: -1 }; // Orden descendente por 'likes'
        break;
      case 'menosVotados':
        sortOption = { likes: 1 }; // Orden ascendente por 'likes'
        break;
      default:
        // Si no se especifica, por defecto ordenar por 'fechaHora' descendente
        sortOption = { fechaHora: -1 };
    }
  
    reportSchema
      .find(query)
      .select("_id fechaHora linea estacion direccion id_usuario titulo descripcion imagen likes dislikes listaDeUsuariosQueDieronLike listaDeUsuariosQueDieronDislike")
      .populate('id_usuario', 'nombreCompleto imagenPerfil')
      .sort(sortOption) // Aplicar la opción de ordenamiento
      .then((data) => {
        const reportesTransformados = data.map(reporte => {
          let imagenBase64 = reporte.imagen ? `data:image/jpeg;base64,${reporte.imagen.toString('base64')}` : null;
          let imagenPerfilBase64 = reporte.id_usuario.imagenPerfil ? `data:image/jpeg;base64,${reporte.id_usuario.imagenPerfil.toString('base64')}` : null;
  
          return {
            id: reporte._id,
            fechaHora: reporte.fechaHora,
            linea: reporte.linea,
            estacion: reporte.estacion,
            direccion: reporte.direccion,
            autor: reporte.id_usuario.nombreCompleto,
            titulo: reporte.titulo,
            descripcion: reporte.descripcion,
            imagen: imagenBase64,
            imagenPerfil: imagenPerfilBase64,
            likes: reporte.likes,
            dislikes: reporte.dislikes,
            usuariosQueDieronLike: reporte.listaDeUsuariosQueDieronLike,
            usuariosQueDieronDislike: reporte.listaDeUsuariosQueDieronDislike
          };
        });
  
        res.json(reportesTransformados);
      })
      .catch((error) => res.json({ message: error }));
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
