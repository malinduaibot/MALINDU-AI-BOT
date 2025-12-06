const { getBuffer, isUrl } = require('../lib/functions');
const axios = require('axios');

module.exports = {
    pattern: 'tt',
    alias: [],
    desc: 'Download TikTok video without watermark',
    type: 'downloader',
    async function(bot, mek, m, { args, reply }) {
        try {
            if (!args || args.length === 0) return reply('❌ TikTok URL එකක් ලබා දෙන්න. උදා: `.tt <link>`');
            
            const url = args[0];
            if (!isUrl(url)) return reply('❌ සත්‍ය URL එකක් ලබා දෙන්න.');

            reply('🔄 TikTok video download වෙමින් පවතී...');

            const apiURL = `https://api.tikmate.app/api/lookup?url=${url}`;
            const res = await axios.get(apiURL);
            
            if (!res.data || !res.data.video || !res.data.video[0]) return reply('❌ Video download නොහැකි විය.');

            const videoURL = res.data.video[0].url;
            const videoBuffer = await getBuffer(videoURL);

            await bot.sendMessage(mek.key.remoteJid, {
                video: videoBuffer,
                caption: `TikTok Video Download ✅\n\nTitle: ${res.data.title || 'Unknown'}`
            }, { quoted: mek });
        } catch (err) {
            console.error(err);
            reply('❌ TikTok video download වලදී දෝෂයක් ඇති විය.');
        }
    }
};
