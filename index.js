const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, jidNormalizedUser, getContentType, fetchLatestBaileysVersion, Browsers } = require('@whiskeysockets/baileys');
const fs = require('fs');
const P = require('pino');
const express = require('express');
const path = require('path');

const { sms } = require('./lib/msg');
const { getBuffer, getGroupAdmins } = require('./lib/functions');

const app = express();
const port = process.env.PORT || 8000;
const prefix = '.';
const ownerNumber = ['94701369636'];
const credsPath = path.join(__dirname, '/auth_info_baileys/creds.json');

const commands = [];
fs.readdirSync('./plugins/').forEach(file => {
    if (file.endsWith('.js')) {
        const cmd = require(`./plugins/${file}`);
        commands.push(cmd);
    }
});

async function connectToWA() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys/');
    const { version } = await fetchLatestBaileysVersion();

    const bot = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state,
        version,
        browser: Browsers.macOS("Firefox")
    });

    bot.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            if (lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) connectToWA();
        } else if (connection === 'open') {
            console.log('✅ Bot connected');
        }
    });

    bot.ev.on('creds.update', saveCreds);

    bot.ev.on('messages.upsert', async ({ messages }) => {
        const mek = messages[0];
        if (!mek.message) return;
        mek.message = getContentType(mek.message) === 'ephemeralMessage' ? mek.message.ephemeralMessage.message : mek.message;
        if (mek.key.remoteJid === 'status@broadcast') return;

        const m = sms(bot, mek);
        const type = getContentType(mek.message);
        const from = mek.key.remoteJid;
        const body = type === 'conversation' ? mek.message.conversation : mek.message[type]?.text || mek.message[type]?.caption || '';
        const isCmd = body.startsWith(prefix);
        const commandName = isCmd ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);

        const reply = text => bot.sendMessage(from, { text }, { quoted: mek });

        if (isCmd) {
            const cmd = commands.find(c => c.pattern === commandName || (c.alias && c.alias.includes(commandName)));
            if (cmd) {
                try {
                    cmd.function(bot, mek, m, { args, reply });
                } catch (e) {
                    console.error(e);
                    reply('❌ Command execution error');
                }
            }
        }
    });
}

connectToWA();

app.get('/', (req, res) => res.send('MALINDU AI BOT started ✅'));
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
