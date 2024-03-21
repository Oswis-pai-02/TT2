// models/tweetModel.js
const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
    tweetText: {
      type: String,
      required: true
    },
    tweetImage: {
      type: String,
      required: false // Ajusta según si siempre esperas tener una URL de imagen
    },
    tweetDate: {
      type: Date,
      required: true
    },
    tweetImageBase64: {
      type: String,
      required: false // Ajusta según si siempre esperas tener la imagen en base64
    }
  });

console.log(tweetSchema);
module.exports = mongoose.model('Tweet', tweetSchema);
