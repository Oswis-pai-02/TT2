const Tiempo = require('../models/tiempos');

async function addTiempoToDB(tiempoData) {
    console.log(tiempoData);

    try {
        // Crea un nuevo documento en la base de datos con los datos proporcionados
        const newTiempo = new Tiempo({
            fechaHoraRegistro: tiempoData.fecha_hora_registro,
            tiempos: {
                linea_1: tiempoData.linea_1,
                linea_2: tiempoData.linea_2,
                linea_3: tiempoData.linea_3,
                linea_4: tiempoData.linea_4,
                linea_5: tiempoData.linea_5,
                linea_6: tiempoData.linea_6,
                linea_7: tiempoData.linea_7,
                linea_8: tiempoData.linea_8,
                linea_9: tiempoData.linea_9,
                linea_A: tiempoData.linea_A,
                linea_B: tiempoData.linea_B,
                linea_11: tiempoData.linea_11 
            }
        });

        await newTiempo.save();
        console.log("Registro de tiempo añadido correctamente a la base de datos.");
        return "Registro de tiempo añadido correctamente a la base de datos.";
    } catch (error) {
        console.error("Error al añadir el registro de tiempo:", error.message);
        return "Error al añadir el registro de tiempo: " + error.message;
    }
}

module.exports = addTiempoToDB;