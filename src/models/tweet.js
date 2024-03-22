const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
  tweetText: {
    type: String,
    required: true
  },
  tweetImage: {
    type: String,
    required: false
  },
  tweetDate: {
    type: Date,
    required: true
  }/*,
  tweetImageBase64: {
    type: String,
    required: false
  }*/
});

console.log("Estoy en modelo de la funcionalidad de obtencion de tweet.");
module.exports = mongoose.model('Tweet', tweetSchema);