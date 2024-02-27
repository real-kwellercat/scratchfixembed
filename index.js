const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

async function scrapeMetaTagsAndThumbnail(username) {
  try {
    const url = `https://scratch.mit.edu/users/${username}/`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Scrape meta tags
    const metaTags = {
      title: $('head meta[property="og:title"]').attr("content"),
    };

    // Extract username
    const usernameElement = $("h2.username").text().trim();

    // Extract thumbnail URL using class selector
    const thumbnailUrl = $(".box#profile-data .avatar img").attr("src");

    // Append the protocol if it's missing
    const thumbnailUrlWithProtocol =
      thumbnailUrl && !thumbnailUrl.startsWith("http")
        ? `https:${thumbnailUrl}`
        : thumbnailUrl;

    return {
      metaTags,
      username: usernameElement,
      thumbnailUrl: thumbnailUrlWithProtocol,
    };
  } catch (error) {
    console.error(
      "Error scraping meta tags, username, and thumbnail URL:",
      error,
    );
    return null;
  }
}

// Route to handle requests for /u/:username
app.get("/u/:username", async (req, res) => {
  const { username } = req.params;
  const result = await scrapeMetaTagsAndThumbnail(username);

  // Check if result is null
  if (!result) {
    res.status(404).send("Meta tags or thumbnail URL not found for this user");
    return;
  }

  const { metaTags, thumbnailUrl } = result;

  // Generate HTML page with Open Graph meta tags
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta property="og:title" content="${username}'s scratch profile - ScratchFixEmbed">
        <meta property="og:image" content="${thumbnailUrl}">
        <meta property="og:url" content="https://scratch.mit.edu/users/${username}/">
        <title>${metaTags.title}</title>
    </head>
    <body>
        <h1>${username}'s Scratch Profile</h1>
        <img src="${thumbnailUrl}" alt="${metaTags.title}">
        <h2>Username: ${username}</h2>
    </body>
    </html>
`;

  // Send HTML page
  res.send(htmlContent);
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// real
