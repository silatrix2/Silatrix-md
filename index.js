import 'dotenv/config';
import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } from '@whiskeysockets/baileys';
import Pino from 'pino';
import express from 'express';
import fs from 'fs';
import path from 'path';
import qrcode from 'qrcode-terminal';
import { fileURLToPath } from 'url';
import { loadCommands } from './lib/loader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;
const BOT_NAME = process.env.BOT_NAME || 'SILATRIX';
const CLIENTS_DIR = path.join(__dirname, 'clients');

if (!fs.existsSync(CLIENTS_DIR)) fs.mkdirSync(CLIENTS_DIR, { recursive: true });

const app = express();
app.use(express.json());

const clients = new Map(); // clientId -> { sock, state, saveCreds }

function getAuthPath(clientId) {
  return path.join(CLIENTS_DIR, clientId, 'auth');
}

async function startClient(clientId='default') {
  const authPath = getAuthPath(clientId);
  fs.mkdirSync(authPath, { recursive: true });
  const { state, saveCreds } = await useMultiFileAuthState(authPath);
  const { version } = await fetchLatestBaileysVersion();
  const logger = Pino({ level: 'error' });
  const sock = makeWASocket({
    version,
    printQRInTerminal: true,
    auth: state,
    logger,
    browser: [BOT_NAME, 'Chrome', '1.0']
  });

  // Commands
  const commands = await loadCommands();
  const prefix = '!';

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg?.message || msg.key.fromMe) return;
    const jid = msg.key.remoteJid;
    const textMessage = msg.message.conversation
      || msg.message.extendedTextMessage?.text
      || msg.message.imageMessage?.caption
      || msg.message.videoMessage?.caption
      || '';
    if (!textMessage.startsWith(prefix)) return;

    const [cmdRaw, ...args] = textMessage.slice(prefix.length).trim().split(/\s+/);
    const cmd = cmdRaw.toLowerCase();
    const command = commands.get(cmd);
    if (!command) {
      await sock.sendMessage(jid, { text: `Samahani, amri *${cmd}* haipo. Tumia *!help* kuona zilizopo.` }, { quoted: msg });
      return;
    }
    try {
      await command.run({ sock, msg, text: args.join(' '), prefix, clientId });
    } catch (err) {
      console.error(err);
      await sock.sendMessage(jid, { text: '😬 Hitilafu imetokea kwenye utekelezaji wa amri.' }, { quoted: msg });
    }
  });

  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', async (u) => {
    const { connection, lastDisconnect, qr } = u;
    if (qr) {
      // On the first run, show QR in terminal too
      qrcode.generate(qr, { small: true });
    }
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut);
      if (shouldReconnect) {
        setTimeout(() => startClient(clientId), 2000);
      } else {
        console.log(`[${clientId}] Logged out. Delete auth folder to re-link.`);
      }
    } else if (connection === 'open') {
      console.log(`[${clientId}] ✅ WhatsApp Connected.`);
    }
  });

  clients.set(clientId, { sock, saveCreds });
  return sock;
}

// Admin Dashboard (very simple)
app.get('/', (req, res) => {
  const list = [...clients.keys()].map(id => `<li>${id}</li>`).join('');
  res.send(`
    <html><head><title>${BOT_NAME} Dashboard</title></head>
    <body style="font-family:sans-serif">
      <h1>${BOT_NAME} Dashboard</h1>
      <p>Wateja hai: ${clients.size}</p>
      <ul>${list || '<li>(bado hakuna)</li>'}</ul>
      <h3>Amri</h3>
      <pre>!help, !ping, !echo</pre>
      <h3>Kuanzisha Mteja Mpya</h3>
      <form action="/clients" method="post">
        <input name="clientId" placeholder="mf. 2557xxxxxx" />
        <button type="submit">Anzisha</button>
      </form>
      <p>Baada ya kuanzisha, tembelea <code>/pair?client=ID</code> kupata Pairing Code.</p>
    </body></html>
  `);
});

app.post('/clients', express.urlencoded({ extended: true }), async (req, res) => {
  const { clientId } = req.body;
  if (!clientId) return res.status(400).send('clientId inahitajika');
  if (clients.has(clientId)) return res.status(200).send('Tayari ipo, inatumika.');
  await startClient(clientId);
  res.status(201).send(`Mteja ${clientId} ameanzishwa. Nenda /pair?client=${encodeURIComponent(clientId)} kupata nambari ya Pair.`);
});

// Generate pairing code for a client (requires the number in international format without +)
app.get('/pair', async (req, res) => {
  const clientId = String(req.query.client || 'default');
  let entry = clients.get(clientId);
  if (!entry) {
    await startClient(clientId);
    entry = clients.get(clientId);
  }
  try {
    // expects MSISDN like 2557xxxxxxx
    const phone = String(req.query.phone || '').replace(/\D/g,''); 
    if (!phone) return res.status(400).send('Ongeza ?phone=2557xxxxxxxx');
    const code = await entry.sock.requestPairingCode(phone);
    res.send(`<pre>Pairing Code (weka kwenye WhatsApp Web 👉 Unganisha kwa Pair Code):\n${code}</pre>`);
  } catch (e) {
    console.error(e);
    res.status(500).send('Imeshindikana kupata Pair Code. Hakikisha client iko online.');
  }
});

// Start default client on boot
startClient('default').catch(console.error);

app.listen(PORT, () => {
  console.log(`${BOT_NAME} dashboard running on :${PORT}`);
});
