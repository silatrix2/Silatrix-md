// commands.js - SILATRIX Bot Commands
const fs = require('fs');

// Bot Settings
const botName = "SILATRIX BOT";
const prefix = ".";

// Data Storage
let antiLinkGroups = new Set();
let antiDeleteGroups = new Set();
let badWords = ['fuck', 'shit', 'damn', 'bitch', 'hell', 'stupid'];

// Helper Functions
const isOwner = (sender, ownerNumber) => sender === ownerNumber;

const isAdmin = async (sock, groupId, userId) => {
  try {
    const groupMetadata = await sock.groupMetadata(groupId);
    const participant = groupMetadata.participants.find(p => p.id === userId);
    return participant?.admin === 'admin' || participant?.admin === 'superadmin';
  } catch {
    return false;
  }
};

const hasBadWords = (text) => {
  return badWords.some(word => text.toLowerCase().includes(word.toLowerCase()));
};

// Main Command Handler
const handleCommands = async (sock, msg, ownerNumber) => {
  try {
    const messageType = Object.keys(msg.message)[0];
    const sender = msg.key.remoteJid;
    const isGroup = sender.endsWith('@g.us');
    const senderUser = msg.key.participant || sender;
    
    let body = '';
    if (messageType === 'conversation') {
      body = msg.message.conversation;
    } else if (messageType === 'extendedTextMessage') {
      body = msg.message.extendedTextMessage.text;
    } else if (messageType === 'imageMessage' && msg.message.imageMessage.caption) {
      body = msg.message.imageMessage.caption;
    }

    if (!body) return;

    const command = body.startsWith(prefix) ? body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const args = body.slice(prefix.length).trim().split(' ').slice(1);

    console.log(`📨 Command: ${command} | From: ${senderUser.split('@')[0]} | Group: ${isGroup}`);

    // Anti-Link Protection
    if (isGroup && antiLinkGroups.has(sender)) {
      const linkPattern = /(https?:\/\/[^\s]+|www\.[^\s]+|t\.me\/[^\s]+|chat\.whatsapp\.com)/i;
      if (linkPattern.test(body) && !await isAdmin(sock, sender, senderUser) && !isOwner(senderUser, ownerNumber)) {
        try {
          await sock.sendMessage(sender, {
            delete: {
              remoteJid: sender,
              fromMe: false,
              id: msg.key.id,
              participant: senderUser
            }
          });
          await sock.sendMessage(sender, {
            text: `⚠️ @${senderUser.split('@')[0]} Link zimekatazwa kwenye group hii!\n\n🚫 Message yako imefutwa.`,
            mentions: [senderUser]
          });
        } catch (error) {
          console.log('Error deleting link message:', error);
        }
        return;
      }
    }

    // Bad Words Filter
    if (isGroup && hasBadWords(body) && !isOwner(senderUser, ownerNumber)) {
      try {
        await sock.sendMessage(sender, {
          delete: {
            remoteJid: sender,
            fromMe: false,
            id: msg.key.id,
            participant: senderUser
          }
        });
        await sock.sendMessage(sender, {
          text: `🚫 @${senderUser.split('@')[0]} Maneno mabaya hayaruhusiwi hapa!\n\n⚠️ Jaribu kutumia lugha nzuri.`,
          mentions: [senderUser]
        });
      } catch (error) {
        console.log('Error deleting bad word message:', error);
      }
      return;
    }

    // Commands Switch
    switch (command) {
      case 'menu':
      case 'help':
        const menuText = `
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   🤖 *${botName} MENU* 🤖   ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

┏━━━━ *📊 GENERAL COMMANDS* ━━━━┓
┃ ${prefix}menu - Onyesha menu hii
┃ ${prefix}ping - Check bot speed
┃ ${prefix}owner - Maelezo ya owner
┃ ${prefix}runtime - Bot uptime
┃ ${prefix}info - Bot information
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━━ *👑 ADMIN COMMANDS* ━━━━┓
┃ ${prefix}antilink on/off - Washa/zima antilink
┃ ${prefix}antidel on/off - Washa/zima antidelete
┃ ${prefix}kick @user - Toa mtu group
┃ ${prefix}promote @user - Fanya admin
┃ ${prefix}demote @user - Ondoa admin
┃ ${prefix}tagall <text> - Tag watu wote
┃ ${prefix}hidetag <text> - Tag watu wote (hidden)
┃ ${prefix}groupinfo - Group information
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━━ *📱 STATUS COMMANDS* ━━━━┓
┃ ${prefix}viewstatus - Ona status za watu
┃ ${prefix}likestatus - Like status
┃ ${prefix}downloadstatus - Download status
┃ ${prefix}statusinfo - Status information
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━━ *🎉 FUN COMMANDS* ━━━━┓
┃ ${prefix}quote - Random quote
┃ ${prefix}joke - Utani
┃ ${prefix}fact - Ukweli wa random
┃ ${prefix}motivate - Maneno ya moyo
┃ ${prefix}riddle - Mchezo wa akili
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━━ *🛡️ SECURITY* ━━━━┓
┃ ${prefix}badword add <word> - Ongeza neno baya
┃ ${prefix}badword remove <word> - Ondoa neno baya
┃ ${prefix}badword list - Orodha ya maneno mabaya
┃ ${prefix}viewonce - Ona view once messages
┃ ${prefix}antispam on/off - Washa/zima anti spam
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━━ *🔧 UTILITY* ━━━━┓
┃ ${prefix}sticker - Tengeneza sticker
┃ ${prefix}toimg - Sticker to image
┃ ${prefix}weather <city> - Hali ya hewa
┃ ${prefix}time - Muda wa sasa
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Made with ❤️ by *SILATRIX*
Version: 2.0 | Prefix: *${prefix}*`;
        
        await sock.sendMessage(sender, { text: menuText });
        break;

      case 'ping':
        const start = Date.now();
        const sent = await sock.sendMessage(sender, { text: '🏓 Pinging...' });
        const end = Date.now();
        await sock.sendMessage(sender, { 
          text: `🏓 *PONG!*\n\n⚡ Speed: *${end - start}ms*\n📡 Status: *Online*\n🤖 Bot: *Active*`,
          edit: sent.key
        });
        break;

      case 'antilink':
        if (!isGroup) return sock.sendMessage(sender, { text: '❌ Command hii ni ya groups tu!' });
        if (!await isAdmin(sock, sender, senderUser) && !isOwner(senderUser, ownerNumber)) {
          return sock.sendMessage(sender, { text: '❌ Admin pekee anaweza kutumia command hii!' });
        }
        
        const action = args[0]?.toLowerCase();
        if (action === 'on') {
          antiLinkGroups.add(sender);
          await sock.sendMessage(sender, { text: '✅ *ANTILINK ACTIVATED*\n\nLink zote zitafutwa automatically!' });
        } else if (action === 'off') {
          antiLinkGroups.delete(sender);
          await sock.sendMessage(sender, { text: '❌ *ANTILINK DEACTIVATED*\n\nLink sasa zinaruhusiwa.' });
        } else {
          await sock.sendMessage(sender, { text: `❓ *Usage:* ${prefix}antilink on/off` });
        }
        break;

      case 'antidel':
        if (!isGroup) return sock.sendMessage(sender, { text: '❌ Command hii ni ya groups tu!' });
        if (!await isAdmin(sock, sender, senderUser) && !isOwner(senderUser, ownerNumber)) {
          return sock.sendMessage(sender, { text: '❌ Admin pekee anaweza kutumia command hii!' });
        }
        
        const delAction = args[0]?.toLowerCase();
        if (delAction === 'on') {
          antiDeleteGroups.add(sender);
          await sock.sendMessage(sender, { text: '✅ *ANTI-DELETE ACTIVATED*\n\nMessages zisizofutika zitaonekana!' });
        } else if (delAction === 'off') {
          antiDeleteGroups.delete(sender);
          await sock.sendMessage(sender, { text: '❌ *ANTI-DELETE DEACTIVATED*' });
        } else {
          await sock.sendMessage(sender, { text: `❓ *Usage:* ${prefix}antidel on/off` });
        }
        break;

      case 'kick':
        if (!isGroup) return sock.sendMessage(sender, { text: '❌ Command hii ni ya groups tu!' });
        if (!await isAdmin(sock, sender, senderUser) && !isOwner(senderUser, ownerNumber)) {
          return sock.sendMessage(sender, { text: '❌ Admin pekee anaweza kutumia command hii!' });
        }
        
        const mentionedUser = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (!mentionedUser) return sock.sendMessage(sender, { text: '❓ Tag mtu utakayemtoa!\n\nExample: .kick @user' });
        
        try {
          await sock.groupParticipantsUpdate(sender, [mentionedUser], 'remove');
          await sock.sendMessage(sender, { 
            text: `✅ *USER REMOVED*\n\n@${mentionedUser.split('@')[0]} ametolewa group successfully!`,
            mentions: [mentionedUser]
          });
        } catch (error) {
          await sock.sendMessage(sender, { text: '❌ Sikuweza kumtoa! Labda sina admin rights.' });
        }
        break;

      case 'promote':
        if (!isGroup) return sock.sendMessage(sender, { text: '❌ Command hii ni ya groups tu!' });
        if (!await isAdmin(sock, sender, senderUser) && !isOwner(senderUser, ownerNumber)) {
          return sock.sendMessage(sender, { text: '❌ Admin pekee anaweza kutumia command hii!' });
        }
        
        const promoteUser = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (!promoteUser) return sock.sendMessage(sender, { text: '❓ Tag mtu utakayefanya admin!' });
        
        try {
          await sock.groupParticipantsUpdate(sender, [promoteUser], 'promote');
          await sock.sendMessage(sender, { 
            text: `✅ *USER PROMOTED*\n\n🎉 @${promoteUser.split('@')[0]} sasa ni admin!`,
            mentions: [promoteUser]
          });
        } catch (error) {
          await sock.sendMessage(sender, { text: '❌ Sikuweza kumfanya admin!' });
        }
        break;

      case 'demote':
        if (!isGroup) return sock.sendMessage(sender, { text: '❌ Command hii ni ya groups tu!' });
        if (!await isAdmin(sock, sender, senderUser) && !isOwner(senderUser, ownerNumber)) {
          return sock.sendMessage(sender, { text: '❌ Admin pekee anaweza kutumia command hii!' });
        }
        
        const demoteUser = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (!demoteUser) return sock.sendMessage(sender, { text: '❓ Tag admin utakayemshushia!' });
        
        try {
          await sock.groupParticipantsUpdate(sender, [demoteUser], 'demote');
          await sock.sendMessage(sender, { 
            text: `✅ *ADMIN DEMOTED*\n\n📉 @${demoteUser.split('@')[0]} sio admin tena!`,
            mentions: [demoteUser]
          });
        } catch (error) {
          await sock.sendMessage(sender, { text: '❌ Sikuweza kumshushia!' });
        }
        break;

      case 'tagall':
        if (!isGroup) return sock.sendMessage(sender, { text: '❌ Command hii ni ya groups tu!' });
        if (!await isAdmin(sock, sender, senderUser) && !isOwner(senderUser, ownerNumber)) {
          return sock.sendMessage(sender, { text: '❌ Admin pekee anaweza kutumia command hii!' });
        }
        
        try {
          const groupMetadata = await sock.groupMetadata(sender);
          const participants = groupMetadata.participants.map(p => p.id);
          const text = args.join(' ') || '📢 Group Announcement!';
          
          let tagText = `📢 *GROUP ANNOUNCEMENT*\n\n${text}\n\n`;
          participants.forEach(jid => {
            tagText += `@${jid.split('@')[0]} `;
          });
          
          await sock.sendMessage(sender, {
            text: tagText,
            mentions: participants
          });
        } catch (error) {
          await sock.sendMessage(sender, { text: '❌ Kuna tatizo la kutag watu!' });
        }
        break;

      case 'hidetag':
        if (!isGroup) return sock.sendMessage(sender, { text: '❌ Command hii ni ya groups tu!' });
        if (!await isAdmin(sock, sender, senderUser) && !isOwner(senderUser, ownerNumber)) {
          return sock.sendMessage(sender, { text: '❌ Admin pekee anaweza kutumia command hii!' });
        }
        
        try {
          const groupMetadata = await sock.groupMetadata(sender);
          const participants = groupMetadata.participants.map(p => p.id);
          const text = args.join(' ') || '📢 Hidden Tag Message!';
          
          await sock.sendMessage(sender, {
            text: text,
            mentions: participants
          });
        } catch (error) {
          await sock.sendMessage(sender, { text: '❌ Kuna tatizo la kutag watu!' });
        }
        break;

      case 'groupinfo':
        if (!isGroup) return sock.sendMessage(sender, { text: '❌ Command hii ni ya groups tu!' });
        
        try {
          const groupMetadata = await sock.groupMetadata(sender);
          const adminCount = groupMetadata.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').length;
          const memberCount = groupMetadata.participants.length;
          
          const groupInfo = `📊 *GROUP INFORMATION*\n\n📝 *Name:* ${groupMetadata.subject}\n👥 *Total Members:* ${memberCount}\n👑 *Admins:* ${adminCount}\n📅 *Created:* ${new Date(groupMetadata.creation * 1000).toDateString()}\n🆔 *Group ID:* ${groupMetadata.id}\n📋 *Description:* ${groupMetadata.desc || 'No description'}`;
          
          await sock.sendMessage(sender, { text: groupInfo });
        } catch (error) {
          await sock.sendMessage(sender, { text: '❌ Sikuweza kupata group info!' });
        }
        break;

      case 'owner':
        await sock.sendMessage(sender, {
          text: `👑 *BOT OWNER INFORMATION*\n\n📱 *Number:* ${ownerNumber.replace('@s.whatsapp.net', '')}\n🤖 *Bot Name:* ${botName}\n⚡ *Status:* Active & Running\n🌟 *Version:* 2.0\n📅 *Created:* 2024\n\n*Made with ❤️ by SILATRIX*`
        });
        break;

      case 'quote':
        const quotes = [
          "💫 \"The only way to do great work is to love what you do.\" - Steve Jobs",
          "🌟 \"Life is what happens to you while you're busy making other plans.\" - John Lennon", 
          "✨ \"The future belongs to those who believe in the beauty of their dreams.\" - Eleanor Roosevelt",
          "🔥 \"Success is not final, failure is not fatal: it is the courage to continue that counts.\" - Winston Churchill",
          "💎 \"It is during our darkest moments that we must focus to see the light.\" - Aristotle",
          "🚀 \"Innovation distinguishes between a leader and a follower.\" - Steve Jobs",
          "🌈 \"The only impossible journey is the one you never begin.\" - Tony Robbins"
        ];
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        await sock.sendMessage(sender, { text: `💭 *INSPIRATIONAL QUOTE*\n\n${randomQuote}` });
        break;

      case 'joke':
        const jokes = [
          "😂 Why don't scientists trust atoms?\nBecause they make up everything!",
          "🤣 Why did the scarecrow win an award?\nHe was outstanding in his field!",
          "😆 Why don't eggs tell jokes?\nThey'd crack each other up!",
          "😄 What do you call a fake noodle?\nAn impasta!",
          "😁 Why did the math book look so sad?\nBecause it was full of problems!",
          "😂 What do you call a bear with no teeth?\nA gummy bear!"
        ];
        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
        await sock.sendMessage(sender, { text: `🎭 *JOKE TIME*\n\n${randomJoke}` });
        break;

      case 'motivate':
        const motivations = [
          "💪 You've got this! Keep pushing forward!",
          "🌟 Believe in yourself, you're stronger than you think!",
          "🔥 Success starts with self-discipline!",
          "✨ Today's struggles are tomorrow's strengths!",
          "🚀 Don't stop until you're proud!",
          "💎 You are capable of amazing things!"
        ];
        const randomMotivation = motivations[Math.floor(Math.random() * motivations.length)];
        await sock.sendMessage(sender, { text: `🎯 *DAILY MOTIVATION*\n\n${randomMotivation}` });
        break;

      case 'fact':
        const facts = [
          "🌍 Did you know? Octopuses have three hearts!",
          "🧠 Your brain uses about 20% of your body's energy!",
          "🌙 The moon is moving away from Earth at 3.8cm per year!",
          "🐝 Honey never spoils! Archaeologists found edible honey in Egyptian tombs!",
          "🌊 More people have been to space than to the deepest part of the ocean!",
          "🦒 A giraffe's tongue is 20 inches long!"
        ];
        const randomFact = facts[Math.floor(Math.random() * facts.length)];
        await sock.sendMessage(sender, { text: `🤓 *DID YOU KNOW?*\n\n${randomFact}` });
        break;

      case 'riddle':
        const riddles = [
          "🤔 *RIDDLE TIME!*\n\nI have keys but no locks. I have space but no room. You can enter, but can't go outside. What am I?\n\n_Answer: A keyboard!_",
          "🤔 *RIDDLE TIME!*\n\nWhat gets wetter the more it dries?\n\n_Answer: A towel!_",
          "🤔 *RIDDLE TIME!*\n\nI'm tall when I'm young, and short when I'm old. What am I?\n\n_Answer: A candle!_",
          "🤔 *RIDDLE TIME!*\n\nWhat has hands but cannot clap?\n\n_Answer: A clock!_"
        ];
        const randomRiddle = riddles[Math.floor(Math.random() * riddles.length)];
        await sock.sendMessage(sender, { text: randomRiddle });
        break;

      case 'runtime':
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        
        await sock.sendMessage(sender, {
          text: `⏰ *BOT RUNTIME STATISTICS*\n\n📅 *Days:* ${days}\n🕐 *Hours:* ${hours}\n⏰ *Minutes:* ${minutes}\n⚡ *Seconds:* ${seconds}\n\n🤖 *Status:* Running Smoothly\n💚 *Health:* Excellent`
        });
        break;

      case 'info':
        await sock.sendMessage(sender, {
          text: `📊 *BOT INFORMATION*\n\n🤖 *Name:* ${botName}\n📱 *Platform:* WhatsApp\n⚡ *Version:* 2.0\n🔧 *Language:* JavaScript\n📦 *Library:* Baileys\n👑 *Owner:* SILATRIX\n🌟 *Features:* 25+ Commands\n\n*Thanks for using our bot! ❤️*`
        });
        break;

      case 'time':
        const now = new Date();
        const timeString = now.toLocaleString('en-US', {
          timeZone: 'Africa/Dar_es_Salaam',
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        await sock.sendMessage(sender, {
          text: `🕐 *CURRENT TIME*\n\n📅 ${timeString}\n🌍 Timezone: East Africa Time (EAT)`
        });
        break;

      case 'badword':
        if (!isOwner(senderUser, ownerNumber)) return sock.sendMessage(sender, { text: '❌ Owner pekee anaweza kutumia command hii!' });
        
        const badwordAction = args[0]?.toLowerCase();
        const word = args[1]?.toLowerCase();
        
        if (badwordAction === 'add' && word) {
          if (!badWords.includes(word)) {
            badWords.push(word);
            await sock.sendMessage(sender, { text: `✅ Neno "${word}" limeongezwa kwenye orodha ya maneno mabaya!` });
          } else {
            await sock.sendMessage(sender, { text: `❌ Neno "${word}" lipo tayari kwenye orodha!` });
          }
        } else if (badwordAction === 'remove' && word) {
          const index = badWords.indexOf(word);
          if (index > -1) {
            badWords.splice(index, 1);
            await sock.sendMessage(sender, { text: `✅ Neno "${word}" limeondolewa kwenye orodha!` });
          } else {
            await sock.sendMessage(sender, { text: `❌ Neno "${word}" halipo kwenye orodha!` });
          }
        } else if (badwordAction === 'list') {
          await sock.sendMessage(sender, { text: `📝 *ORODHA YA MANENO MABAYA:*\n\n${badWords.join(', ')}` });
        } else {
          await sock.sendMessage(sender, { text: `❓ *Usage:*\n${prefix}badword add <word>\n${prefix}badword remove <word>\n${prefix}badword list` });
        }
        break;

      default:
        // Auto responses for greetings
        const lowerBody = body.toLowerCase();
        if (lowerBody.includes('hi') || lowerBody.includes('hello') || lowerBody.includes('mambo') || lowerBody.includes('hujambo')) {
          await sock.sendMessage(sender, {
            text: `👋 *Hujambo!* \n\n🤖 Mimi ni *${botName}*\n🎯 Nimekuja kukusaidia!\n\n📋 Tumia *${prefix}menu* kuona commands zote zilizopo.\n\n_Made with ❤️ by SILATRIX_`
          });
        } else if (lowerBody.includes('asante') || lowerBody.includes('thank')) {
          await sock.sendMessage(sender, { text: '🙏 Karibu sana! Nimefurahi kukusaidia! ❤️' });
        }
    }

  } catch (error) {
    console.error('❌ Error in command handler:', error);
  }
};

// Export functions
module.exports = {
  handleCommands,
  antiLinkGroups,
  antiDeleteGroups,
  hasBadWords,
  isAdmin,
  isOwner
};
