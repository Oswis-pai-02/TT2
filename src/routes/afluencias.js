const express = require('express');
const router = express.Router();
const Afluencia = require('../models/afluencia');

// Ruta para obtener las afluencias de una línea y dirección específicas
router.post('/', async (req, res) => {
  const { linea, direccion } = req.body;

  const diezMinutosAtras = new Date(new Date().getTime() - 10 * 60000);

  try {
    // Primero, obtener las afluencias de los últimos 10 minutos
    let afluencias = await Afluencia.aggregate([
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
          icono: { $first: "$datosAccesibilidad.icon" }
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

    // Crear un set de estaciones que ya tienen afluencias recientes
    const estacionesConAfluenciasRecientes = new Set(afluencias.map(item => item.estacion));

    // Obtener el último registro existente para estaciones que no tienen afluencias recientes
    const estacionesSinAfluenciasRecientes = await Afluencia.aggregate([
      {
        $match: {
          linea: linea,
          direccion: direccion,
          estacion: { $nin: Array.from(estacionesConAfluenciasRecientes) }
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: "$estacion",
          ultimoRegistro: { $first: "$$ROOT" }
        }
      },
      {
        $lookup: {
          from: 'estaciones',
          localField: 'ultimoRegistro.estacion',
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
          localField: 'ultimoRegistro.estacion',
          foreignField: 'title',
          as: 'datosAccesibilidad'
        }
      },
      {
        $unwind: '$datosAccesibilidad'
      },
      {
        $project: {
          estacion: "$ultimoRegistro.estacion",
          afluencia: {
            $round: [
              {
                $multiply: [
                  { $divide: ["$ultimoRegistro.prediccion", '$datosEstacion.capacidad'] },
                  100
                ]
              },
              2
            ]
          },
          icono: "$datosAccesibilidad.icon"
        }
      },
      {
        $sort: { estacion: 1 }
      }
    ]);

    // Combinar los resultados
    const resultado = [
      ...afluencias.map(item => ({ estacion: item.estacion, afluencia: item.afluencia, icono: item.icono })),
      ...estacionesSinAfluenciasRecientes.map(item => ({ estacion: item.estacion, afluencia: item.afluencia, icono: item.icono }))
    ];

    res.json(resultado);
  } catch (error) {
    console.error('Error en la agregación:', error);
    res.status(500).json({ message: 'Error al obtener las afluencias', error: error });
  }
});

module.exports = router;
