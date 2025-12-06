const { tiktok } = require("@mrnima/tiktok-downloader");

module.exports = {
    name: "tiktok",
    alias: ["tt","tiktokdl"],
    desc: "Download TikTok video",
    react: "🎬",
    category: "download",
    start: async (client, m, { text }) => {

        if (!text) return m.reply("🔍 *TikTok link danna!*");

        try {
            m.reply("⬇️ TikTok Video download කරමින්...");

            const result = await tiktok(text); 

            if (!result || !result.video) {
                return m.reply("❌ Video download වෙන්නේ නෑ!");
            }

            await client.sendMessage(m.chat, { 
                video: { url: result.video }, 
                caption: "✅ *TikTok Video Downloaded* 🎬"
            }, { quoted: m });

        } catch (e) {
            console.log(e);
            m.reply("❌ Error: TikTok download failed!");
        }
    }
};
