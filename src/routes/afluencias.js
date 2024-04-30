const express = require('express');
const router = express.Router();
const Afluencia = require('../models/afluencia');

// Ruta para obtener las afluencias de una línea y dirección específicas
router.get('/afluencias/:linea/:direccion', async (req, res) => {
  const { linea, direccion } = req.params;
  const diezMinutosAtras = new Date(new Date() - 10 * 60000); // Hora actual menos 10 minutos

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
          from: 'estaciones', // Nombre de la colección de estaciones
          localField: 'estacion', // Campo en la colección de afluencias
          foreignField: 'estacion', // Campo en la colección de estaciones
          as: 'datosEstacion'
        }
      },
      {
        $unwind: '$datosEstacion' // Necesario para acceder a los datos de estaciones
      },
      {
        $project: {
          estacion: "$estacion",
          afluencia: {
            $round: [
              {
                $multiply: [
                  { $divide: [{ $avg: "$prediccion" }, '$datosEstacion.capacidad'] },
                  100
                ]
              },
              2  // Opcional: Redondear a dos decimales
            ]
          }
        }
      },
      {
        $sort: { estacion: 1 }  // Opcional: Ordenar por estación
      }
    ]);

    // Reformatear el resultado para ajustarse al formato requerido
    const resultado = afluencias.map(item => ({ estacion: item.estacion, afluencia: item.afluencia }));

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las afluencias', error: error });
  }
});

module.exports = router;