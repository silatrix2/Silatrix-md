#!/usr/bin/env node
import readline from 'readline';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function ask(q){ return new Promise(r=> rl.question(q, r)); }

(async () => {
  const clientId = (await ask('Ingiza CLIENT ID (mf. 2557xxxxxxx): ')).trim();
  if (!clientId) { console.log('Hakuna CLIENT ID. Bye.'); process.exit(1); }
  const phone = (await ask('Namba ya simu kwa Pair Code (mf. 2557xxxxxxx): ')).trim();
  rl.close();

  // ensure auth dir
  const authPath = path.join(root, 'clients', clientId, 'auth');
  fs.mkdirSync(authPath, { recursive: true });

  console.log('\n>> Tunaanzisha mteja na kufungua Pairing Code...');

  const child = spawn('node', [path.join(root, 'scripts', 'start-client.js'), clientId, phone], { stdio: 'inherit' });
  child.on('exit', (code) => process.exit(code ?? 0));
})();
