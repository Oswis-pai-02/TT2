// Dentro de routes/twitterRoutes.js o algo similar
const fetchTweets = require('../utils/fetchTweets'); // Ajusta la ruta según tu estructura de carpetas

router.get('/tweets', async (req, res) => {
  try {
    const tweets = await fetchTweets();
    res.json(tweets);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});
