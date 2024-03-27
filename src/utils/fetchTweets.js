const puppeteer = require("puppeteer");
const fs = require('fs');
const loadTweetsToDB = require('./loadTweetsToDB');
const { procesarImagenConOCR } = require('./getTimes');

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
    //Se espera 30 segundos
    //await page.waitForTimeout(30000);
    await page.waitForSelector('article [lang]', {timeout: 5000});

    const tweet = await page.evaluate(() => {
        const tweetNode = document.querySelector('article [lang]');
        if (tweetNode) {
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

        const rutaImagen = '"./src/img/avance.png"';

        procesarImagenConOCR(rutaImagen)
        .then(resultados => {
            console.log('Resultados OCR:', resultados);
        })
        .catch(error => {
            console.error('Error procesando la imagen:', error);
        });


    } else {
        console.log('No se encontró ningún tweet.');
    }
}

module.exports = fetchTweets;
