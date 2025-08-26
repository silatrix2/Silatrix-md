const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} = require('@whiskeysockets/baileys');
const P = require('pino');
const qrcode = require('qrcode-terminal');
const { handleCommands, antiDeleteGroups } = require('./commands');

// Bot Settings
const ownerNumber = "255789661031@s.whatsapp.net"; // BADILISHA HAPA!

async function startBot() {
  try {
    console.log('🚀 Starting SILATRIX Bot...');
    
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const { version } = await fetchLatestBaileysVersion();
    
    const sock = makeWASocket({
      version,
      auth: state,
      logger: P({ level: 'silent' })
    });

    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
      if (qr) {
        console.log('📱 Scan QR Code na WhatsApp yako:');
        qrcode.generate(qr, { small: true });
      }
      
      if (connection === 'close') {
        const shouldReconnect =
          lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        if (shouldReconnect) {
          console.log('🔄 Reconnecting...');
          setTimeout(startBot, 3000);
        } else {
          console.log('❌ Bot logged out');
        }
      } else if (connection === 'open') {
        console.log('✅ SILATRIX Bot connected successfully!');
        console.log('🎉 Bot ready to receive commands...');
      }
    });

    // Handle incoming messages
    sock.ev.on('messages.upsert', async ({ messages }) => {
      const msg = messages[0];
      if (!msg.message || msg.key.fromMe) return;
      
      // Handle commands using external file
      await handleCommands(sock, msg, ownerNumber);
    });

    // Anti-Delete Handler
    sock.ev.on('messages.update', async (updates) => {
      try {
        for (const update of updates) {
          if (update.update.messageStubType === 68) {
            const sender = update.key.remoteJid;
            if (antiDeleteGroups.has(sender)) {
              await sock.sendMessage(sender, {
                text: `🚫 *ANTI DELETE ALERT*\n\n⚠️ Someone tried to delete a message!\n🕐 Time: ${new Date().toLocaleString()}`
              });
            }
          }
        }
      } catch (error) {
        console.error('Error in anti-delete:', error);
      }
    });

  } catch (error) {
    console.error('❌ Error starting bot:', error);
    console.log('🔄 Retrying in 5 seconds...');
    setTimeout(startBot, 5000);
  }
}

// Start the bot
startBot();
