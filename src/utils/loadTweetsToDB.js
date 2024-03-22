const fs = require('fs');
const path = require('path');
const Tweet = require('../models/tweet');

async function loadTweetsToDB() {
    const filePath = path.join(__dirname, '../../tweets.json');
    if (fs.existsSync(filePath)) {
        const tweetsData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        // Asegúrate de manejar duplicados según tu lógica de negocio
        await Tweet.insertMany(tweetsData);
        console.log('Tweets insertados en la base de datos.');
    } else {
        console.log('No se encontró el archivo tweets.json.');
    }
}

module.exports = loadTweetsToDB;