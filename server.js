const express = require("express");
const ytdl = require("@distube/ytdl-core");
const cors = require("cors");
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Assuming your HTML, CSS, JS are in "public"

app.post("/video-info", async (req, res) => {
  const { url } = req.body;
  if (!url || !ytdl.validateURL(url)) {
    return res.json({ error: "Invalid YouTube URL." });
  }

  try {
    const info = await ytdl.getInfo(url);
    const formats = ytdl
      .filterFormats(info.formats, "videoandaudio")
      .filter((f) => f.qualityLabel);

    const response = {
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails.pop().url,
      formats: formats.map((f) => ({
        itag: f.itag,
        qualityLabel: f.qualityLabel,
        container: f.container,
      })),
    };

    res.json(response);
  } catch (err) {
    console.error("Video info error:", err.message);
    res.json({ error: "Failed to fetch video info." });
  }
});

app.get("/download", async (req, res) => {
  const { url, itag } = req.query;
  if (!url || !itag || !ytdl.validateURL(url)) {
    return res.status(400).send("Invalid parameters.");
  }

  try {
    const info = await ytdl.getInfo(url);
    const format = ytdl.chooseFormat(info.formats, { quality: itag });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${info.videoDetails.title}.mp4"`
    );
    ytdl(url, { format }).pipe(res);
  } catch (err) {
    console.error("Download error:", err.message);
    res.status(500).send("Failed to download video.");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
