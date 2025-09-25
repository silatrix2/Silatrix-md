// plugins/alive.js
'use strict';

const path = require('path');
const fs = require('fs');

// try several possible config locations (relative to plugins folder)
function tryRequireConfig() {
  const cand = [
    path.join(__dirname, '../config.js'),
    path.join(__dirname, '../config.cjs'),
    path.join(__dirname, '../config.json'),
    path.join(__dirname, '../../config.js'),
    path.join(__dirname, '../../config.cjs'),
    path.join(__dirname, '../../config.json'),
    // last fallback: project root config (no path)
    'config'
  ];
  for (const c of cand) {
    try {
      // require will resolve .js/.cjs/.json automatically if exact file not provided
      // but we check existence for filesystem paths to avoid throwing for non-file strings
      if (typeof c === 'string' && (c === 'config' || fs.existsSync(c))) {
        return require(c);
      }
    } catch (e) {
      // ignore and continue
    }
  }
  return {}; // fallback empty config
}

const config = tryRequireConfig();

// Export same shape as your original file: an async function (m, gss)
module.exports = async (m, gss) => {
  try {
    // defensive guards
    if (!m) return;
    if (!gss) {
      console.warn('alive plugin: no gss (conn) provided');
    }

    // Obtain message text in common shapes (conversation / extendedTextMessage / caption)
    const getBody = (msg) => {
      if (!msg) return '';
      if (msg.conversation) return msg.conversation;
      if (msg.extendedTextMessage && msg.extendedTextMessage.text) return msg.extendedTextMessage.text;
      if (msg.imageMessage && msg.imageMessage.caption) return msg.imageMessage.caption;
      if (msg.videoMessage && msg.videoMessage.caption) return msg.videoMessage.caption;
      return '';
    };

    const rawBody = getBody(m.message || m);
    // for compatibility with different handlers where m.body might exist:
    const body = (typeof rawBody === 'string' && rawBody.length) ? rawBody : (m.body || '');

    console.log('alive plugin received message body:', body);

    const prefix = (config && config.PREFIX) ? config.PREFIX : '!';
    const cmd = (typeof body === 'string' && body.startsWith(prefix)) ? body.slice(prefix.length).split(' ')[0].toLowerCase() : (body || '').toLowerCase();

    const validCommands = ['alive', 'bot', 'test'];
    if (!validCommands.includes(cmd)) return;

    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const senderJid = (m.key && m.key.participant) ? m.key.participant : (m.sender || (m.key && m.key.remoteJid) || '');
    const senderShort = (senderJid && typeof senderJid === 'string') ? senderJid.split('@')[0] : (m.sender && m.sender.split ? m.sender.split('@')[0] : 'user');

    const aliveMessage = `
👋 Hello @${senderShort}

✅ *SILATRIX-XMD-2 is Alive!*

⏱️ *Uptime:* ${hours}h ${minutes}m ${seconds}s  
🔐 *Mode:* ${global.public ? 'Public' : 'Private'}  
👑 *Owner:* ${config.OWNER_NUMBER || config.OWNER || 'unknown'}
`.trim();

    // Prepare send: if gss supports sendMessage (Baileys conn), use it.
    const toJid = (m.key && m.key.remoteJid) ? m.key.remoteJid : (m.from || (m.remoteJid || ''));

    const sendPayload = {
      image: { url: 'https://files.catbox.moe/2tpewa.jpg' },
      caption: aliveMessage,
      contextInfo: {
        mentionedJid: [senderJid].filter(Boolean),
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363398101781980@newsletter',
          newsletterName: "SILATRIX-XMD-2🪀",
          serverMessageId: 143
        }
      }
    };

    // Try to use gss.sendMessage if available
    if (gss && typeof gss.sendMessage === 'function') {
      await gss.sendMessage(toJid, sendPayload, { quoted: m }).catch(async (err) => {
        console.warn('alive plugin: sendMessage failed, attempting fallback. Error:', err && err.message || err);
        // fallback: if m.reply exists, use it
        if (m && typeof m.reply === 'function') {
          try {
            await m.reply(aliveMessage);
          } catch (e) {
            console.error('alive plugin fallback reply failed:', e);
          }
        }
      });
      return;
    }

    // Fallback if gss not available: try m.reply or console message
    if (m && typeof m.reply === 'function') {
      try {
        await m.reply(aliveMessage);
        return;
      } catch (e) {
        console.error('alive plugin fallback reply error:', e);
      }
    }

    // final fallback: log to console
    console.log('ALIVE RESPONSE (no send available):', aliveMessage);

  } catch (err) {
    console.error('Erreur de commande alive :', err);
    try {
      if (m && typeof m.reply === 'function') {
        m.reply(`❌ An error occurred while executing the alive command. Error: ${err.message || err}`);
      }
    } catch (e) {
      console.error('alive plugin could not reply with error to user:', e);
    }
  }
};
