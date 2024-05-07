const express = require('express');
const multer = require('multer');
const router = express.Router();
const reportSchema = require('../models/report');

// Configuración de Multer para manejar la carga de archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Ruta para gestionar 'like' en un reporte
router.post('/report/:reportId/like', async (req, res) => {
  const { reportId } = req.params;
  const { userId } = req.body;

  try {
      const report = await reportSchema.findById(reportId);
      if (!report) {
          return res.status(404).json("Reporte no encontrado.");
      }

      // Gestionar el cambio de 'dislike' a 'like'
      if (report.listaDeUsuariosQueDieronDislike.includes(userId)) {
          const index = report.listaDeUsuariosQueDieronDislike.indexOf(userId);
          report.listaDeUsuariosQueDieronDislike.splice(index, 1);
          report.dislikes--;
      }

      // Agregar o remover 'like'
      const indexLike = report.listaDeUsuariosQueDieronLike.indexOf(userId);
      if (indexLike === -1) {
          report.listaDeUsuariosQueDieronLike.push(userId);
          report.likes++;
          await report.save();
          res.status(200).json("Like agregado correctamente.");
      } else {
          report.listaDeUsuariosQueDieronLike.splice(indexLike, 1);
          report.likes--;
          await report.save();
          res.status(200).json("Like removido correctamente.");
      }
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Ruta para gestionar 'dislike' en un reporte
router.post('/report/:reportId/dislike', async (req, res) => {
  const { reportId } = req.params;
  const { userId } = req.body;

  try {
      const report = await reportSchema.findById(reportId);
      if (!report) {
          return res.status(404).json("Reporte no encontrado.");
      }

      // Gestionar el cambio de 'like' a 'dislike'
      if (report.listaDeUsuariosQueDieronLike.includes(userId)) {
          const index = report.listaDeUsuariosQueDieronLike.indexOf(userId);
          report.listaDeUsuariosQueDieronLike.splice(index, 1);
          report.likes--;
      }

      // Agregar o remover 'dislike'
      const indexDislike = report.listaDeUsuariosQueDieronDislike.indexOf(userId);
      if (indexDislike === -1) {
          report.listaDeUsuariosQueDieronDislike.push(userId);
          report.dislikes++;
          await report.save();
          res.status(200).json("Dislike agregado correctamente.");
      } else {
          report.listaDeUsuariosQueDieronDislike.splice(indexDislike, 1);
          report.dislikes--;
          await report.save();
          res.status(200).json("Dislike removido correctamente.");
      }
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Ruta para agregar o quitar un dislike a un reporte
router.post('/report/:reportId/dislike', async (req, res) => {
  const reportId = req.params.reportId;
  const userId = req.body.userId;

  try {
      const report = await reportSchema.findById(reportId);
      if (!report) {
          return res.status(404).json("Reporte no encontrado.");
      }

      // Remover like si existe
      const hadLike = report.listaDeUsuariosQueDieronLike.includes(userId);
      if (hadLike) {
          const index = report.listaDeUsuariosQueDieronLike.indexOf(userId);
          report.listaDeUsuariosQueDieronLike.splice(index, 1);
          report.likes--;
      }

      // Agregar o remover dislike
      const indexDislike = report.listaDeUsuariosQueDieronDislike.indexOf(userId);
      if (indexDislike === -1) {
          report.listaDeUsuariosQueDieronDislike.push(userId);
          report.dislikes++;
          await report.save();
          res.status(200).json("Dislike agregado correctamente.");
      } else {
          report.listaDeUsuariosQueDieronDislike.splice(indexDislike, 1);
          report.dislikes--;
          await report.save();
          res.status(200).json("Dislike removido correctamente.");
      }
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});


//Ruta para obtener todos los reportes incluyendo filtros
router.get("/report", (req, res) => {
  // Parámetros de consulta
  const { sort, linea, direccion, estacion, fechaInicio, fechaFin } = req.query;

  // Construir el objeto de consulta basado en los parámetros proporcionados
  let query = {};
  if (linea) query.linea = linea;
  if (direccion) query.direccion = direccion;
  if (estacion) query.estacion = estacion;

  // Filtrar por rango de fecha y hora si se proporcionan ambos parámetros
  if (fechaInicio && fechaFin) {
    query.fechaHora = { $gte: new Date(fechaInicio), $lte: new Date(fechaFin) };
  }

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
  router.delete('/report/:reportId', async (req, res) => {
    const reportId = req.params.reportId;

    try {
      // Busca y elimina el reporte por su ID
      const report = await reportSchema.findByIdAndDelete(reportId);
  
      if (report) {
        res.json("Reporte eliminado con éxito.");
      } else {
        res.json("No se encontró el reporte con ese ID." );
      }
    } catch (error) {
      res.json({ error: error.message });
    }
  });
  
module.exports = router;
