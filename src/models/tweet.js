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
  }
});

module.exports = mongoose.model('Tweet', tweetSchema);