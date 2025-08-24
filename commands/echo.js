export default {
  name: 'echo',
  usage: '!echo <ujumbe>',
  description: 'Bot hurudia ulichoandika.',
  async run({ sock, msg, text }) {
    const content = text.trim();
    await sock.sendMessage(msg.key.remoteJid, { text: content || 'Andika kitu: !echo Mimi ni bingwa' }, { quoted: msg });
  }
}
