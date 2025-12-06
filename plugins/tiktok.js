const { cmd } = require("../command");
const ttdl = require("@mrnima/tiktok-downloader");

cmd(
  {
    pattern: "tt",
    react: "🎬",
    desc: "Download TikTok Video",
    category: "download",
    filename: __filename,
  },

  async (
    bot,
    mek,
    m,
    { from, q, reply }
  ) => {
    try {
      if (!q) return reply("❌ *Please send a TikTok video link!*");

      // TikTok API call
      const res = await ttdl.tiktok(q);

      if (!res || !res.video) {
        return reply("❌ *Download failed! Try another link.*");
      }

      // Send video info
      await bot.sendMessage(
        from,
        {
          image: { url: res.cover },
          caption: `🎬 *TikTok Video Downloader*\n\n📌 *Title:* ${res.title}\n👤 *Author:* ${res.author.nickname}\n🔗 *Link:* ${q}`
        },
        { quoted: mek }
      );

      // Send video
      await bot.sendMessage(
        from,
        {
          video: { url: res.video.no_watermark },
          caption: "🎉 *Here is your video (No Watermark)*"
        },
        { quoted: mek }
      );

    } catch (e) {
      console.log(e);
      reply("❌ *Error:* " + e.message);
    }
  }
);
