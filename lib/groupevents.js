//Give Me Credit If Using This File Give Me Credit On Your Channel ✅ 
// Credits Dev Raheem-cm - RAHEEM-XMD-3💜 

const { isJidGroup } = require('@whiskeysockets/baileys');
const config = require('../config');

const getContextInfo = (m) => {
    return {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363399470975987@newsletter',
            newsletterName: 'Sila-Tech',
            serverMessageId: 143,
        },
    };
};

const ppUrls = [
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
];

const GroupEvents = async (conn, update) => {
    try {
        const isGroup = isJidGroup(update.id);
        if (!isGroup) return;

        const metadata = await conn.groupMetadata(update.id);
        const participants = update.participants;
        const desc = metadata.desc || "No Description";
        const groupMembersCount = metadata.participants.length;

        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(update.id, 'image');
        } catch {
            ppUrl = ppUrls[Math.floor(Math.random() * ppUrls.length)];
        }

        for (const num of participants) {
            const userName = num.split("@")[0];
            const timestamp = new Date().toLocaleString();

            if (update.action === "add" && config.WELCOME === "true") {
                const WelcomeText = `╭╼━≪•𝙽𝙴𝚆 𝙼𝙴𝙼𝙱𝙴𝚁•≫━╾╮
┃𝚆𝙴𝙻𝙲𝙾𝙼𝙴: @${userName} 👋
┃𝙳𝙴𝚅:  𝙈𝙧.𝙎𝙞𝙡𝙖
┃𝙽𝚄𝙼𝙱𝙴𝚁: #${groupMembersCount}
┃𝚃𝙸𝙼𝙴: ${timestamp}⏰
╰━━━━━━━━━━━━━━━╯
*𝙎𝙄𝙇𝘼𝙏𝙍𝙄𝙓-𝙈𝘿 𝙳𝙴𝚂𝙲𝚁𝙸𝙿𝚃𝙸𝙾𝙽*
${desc}
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝚂𝙸𝙻𝙰-𝚃𝙴𝙲𝙷  *`;

                await conn.sendMessage(update.id, {
                    image: { url: ppUrl },
                    caption: WelcomeText,
                    mentions: [num],
                    contextInfo: getContextInfo({ sender: num }),
                });

            } else if (update.action === "remove" && config.WELCOME === "true") {
                const GoodbyeText = `╭╼━≪•𝙼𝙴𝙼𝙱𝙴𝚁 𝙻𝙴𝙵𝚃•≫━╾╮
┃𝙶𝙾𝙾𝙳𝙱𝚈𝙴: @${userName} 👋
┃𝙳𝙴𝚅: 𝚂𝙸𝙻𝙰-𝚃𝙴𝙲𝙷
┃𝙽𝚄𝙼𝙱𝙴𝚁: #${groupMembersCount}
┃𝚃𝙸𝙼𝙴: ${timestamp}⏰
╰━━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝚂𝚒𝚕𝚊 𝚃𝚎𝚌𝚑*`;

                await conn.sendMessage(update.id, {
                    image: { url: ppUrl },
                    caption: GoodbyeText,
                    mentions: [num],
                    contextInfo: getContextInfo({ sender: num }),
                });

            } else if (update.action === "demote" && config.ADMIN_EVENTS === "true") {
                const demoter = update.author.split("@")[0];
                await conn.sendMessage(update.id, {
                    text: `╭╼⪨ 𝚂𝙸𝙻𝙰𝚃𝚁𝙸𝚇-𝙼𝙳-𝙲𝙰𝙻𝙻𝙴𝙳 ⪩╾╮
┃@${𝚍𝚎𝚖𝚘𝚝𝚎𝚛} 𝙷𝙰𝚂 𝙳𝙴𝙼𝙾𝚃𝙴𝙳 @${𝚞𝚜𝚎𝚛𝙽𝚊𝚖𝚎} 𝙵𝚁𝙾𝙼 𝙰𝙳𝙼𝙸𝙽.
┃⏰ 𝚃𝙸𝙼𝙴: ${𝚝𝚒𝚖𝚎𝚜𝚝𝚊𝚖𝚙}
┃👥 𝙶𝚁𝙾𝚄𝙿: ${𝚖𝚎𝚝𝚊𝚍𝚊𝚝𝚊.𝚜𝚞𝚋𝚓𝚎𝚌𝚝}
╰─────────────────╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝚂𝙸𝙻𝙰 𝚃𝙴𝙲𝙷*`,
                    mentions: [update.author, num],
                    contextInfo: getContextInfo({ sender: update.author }),
                });

            } else if (update.action === "promote" && config.ADMIN_EVENTS === "true") {
                const promoter = update.author.split("@")[0];
                await conn.sendMessage(update.id, {
                    text: `╭╼⪨ 𝚂𝙸𝙻𝙰𝚃𝚁𝙸𝚇-𝙼𝙳-𝙰𝙿𝙿𝙾𝙸𝙽𝚃 ⪩╾╮
┃@${promoter} 𝙷𝙰𝚂 𝙿𝚁𝙾𝙼𝙾𝚃𝙴𝙳 @${userName} 𝚃𝙾 𝙰𝙳𝙼𝙸𝙽.
┃⏰ 𝚃𝙸𝙼𝙴: ${timestamp}*
┃👥 𝙶𝚁𝙾𝚄𝙿: ${metadata.subject}
╰─────────────────╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴇᴠ 𝚂𝙸𝙻𝙰 𝚃𝙴𝙲𝙷 *`,
                    mentions: [update.author, num],
                    contextInfo: getContextInfo({ sender: update.author }),
                });
            }
        }
    } catch (err) {
        console.error('Group event error:', err);
    }
};

module.exports = GroupEvents;
