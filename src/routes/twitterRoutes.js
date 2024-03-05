const fetchTweets = require('../utils/fetchTweets'); 

router.get('/tweets', async (req, res) => {
  try {
    const tweets = await fetchTweets();
    res.json(tweets);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});
