export default {
  name: 'ping',
  usage: '!ping',
  description: 'Pima kasi ya majibu ya bot.',
  async run({ sock, msg }) {
    const start = Date.now();
    const sent = await sock.sendMessage(msg.key.remoteJid, { text: 'Pinging… ⏱️' }, { quoted: msg });
    const ms = Date.now() - start;
    await sock.sendMessage(msg.key.remoteJid, { text: `PONG! ${ms}ms ✅` }, { quoted: sent });
  }
}
