const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "qZF12bTD#IOoV1w5P2gbomXZ-6CJSxIEgok_khWiUCHBLZ9UUFU8",
ALIVE_IMG: process.env.ALIVE_IMG || "https://github.com/malinduaibot/MALINDU-AI-BOT/blob/main/image/Screenshot%202025-12-05%20133333.png?raw=true",
ALIVE_MSG: process.env.ALIVE_MSG || "*Hello👋 MALINDU AI BOT Is Alive Now😍*",
BOT_OWNER: '94701369636',  // Replace with the owner's phone number



};
