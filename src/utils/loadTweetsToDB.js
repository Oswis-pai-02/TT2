const fs = require('fs');
const path = require('path');
const Tweet = require('../models/tweet');

async function loadTweetsToDB(tweetData) {
    console.log(tweetData);

    try {
        const existingTweet = await Tweet.findOne({ tweetText: tweetData.tweetText, tweetDate: tweetData.tweetDate });
        if (existingTweet) {
            console.log("Este tweet ya está registrado en la base de datos.");
            return "Este tweet ya está registrado en la base de datos.";
        }

        // Si el tweet no existe, procedemos a insertarlo
        const newTweet = new Tweet({
            tweetText: tweetData.tweetText,
            tweetImage: tweetData.tweetImage,
            tweetDate: tweetData.tweetDate,
        });

        const savedTweet = await newTweet.save();
        console.log("Tweet guardado correctamente en la base de datos.");
        return "Tweet guardado correctamente en la base de datos.";
    } catch (error) {
        console.error("Error al guardar el tweet:", error.message);
        return "Error al guardar el tweet: " + error.message;
    }
}

module.exports = loadTweetsToDB;