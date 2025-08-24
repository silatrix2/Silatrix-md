export default {
  name: 'help',
  usage: '!help',
  description: 'Orodha ya amri zinazopatikana.',
  async run({ sock, msg, text, prefix }) {
    const helpText = [
      '*Karibu kwenye SILATRIX 🤖*',
      '',
      'Hizi ndizo amri za msingi:',
      '• *!help* — Orodha ya amri',
      '• *!ping* — Kukagua kama bot ipo hewani',
      '• *!echo <ujumbe>* — Kurudia ujumbe wako',
      '',
      '_Vidokezo:_',
      '- Amri za juu zimeandikwa kwa Kiswahili rahisi.',
      '- Unaweza kubinafsisha amri zaidi ndani ya folder *commands/*.',
    ].join('\n');
    await sock.sendMessage(msg.key.remoteJid, { text: helpText }, { quoted: msg });
  }
}
