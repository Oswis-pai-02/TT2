const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

// Función principal para procesar la imagen
function procesarImagenConOCR(rutaImagen) {

    // Opciones para mejorar la precisión
    const options = {
        tessedit_pageseg_mode: '7', // Modo de segmentación de página
    };

    // Define las secciones de la imagen que se procesaran
    const secciones = [
        //Linea superior
        { x: 70, y: 155, ancho: 70, alto: 30 },
        { x: 170, y: 155, ancho: 70, alto: 30 },
        { x: 270, y: 155, ancho: 70, alto: 30 },
        { x: 370, y: 155, ancho: 70, alto: 30 },
        { x: 480, y: 155, ancho: 70, alto: 30 },
        { x: 580, y: 155, ancho: 70, alto: 30 },
        // Linea inferior
        { x: 70, y: 285, ancho: 70, alto: 30 },
        { x: 170, y: 285, ancho: 70, alto: 30 },
        { x: 270, y: 285, ancho: 70, alto: 30 },
        { x: 370, y: 285, ancho: 70, alto: 30 },
        { x: 480, y: 285, ancho: 70, alto: 30 },
        { x: 580, y: 285, ancho: 70, alto: 30 },
    ];

  // Iniciar un objeto para almacenar los resultados
  let resultadosOCR = {
    fecha_hora_registro: new Date().toISOString() // Obtener fecha y hora actual en formato deseado
  };

  // Función para obtener el nombre de la línea basado en el índice
  function obtenerNombreLinea(index) {
    // Asegúrate de que la lógica de nombres sea correcta para tu caso de uso
    if (index < 9) return `linea_${index + 1}`;
    if (index === 9) return 'linea_A';
    if (index === 10) return 'linea_B';
    if (index === 12) return 'linea_12';
    return `linea_${index}`; 
  }

  // Procesa cada sección con OCR
  const promesas = secciones.map((seccion, index) => {
    const nombreLinea = obtenerNombreLinea(index); // Usa la función para obtener el nombre
    const rutaSeccion = path.join(__dirname, `seccion_${index}.jpg`);

    return sharp("./src/img/avance.png")
      .extract({ left: seccion.x, top: seccion.y, width: seccion.ancho, height: seccion.alto })
      .toFile(rutaSeccion)
      .then(() => {
        return Tesseract.recognize(
          rutaSeccion,
          'eng',
          options 
        ).then(({ data: { text } }) => {
          resultadosOCR[nombreLinea] = text.trim(); // Almacena el texto reconocido, eliminando espacios en blanco al principio y al final
        }).catch(error => {
          console.error('Ocurrió un error:', error);
        }).finally(() => {
          // Opcional: Elimina el archivo de la sección para limpiar
          fs.unlinkSync(rutaSeccion);
        });
      })
      .catch(err => console.error('Error al procesar la sección:', err));
  });

  // Espera a que todas las promesas se resuelvan
  return Promise.all(promesas).then(() => {
    // Aquí todos los textos han sido reconocidos y almacenados en `resultadosOCR`
    //console.log(JSON.stringify(resultadosOCR, null, 2)); // Imprime el objeto como un string JSON formateado
    return resultadosOCR; // Retorna el resultado para uso externo
  });
}

// Exporta la función para que pueda ser usada en otros archivos
module.exports = { procesarImagenConOCR };