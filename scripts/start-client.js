import 'dotenv/config';
import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import Pino from 'pino';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientId = process.argv[2] || 'default';
const phone = (process.argv[3] || '').replace(/\D/g,'');

async function main() {
  const auth = path.join(__dirname, '..', 'clients', clientId, 'auth');
  fs.mkdirSync(auth, { recursive: true });
  const { state, saveCreds } = await useMultiFileAuthState(auth);
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    version, auth: state, logger: Pino({ level: 'error' }), printQRInTerminal: true
  });
  sock.ev.on('creds.update', saveCreds);
  if (phone) {
    const code = await sock.requestPairingCode(phone);
    console.log('\nPAIRING CODE for', clientId, '=>', code, '\n');
  } else {
    console.log('Scan QR iliyo terminalini kuunganisha akaunti...');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
