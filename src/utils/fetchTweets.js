const puppeteer = require("puppeteer");
const fs = require('fs');
const loadTweetsToDB = require('./loadTweetsToDB');
const { procesarImagenConOCR } = require('./getTimes');
const axios = require('axios');
const path = require('path');
const addTiempoToDB = require("./loadTimesToDB");

async function fetchTweets() {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: false, // Cambia a true para producción
        slowMo: 50,
        userDataDir: 'C:\\Users\\adjam\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 1',
    });

    const page = await browser.newPage();

    // Navega al perfil de @MetroCDMX directamente
    await page.goto('https://twitter.com/MetroCDMX', { waitUntil: "networkidle2" });
    await page.waitForSelector('article [lang]', {timeout: 5000});

    const tweet = await page.evaluate(() => {
        // Selecciona todos los tweets
        const tweetNodes = document.querySelectorAll('article [lang]');
        if (tweetNodes.length > 1) { // Asegura que hay al menos dos tweets
            const tweetNode = tweetNodes[1]; // Selecciona el segundo tweet
            const tweetText = tweetNode.innerText;
            const imageNodes = tweetNode.closest('article').querySelectorAll('img[src*="twimg"]');
            const tweetImages = Array.from(imageNodes).map(img => img.src);
            const tweetImage = tweetImages[1];
            const timeElement = tweetNode.closest('article').querySelector('time');
            const tweetDate = timeElement ? timeElement.getAttribute('datetime') : null;
            return { tweetText, tweetImage, tweetDate };
        }
        return null;
    });

    await browser.close();

    if (tweet) {
        await loadTweetsToDB(tweet); // Aquí guardamos el tweet en la base de datos.

        if(tweet.tweetText === 'Conoce el avance de los trenes de la Red y planea tu viaje. Toma previsiones.') {

            const imageUrl = tweet.tweetImage;
            const baseDirectory = path.resolve(__dirname, '..', '..');
            const imageFilePath = path.join(baseDirectory, 'src', 'img', 'avance.png');

            const response = await axios({
                method: 'GET',
                url: imageUrl,
                responseType: 'stream'
            });

            const writer = fs.createWriteStream(imageFilePath);

            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    console.log('Imagen descargada y guardada en:', imageFilePath);
                    resolve();
                });
                writer.on('error', reject);
            }).then(() => {
                procesarImagenConOCR(imageFilePath)
                    .then(resultados => {
                        console.log('Resultados OCR:', resultados);
                        addTiempoToDB(resultados);
                    })
                    .catch(error => {
                        console.error('Error procesando la imagen:', error);
                    });
            });
        }

    } else {
        console.log('No se encontró ningún tweet.');
    }
}

module.exports = fetchTweets;
