import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function loadCommands() {
  const dir = path.join(__dirname, '..', 'commands');
  const commands = new Map();
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.js')) continue;
    const mod = await import(path.join(dir, file));
    if (mod.default && mod.default.name) {
      commands.set(mod.default.name, mod.default);
    }
  }
  return commands;
}
