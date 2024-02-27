const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

// Function to scrape description from Scratch
async function scrapeDescription(username) {
  try {
    const url = `https://scratch.mit.edu/users/${username}/`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const descriptionMetaTag = $('meta[name="description"]');
    const description = descriptionMetaTag.attr("content");
    return description || "No description available";
  } catch (error) {
    console.error("Error scraping description:", error);
    return "An error occurred while fetching the description";
  }
}

// Route to handle requests for /u/:username
app.get("/u/:username", async (req, res) => {
  const { username } = req.params;
  const description = await scrapeDescription(username);

  // Serve HTML page with scraped description
  const htmlContent = `
        <html>
        <head>
            <title>${username}'s Profile</title>
        </head>
        <body>
            <h1>${username}'s Profile</h1>
            <div>${description}</div>
        </body>
        </html>
    `;
  res.send(htmlContent);
});

// Start the server
const port = process.env.PORT || 3006;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
