import puppeteer from "puppeteer";
import fs from 'fs';

  async function fetchTweets() {
    const browser = await puppeteer.launch({
      headless: true, // Cambia a true para la versión final
      slowMo: 50,
      userDataDir: 'C:\\Users\\ahri1\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 1',
    });

    const page = await browser.newPage();

    await page.goto('https://twitter.com/MetroCDMX', { waitUntil: "networkidle2" });
    await page.waitForSelector('article [lang]', {timeout: 60000})

    // Obtén el último tweet
    const tweet = await page.evaluate(() => {
      const tweetNode = document.querySelector('article [lang]');
      if (tweetNode) {
        const tweetText = tweetNode.innerText;
        let tweetImage = null;
        const imageNode = tweetNode.closest('article').querySelector('img[src*="twimg"]');
        if (imageNode) {
          tweetImage = imageNode.src;
        }
        const timeElement = tweetNode.closest('article').querySelector('time');
        const tweetDate = timeElement ? timeElement.getAttribute('datetime') : null;
        return { tweetText, tweetImage, tweetDate };
      }
      return null;
    });

    await browser.close();

    // Define el nombre y ruta del archivo JSON
    const filePath = 'tweets.json';

    // Lee el archivo JSON existente si existe, o inicializa un arreglo vacío
    let tweets = [];
    if (fs.existsSync(filePath)) {
      tweets = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    // Verifica si el último tweet obtenido es diferente al último guardado
    if (tweet && (!tweets.length || tweet.tweetText !== tweets[tweets.length - 1].tweetText)) {
      tweets.push(tweet); // Añade el nuevo tweet al arreglo
      fs.writeFileSync(filePath, JSON.stringify(tweets, null, 2), 'utf-8'); // Guarda el arreglo actualizado en el archivo JSON
      console.log('Nuevo tweet agregado:', tweet);
    } else {
      console.log('El último tweet ya está guardado o no se encontraron nuevos tweets.');
    }
  }

fetchTweets();