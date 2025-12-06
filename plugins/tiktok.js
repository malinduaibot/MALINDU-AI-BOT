// plugins/tiktok.js
const axios = require('axios');
const fs = require('fs');
const { getBuffer } = require('../lib/functions');

module.exports = {
  pattern: 'tt',
  alias: ['tiktok'],
  desc: 'Download TikTok video',
  async function(bot, mek, m, { q, from, reply }) {
    if (!q) return reply('❌ Please provide a TikTok URL.\n\nUsage: .tt <TikTok URL>');

    try {
      // TikTok video info API
      const apiUrl = `https://api.tikmate.app/api/lookup?url=${encodeURIComponent(q)}`;
      const res = await axios.get(apiUrl);

      if (!res.data || !res.data.video) {
        return reply('❌ Could not fetch TikTok video. Make sure the URL is correct.');
      }

      const videoUrl = res.data.video.no_watermark || res.data.video.watermark;

      const buffer = await getBuffer(videoUrl);

      await bot.sendMessage(from, { video: buffer, caption: '✅ TikTok Video Downloaded!' }, { quoted: mek });

    } catch (err) {
      console.error(err);
      reply('❌ Error downloading TikTok video.');
    }
  }
};
