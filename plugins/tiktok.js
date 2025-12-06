const { cmd } = require("../command");
const axios = require("axios");

cmd(
  {
    pattern: "tt",
    desc: "Download TikTok Video",
    category: "downloader",
    react: "🎬",
    filename: __filename,
  },
  async (bot, mek, msg, { reply, q, from }) => {
    try {
      if (!q) return reply("❌ *TikTok link එක දෙන්න!*\n\nExample: .tt https://www.tiktok.com/xxxx");

      reply("⏳ *Downloading your TikTok video...*\nPlease wait...");

      // Use @mrnima/tiktok-downloader API
      const api = `https://api.nima-ytproject.workers.dev/tiktok?url=${q}`;

      const res = await axios.get(api);

      if (!res.data || !res.data.result || !res.data.result.video) {
        return reply("❌ *Video download failed!* Try another link.");
      }

      const video = res.data.result.video; // No Watermark Video URL

      await bot.sendMessage(
        from,
        {
          video: { url: video },
          caption: "🎉 *TikTok Video Downloaded Successfully!*",
        },
        { quoted: mek }
      );

    } catch (e) {
      console.log(e);
      reply("❌ *Download error!* TikTok link එක check කරන්න.");
    }
  }
);
