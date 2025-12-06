// ========================
//          IMPORTS
// ========================
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  getContentType,
  fetchLatestBaileysVersion,
  Browsers
} = require('@whiskeysockets/baileys');

const fs = require('fs');
const P = require('pino');
const express = require('express');
const path = require('path');
const { File } = require('megajs');

const { sms, downloadMediaMessage } = require('./lib/msg');
const { getBuffer, getGroupAdmins, getRandom } = require('./lib/functions');
const { commands, replyHandlers } = require('./command');
const config = require('./config');

const app = express();
const port = process.env.PORT || 8000;

// ========================
//        CONFIG
// ========================
const prefix = '.';
const ownerNumber = ['94701369636'];
const credsPath = path.join(__dirname, '/auth_info_baileys/creds.json');

// ========================
//   ENSURE SESSION FILE
// ========================
async function ensureSessionFile() {
  if (!fs.existsSync(credsPath)) {
    if (!config.SESSION_ID) {
      console.error('❌ SESSION_ID env variable is missing. Cannot restore session.');
      process.exit(1);
    }

    console.log("🔄 creds.json not found. Downloading session from MEGA...");

    const filer = File.fromURL(`https://mega.nz/file/${config.SESSION_ID}`);

    filer.download((err, data) => {
      if (err) {
        console.error("❌ Failed to download session file from MEGA:", err);
        process.exit(1);
      }

      fs.mkdirSync(path.join(__dirname, '/auth_info_baileys/'), { recursive: true });
      fs.writeFileSync(credsPath, data);
      console.log("✅ Session downloaded and saved. Restarting bot...");
      setTimeout(connectToWA, 2000);
    });
  } else {
    setTimeout(connectToWA, 1000);
  }
}

// ========================
//      CONNECT TO WA
// ========================
async function connectToWA() {
  console.log("Connecting MALINDU AI BOT 🧬...");
  const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, '/auth_info_baileys/'));
  const { version } = await fetchLatestBaileysVersion();

  const bot = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: false,
    browser: Browsers.macOS("Firefox"),
    auth: state,
    version,
    syncFullHistory: true,
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
  });

  // ========================
  //  CONNECTION EVENTS
  // ========================
  bot.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
        connectToWA();
      }
    } else if (connection === 'open') {
      console.log('✅ MALINDU AI BOT connected to WhatsApp');

      const up = `MALINDU AI BOT connected ✅\n\nPREFIX: ${prefix}`;
      await bot.sendMessage(ownerNumber[0] + "@s.whatsapp.net", {
        image: { url: `https://github.com/malinduaibot/MALINDU-AI-BOT/blob/main/image/Screenshot%202025-12-05%20133333.png?raw=true` },
        caption: up
      });

      fs.readdirSync("./plugins/").forEach((plugin) => {
        if (path.extname(plugin).toLowerCase() === ".js") {
          const pl = require(`./plugins/${plugin}`);
          if (pl.pattern) commands.push(pl);
        }
      });
    }
  });

  bot.ev.on('creds.update', saveCreds);

  // ========================
  //     MESSAGE HANDLER
  // ========================
  bot.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
      if (msg.messageStubType === 68) await bot.sendMessageAck(msg.key);
    }

    const mek = messages[0];
    if (!mek || !mek.message) return;
    mek.message = getContentType(mek.message) === 'ephemeralMessage' ? mek.message.ephemeralMessage.message : mek.message;
    if (mek.key.remoteJid === 'status@broadcast') return;

    const m = sms(bot, mek);
    const type = getContentType(mek.message);
    const from = mek.key.remoteJid;
    const body = type === 'conversation' ? mek.message.conversation : mek.message[type]?.text || mek.message[type]?.caption || '';
    const isCmd = body.startsWith(prefix);
    const commandName = isCmd ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase() : '';
    const args = body.trim().split(/ +/).slice(1);
    const q = args.join(' ');

    const sender = mek.key.fromMe ? bot.user.id : (mek.key.participant || mek.key.remoteJid);
    const senderNumber = sender.split('@')[0];
    const isGroup = from.endsWith('@g.us');
    const botNumber = bot.user.id.split(':')[0];
    const pushname = mek.pushName || 'Sin Nombre';
    const isMe = botNumber.includes(senderNumber);
    const isOwner = ownerNumber.includes(senderNumber) || isMe;
    const botNumber2 = await jidNormalizedUser(bot.user.id);

    const groupMetadata = isGroup ? await bot.groupMetadata(from).catch(() => {}) : '';
    const groupAdmins = isGroup ? await getGroupAdmins(groupMetadata.participants) : '';
    const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false;
    const isAdmins = isGroup ? groupAdmins.includes(sender) : false;

    const reply = (text) => bot.sendMessage(from, { text }, { quoted: mek });

    // ==============
