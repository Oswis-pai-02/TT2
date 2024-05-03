const express = require('express');
const router = express.Router();
const Afluencia = require('../models/afluencia');

// Ruta para obtener las afluencias de una línea y dirección específicas
router.post('/', async (req, res) => {
  const { linea, direccion } = req.body;

  const diezMinutosAtras = new Date(new Date().getTime() - 10 * 60000);

  //console.log('Recibido - Linea:', linea, 'Direccion:', direccion);
  //console.log('Tiempo consultado desde:', diezMinutosAtras.toISOString());

  try {
    const afluencias = await Afluencia.aggregate([
      {
        $match: {
          linea: linea,
          direccion: direccion,
          timestamp: { $gte: diezMinutosAtras }
        }
      },
      {
        $lookup: {
          from: 'estaciones',
          localField: 'estacion',
          foreignField: 'estacion',
          as: 'datosEstacion'
        }
      },
      {
        $unwind: '$datosEstacion'
      },
      {
        $lookup: {
          from: 'accesibilidad',  
          localField: 'estacion',
          foreignField: 'title',
          as: 'datosAccesibilidad'
        }
      },
      {
        $unwind: '$datosAccesibilidad'
      },
      {
        $group: {
          _id: "$estacion",
          afluenciaPromedio: {
            $avg: {
              $multiply: [
                { $divide: ["$prediccion", '$datosEstacion.capacidad'] },
                100
              ]
            }
          },
          icono: { $first: "$datosAccesibilidad.icon" } // Asume que cada estación tiene un único ícono asociado
        }
      },
      {
        $project: {
          estacion: "$_id",
          afluencia: {
            $round: ["$afluenciaPromedio", 2]
          },
          icono: 1
        }
      },
      {
        $sort: { estacion: 1 }
      }
    ]);

    console.log('Resultado de la agregación:', afluencias);

    const resultado = afluencias.map(item => ({ estacion: item.estacion, afluencia: item.afluencia, icono: item.icono }));

    res.json(resultado);
  } catch (error) {
    console.error('Error en la agregación:', error);
    res.status(500).json({ message: 'Error al obtener las afluencias', error: error });
  }
});

module.exports = router;