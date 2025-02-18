import express from 'express';
import cors from 'cors'; // Import the cors middleware
import { scrapeYouTube } from './src/components/scrapeYouTube.mjs';

const app = express();
const port = 3000;

app.use(cors()); // Use the cors middleware

app.get('/scrapeYouTube', async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).send('Query parameter is required');
  }
  try {
    const videos = await scrapeYouTube(query);
    res.json(videos);
  } catch (error) {
    console.error('Error scraping YouTube:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
