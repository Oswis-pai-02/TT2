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


// Ruta para obtener todos los reportes incluyendo filtros
router.get("/report", (req, res) => {
  const { sort, linea, direccion, estacion, fechaInicio, fechaFin } = req.query;

  // Construir el objeto de consulta basado en los parámetros proporcionados
  let matchQuery = {};
  if (linea) matchQuery.linea = linea;
  if (direccion) matchQuery.direccion = direccion;
  if (estacion) matchQuery.estacion = estacion;
  if (fechaInicio && fechaFin) {
    matchQuery.fechaHora = { $gte: new Date(fechaInicio), $lte: new Date(fechaFin) };
  }

  // Inicializar la variable de ordenación
  let sortOption = {};

  // Determinar el ordenamiento basado en el parámetro 'sort'
  switch (sort) {
    case 'masLikes':
      sortOption = { "likes": -1 };
      break;
    case 'masDislikes':
      sortOption = { "dislikes": -1 };
      break;
    case 'masInteracciones':
      // Aquí, 'totalInteracciones' es un campo calculado al vuelo
      sortOption = { "totalInteracciones": -1 };
      break;
    default:
      sortOption = { "fechaHora": -1 };
      break;
  }

  // Usar la agregación para sumar likes y dislikes
  reportSchema.aggregate([
    { $match: matchQuery },
    {
      $addFields: {
        totalInteracciones: { $add: ["$likes", "$dislikes"] } // Campo calculado al vuelo
      }
    },
    { $sort: sortOption },
    { $limit: 15 }, // Limitar a los últimos 15 documentos
    {
      $project: {
        _id: 1, fechaHora: 1, linea: 1, estacion: 1, direccion: 1,
        id_usuario: 1, titulo: 1, descripcion: 1, imagen: 1,
        likes: 1, dislikes: 1, listaDeUsuariosQueDieronLike: 1,
        listaDeUsuariosQueDieronDislike: 1
      }
    },
    { $lookup: {
        from: "usuarios", // Asumiendo que la colección de usuarios se llama 'usuarios'
        localField: "id_usuario",
        foreignField: "_id",
        as: "usuario"
    }},
    { $unwind: "$usuario" } // Para aplanar el array de usuarios
  ])
  .then(data => {
    const reportesTransformados = data.map(reporte => {
      let imagenBase64 = reporte.imagen ? `data:image/jpeg;base64,${reporte.imagen.toString('base64')}` : null;
      let imagenPerfilBase64 = reporte.usuario.imagenPerfil ? `data:image/jpeg;base64,${reporte.usuario.imagenPerfil.toString('base64')}` : null;

      return {
        id: reporte._id,
        fechaHora: reporte.fechaHora,
        linea: reporte.linea,
        estacion: reporte.estacion,
        direccion: reporte.direccion,
        autor: reporte.usuario.nombreCompleto,
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
  .catch(error => res.status(500).json({ message: error.message }));
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
