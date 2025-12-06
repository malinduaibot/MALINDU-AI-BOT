const { cmd } = require("../command");
const ttdl = require("@mrnima/tiktok-downloader");
const axios = require("axios");

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
      if (!q) return reply("❌ *TikTok video link එක දෙන්න!*\n\nExample:\n.tt https://www.tiktok.com/xxxx");

      reply("⏳ *Processing your TikTok video...*");

      //--- Download using @mrnima/tiktok-downloader
      const data = await ttdl(q);

      if (!data || !data.result || !data.result.video1) {
        return reply("❌ *Video download failed!*");
      }

      const videoUrl = data.result.video1;

      //--- Send Video to user
      await bot.sendMessage(
        from,
        {
          video: { url: videoUrl },
          caption: "🎉 *TikTok Video Downloaded Successfully!*"
        },
        { quoted: mek }
      );

      reply("✅ *Thanks for using Malindu AI BOT!*");

    } catch (e) {
      console.log(e);
      reply("❌ *Error:* Video link එක වැරදි. වෙන link එකක් දාන්න.");
    }
  }
);
