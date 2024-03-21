// /utils/fetchTweets.js
const puppeteer = require("puppeteer");
const fs = require('fs');
const fetch = require('node-fetch');

async function fetchTweets() {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Reemplaza con la ruta correcta a Chrome
        headless: false, // Cambia a true para producción
        slowMo: 50,
    });


    const page = await browser.newPage();

    // Navega al perfil de @MetroCDMX directamente
    await page.goto('https://twitter.com/MetroCDMX', { waitUntil: "networkidle2" });
    await page.waitForSelector('article [lang]', {timeout: 5000});

    const tweet = await page.evaluate(() => {
        const tweetNode = document.querySelector('article [lang]');
        if (tweetNode) {
            const tweetText = tweetNode.innerText;
            const imageNodes = tweetNode.closest('article').querySelectorAll('img[src*="twimg"]');
            const tweetImages = Array.from(imageNodes).map(img => img.src);
            const tweetImage = tweetImages[1]; // Asumiendo que quieres la segunda imagen
            const timeElement = tweetNode.closest('article').querySelector('time');
            const tweetDate = timeElement ? timeElement.getAttribute('datetime') : null;
            return { tweetText, tweetImage, tweetDate };
        }
        return null;
    });

    await browser.close();

    if (tweet && tweet.tweetImage) {
        const response = await fetch(tweet.tweetImage);
        const imageBuffer = await response.buffer();
        // Podrías querer convertir esto a base64 si planeas almacenarlo en JSON
        tweet.tweetImageBase64 = imageBuffer.toString('base64');
    }

    const filePath = 'tweets.json';
    let tweets = [];
    if (fs.existsSync(filePath)) {
        tweets = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    if (tweet && (!tweets.length || tweet.tweetText !== tweets[tweets.length - 1].tweetText)) {
        tweets.push(tweet);
        fs.writeFileSync(filePath, JSON.stringify(tweets, null, 2), 'utf-8');
        console.log('Nuevo tweet agregado:', tweet);
    } else {
        console.log('El último tweet ya está guardado o no se encontraron nuevos tweets.');
    }
}

module.exports = fetchTweets;
