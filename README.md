<a href="https://git.io/typing-svg">
  <img src="https://readme-typing-svg.demolab.com?font=Anton&size=80&pause=1000&color=FF0000&center=true&vCenter=true&width=1000&height=200&lines=Silatrix-md;VERSION+2025;BY+DEV+Sila" alt="Typing SVG" />
</a>

---
---
<a
href="https://whatsapp.com/channel/0029VbAffhD2ZjChG9DX922r">
 <img alt="Silatrix-md" height="400" src="https://files.catbox.moe/3x9xp3.jpg"></a>
</p>

---

<p align="center">
  <img src="https://profile-counter.glitch.me/Silatrix-md/count.svg" alt="Visitor Count" />
</p>

---
DEPLOY SIMPLY SILATRIX-MD-2 

[![TypingSVG](https://readme-typing-svg.herokuapp.com?font=Rockstar-ExtraBold&size=50&pause=1000&color=FF0000&center=true&vCenter=true&width=900&height=130&lines=『+⚡get+session-id+here+👌👌⚡+』)](https://git.io/typing-svg)



[![Silatrix-md SESSION](https://img.shields.io/badge/Silatrix%20-md%20SESSION-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://raheem-xmd-2-pair-2.onrender.com)
---

 [![TypingSVG](https://readme-typing-svg.herokuapp.com?font=Rockstar-ExtraBold&size=50&pause=1000&color=FF0000&center=true&vCenter=true&width=900&height=130&lines=『+⚡Bro+don't+forget;fork+my+repo🙏🙏⚡+』)](https://git.io/typing-svg)


 <p align="center">
  <a href="https://github.com/silatrix2/Silatrix-md">
    <img src="https://img.shields.io/badge/Fork%20This-Repository-gold?style=for-the-badge&logo=github&logoColor=gold" />
  </a>

---

<a href="https://git.io/typing-svg">
  <img src="https://readme-typing-svg.demolab.com?font=Anton&size=80&pause=1000&color=FF0000&center=true&vCenter=true&width=1000&height=200&lines=DEPLOY+Silatrix-md;HERE+ON+DEFFERENT+PLATFORM" alt="Typing SVG" />
</a>

<p align="center">
  <a href="https://replit.com/silatrix2"
    <img src="https://img.shields.io/badge/Deploy%20To%20Replit-FFA500?style=for-the-badge&logo=replit&logoColor=white" />
  </a>
  <a href="https://railway.app/new/template?template=https://github.com/silatrix2/Silatrix-md">
    <img title="DEPLOY ON RENDER" src="https://img.shields.io/badge/🇹🇿_DEPLOY_ON_RAILWAY-000000?style=for-the-badge&logo=benz&logoColor=gold&color=black" width="260" height="50"/>
  </a>
  <a href="https://render.com/">
    <img title="DEPLOY ON RENDER" src="https://img.shields.io/badge/🇹🇿_DEPLOY_ON_RENDER-000000?style=for-the-badge&logo=ferrari&logoColor=gold&color=black" width="260" height="50"/>
  </a>
</p>

<p align="center">
  <a href="https://dashboard.heroku.com/new?template=https://github.com/silatrix2/Silatrix-md/tree/main">
   <img 
  target="_blank"> <img title="DEPLOY Silatrix-md BOT" src="https://img.shields.io/badge/🇹🇿_DEPLOY_ON_HEROKU-000000?style=for-the-badge&logo=heroku&logoColor=gold&color=black" width="260" height="50"/>
  </a>
     <a href="https://host.talkdrove.com/share-bot/82">
    <img src="https://img.shields.io/badge/🇹🇿_DEPLOY_ON_TALKDROVE-000000?style=for-the-badge&logo=subaru&logoColor=gold&color=black" width="260" height="50"/>
  </a>
  <a href="https://app.koyeb.com/services/deploy?type=git&repository=https://github.com/silatrix2/Silatrix-md&ports=3000">
    <img src="https://img.shields.io/badge/🇹🇿_DEPLOY_ON_KEYOB-000000?style=for-the-badge&logo=toyota&logoColor=gold&color=black" width="260" height="50"/>
  </a>
</p>

---

[![TypingSVG](https://readme-typing-svg.herokuapp.com?font=Rockstar-ExtraBold&size=50&pause=1000&color=FF0000&center=true&vCenter=true&width=900&height=130&lines=『+⚡Silatrix-md+𝙿𝚘𝚠𝚎𝚛𝚎𝚍+𝚋𝚢+Sila+cm⚡+』)](https://git.io/typing-svg)

🔌🔌💫

[![TypingSVG](https://readme-typing-svg.herokuapp.com?font=Rockstar-ExtraBold&size=50&pause=1000&color=FF0000&center=true&vCenter=true&width=900&height=130&lines=『+⚡owner+number-+255763111390⚡+』)](https://git.io/typing-svg)
 🔄 ɢɪᴛʜᴜʙ ᴀᴄᴛɪᴏɴs
ᴅᴇᴘʟᴏʏ ᴀᴜᴛᴏᴍᴀᴛɪᴄᴀʟʟʏ ᴜsɪɴɢ `.yml` ᴡᴏʀᴋғʟᴏᴡ ɪɴsɪᴅᴇ ɢɪᴛʜᴜʙ ᴀᴄᴛɪᴏɴs.


**ɢɪᴛʜᴜʙ ᴅᴇᴘʟᴏʏᴍᴇɴᴛ** 

```
name: Node.js CI

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
  schedule:
    - cron: '0 */6 * * *'  

jobs:
  build:

    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20.x]

    steps:
    - name: Checkout repository
      uses: actions/checkout@v3

    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}

    - name: Install dependencies
      run: npm install

    - name: Install FFmpeg
      run: sudo apt-get install -y ffmpeg

    - name: Start application with timeout
      run: |
        timeout 10800s npm start  # Limite l'exécution à 72h 00m 00s

    - name: Save state (Optional)
      run: |
        ./save_state.sh
```
