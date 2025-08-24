# SILATRIX BOT 

WhatsApp bot ya **SILATRIX** yenye uwezo wa *multi-client*, *dashboard ya web* na *installer* ya haraka.

## Muhtasari
- ⚙️ **Baileys** kwa WhatsApp Web API (unofficial)
- 🌐 **Express** dashboard: `GET /` kuangalia hali, `GET /pair?client=<ID>&phone=<MSISDN>` kupata Pairing Code
- 👥 **Multi-client**: Kila mteja anapata `./clients/<clientId>/auth`
- 🧩 **Amri**: `!help`, `!ping`, `!echo` (ongeza zako ndani ya `commands/`)
- 🛠️ **Installer**: `npm run add:client` (inakuuliza `clientId` na `phone`, inatoa Pair Code)

> ⚠️ Heshimu Sheria na Masharti ya WhatsApp. Tumia kwa uangalifu na idhini ya watumiaji.

## Kuanzia Lokal

```bash
cp .env.example .env
npm install
npm start
# Angalia terminal kwa QR ya client 'default' au tumia URL:
# http://localhost:3000/pair?client=default&phone=2557XXXXXXX
```

## Kuongeza Mteja Mpya (Installer)

```bash
npm run add:client
# Fuata maelekezo – utapata Pair Code moja kwa moja.
```

## Deploy kwenye Railway

1. **Create New Project** → *Deploy from GitHub Repo*  
2. Weka env vars: `PORT=3000`, `BOT_NAME=SILATRIX`  
3. Railway hutambua Node moja kwa moja. *Start Command*: `npm start`
4. Baada ya app kuwa live, tembelea:  
   `https://<your-app>.up.railway.app/pair?client=2557XXXXXXX&phone=2557XXXXXXX`

## Deploy kwenye Render

- Tumia faili `render.yaml` au *New Web Service* → *Connect repo*  
- **Build Command**: `npm install`  
- **Start Command**: `npm start`  
- Env: `PORT=3000`, `BOT_NAME=SILATRIX`

## Muundo wa Mradi

```
.
├─ commands/           # Amri zako
│  ├─ help.js
│  ├─ ping.js
│  └─ echo.js
├─ clients/            # Auth kwa kila mteja (HIFADHI SIRI)
├─ lib/
│  └─ loader.js
├─ scripts/
│  ├─ installer.js     # "npm run add:client"
│  └─ start-client.js  # Anzisha mteja mmoja + Pair Code/QR
├─ index.js            # Server + WhatsApp + Dashboard
├─ Dockerfile
├─ render.yaml
├─ package.json
└─ .env.example
```

## Kuongeza Amri Mpya (Mfano)

Unda `commands/soma.js`:

```js
export default {
  name: 'soma',
  usage: '!soma',
  description: 'Mfano wa amri mpya.',
  async run({ sock, msg }) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Nimesoma ujumbe wako. 📖' }, { quoted: msg });
  }
}
```

## Vidokezo vya Kibiashara

- Tengeneza `clientId` = namba ya mteja (mf. `2557xxxxxxx`) ili iwe rahisi kusimamia.
- Toa *SLA*: kusaidia kuunganisha, kusetup, na kure-new pairing endapo itakatika.
- Ongeza *webhook* zako baadaye kwa malipo, report n.k.

## Usalama
- **USIHIFADHI** `clients/*/auth` kwenye repo ya umma.
- Tumia private repo au storage salama.
