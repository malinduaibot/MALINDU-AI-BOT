const { cmd } = require("../command");
const tiktok = require("@mrnima/tiktok-downloader");

cmd(
  {
    pattern: "tt",
    react: "📥",
    desc: "Download TikTok Video (Only video with original sound)",
    category: "download",
    filename: __filename,
  },

  async (bot, mek, m, { from, q, reply }) => {
    try {
      if (!q) return reply("❌ *TikTok link ekak denna!*");

      reply("🔄 *Downloading TikTok video...*");

      const data = await tiktok(q);

      if (!data || !data.video) {
        return reply("❌ *Video not downloading please check the link!*");
      }

      await bot.sendMessage(
        from,
        {
          video: { url: data.video },
          caption: "✅ *TikTok Video Uploaded on Malindu AI BOT!*",
        },
        { quoted: mek }
      );

    } catch (e) {
      console.log(e);
      reply("❌ *Error tiktok download :* " + e.message);
    }
  }
);
