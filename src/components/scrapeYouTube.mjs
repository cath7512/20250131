import puppeteer from 'puppeteer';

export async function scrapeYouTube(query) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });

    const videos = await page.evaluate(() => {
      const videoElements = document.querySelectorAll('ytd-video-renderer');
      return Array.from(videoElements).map(video => {
        const titleElement = video.querySelector('#video-title');
        const urlElement = video.querySelector('#video-title');
        const channelElement = video.querySelector('.ytd-channel-name');
        const viewsElement = video.querySelector('.view-count');
        const uploadDateElement = video.querySelector('#metadata-line span:nth-child(2)');

        const title = titleElement ? titleElement.innerText.trim() : 'No title';
        const url = urlElement ? urlElement.href : 'No URL';
        const channel = channelElement ? channelElement.innerText.trim() : 'No channel';
        const views = viewsElement ? viewsElement.innerText.trim() : 'No views';
        const uploadDate = uploadDateElement ? uploadDateElement.innerText.trim() : 'No upload date';

        return { title, url, channel, views, uploadDate };
      });
    });

    await browser.close();
    return videos;
  } catch (error) {
    console.error('Error in scrapeYouTube function:', error);
    throw error;
  }
}
