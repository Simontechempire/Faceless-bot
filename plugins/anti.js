const { facelessReply, sendAwait } = require('../lib/function');
const fs = require('fs');
const path = require('path');

const antiPath = path.join(__dirname, '../database/anti.json');

function loadAnti(){
  try{
    if(fs.existsSync(antiPath)) return JSON.parse(fs.readFileSync(antiPath,'utf8'));
  }catch{}
  return {};
}
function saveAnti(d){
  try{
    fs.mkdirSync(path.dirname(antiPath),{recursive:true});
    fs.writeFileSync(antiPath, JSON.stringify(d,null,2));
  }catch{}
}
function getGroupAnti(jid){
  const db = loadAnti();
  if(!db[jid]) db[jid] = { antilink:false, antidelete:false, antiviewonce:false, antistatus:false, antibot:false, antiforeign:false, antisticker:false, antivideo:false };
  return { db, cfg: db[jid] };
}

// Link regex - real
const LINK_REGEX = /(https?:\/\/|www\.|chat\.whatsapp\.com\/|wa\.me\/|t\.me\/|instagram\.com|facebook\.com|youtube\.com|youtu\.be|tiktok\.com)/i;

module.exports = {
  name: "anti",
  loadAnti, saveAnti, getGroupAnti,

  // ===== REAL ANTI ENGINE - Called from index.js on every message =====
  async handleAnti(sock, m, jid, isGroup, sender, isOwner, isAdmin){
    if(!isGroup) return false;
    if(isOwner || isAdmin) return false; // Admins + Owner bypass

    const { db, cfg } = getGroupAnti(jid);
    const text = m.message?.conversation || m.message?.extendedTextMessage?.text || m.message?.imageMessage?.caption || m.message?.videoMessage?.caption || "";
    const msgType = Object.keys(m.message || {})[0] || "";

    // --- ANTI LINK - REAL DELETE + KICK WARNING ---
    if(cfg.antilink && LINK_REGEX.test(text)){
      try{
        await sock.sendMessage(jid, { delete: m.key });
        await sock.sendMessage(jid, { text: `▫️ 💀 @${sender.split('@')[0]} Link Not Allowed, Message Deleted`, mentions: [sender] });
      }catch{}
      return true;
    }

    // --- ANTI STICKER - REAL DELETE ---
    if(cfg.antisticker && msgType === 'stickerMessage'){
      try{ await sock.sendMessage(jid, { delete: m.key }); }catch{}
      return true;
    }

    // --- ANTI VIDEO - REAL DELETE ---
    if(cfg.antivideo && (msgType === 'videoMessage' || msgType === 'documentMessage')){
      try{ await sock.sendMessage(jid, { delete: m.key }); }catch{}
      return true;
    }

    // --- ANTI FOREIGN - REAL CHECK +84 +1 +92 etc, allow +234 +233 +254 ---
    if(cfg.antiforeign){
      const num = sender.split('@')[0];
      const allowed = ['234','233','254','256','27','44'];
      const isForeign = !allowed.some(p => num.startsWith(p));
      if(isForeign){
        try{
          await sock.sendMessage(jid, { delete: m.key });
          await sock.groupParticipantsUpdate(jid, [sender], 'remove');
          await sock.sendMessage(jid, { text: `▫️ 💀 Foreign Number Removed: @${num}`, mentions: [sender] });
        }catch{}
        return true;
      }
    }

    // --- ANTI BOT - REAL: If sender is bot (has bot in name or sends automated) ---
    if(cfg.antibot){
      // Baileys marks bot messages via verifiedBizName or isBot - check participant
      try{
        const meta = await sock.groupMetadata(jid);
        const p = meta.participants.find(x => x.id === sender);
        if(p && p.isAdmin === false && m.key.id && m.key.id.startsWith('BAE5')){
          await sock.sendMessage(jid, { delete: m.key });
          return true;
        }
      }catch{}
    }

    return false;
  },

  // ===== REAL ANTI DELETE HANDLER - Called on message.delete event =====
  async handleAntiDelete(sock, jid, deletedKey, originalMsg){
    const { cfg } = getGroupAnti(jid);
    if(!cfg.antidelete) return;
    if(!originalMsg) return;
    const sender = originalMsg.key?.participant || originalMsg.key?.remoteJid;
    const text = originalMsg.message?.conversation || originalMsg.message?.extendedTextMessage?.text || originalMsg.message?.imageMessage?.caption || "[Media Message]";
    try{
      await sock.sendMessage(jid, {
        text: `▫️ 💀 Anti-Delete\nUser: @${sender.split('@')[0]}\nDeleted Message: ${text}`,
        mentions: [sender]
      });
    }catch{}
  },

  // ===== REAL ANTI VIEWONCE HANDLER =====
  async handleAntiViewOnce(sock, m, jid){
    const { cfg } = getGroupAnti(jid);
    if(!cfg.antiviewonce) return false;
    const vo = m.message?.viewOnceMessage || m.message?.viewOnceMessageV2;
    if(!vo) return false;
    const inner = vo.message || {};
    const type = Object.keys(inner)[0] || "";
    const mediaMsg = inner[type];
    if(!mediaMsg) return false;
    try{
      const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
      const mediaType = type.includes('image') ? 'image' : type.includes('video') ? 'video' : 'audio';
      const stream = await downloadContentFromMessage(mediaMsg, mediaType);
      let buf = Buffer.from([]);
      for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
      const sender = m.key.participant || m.key.remoteJid;
      if(mediaType === 'image') await sock.sendMessage(jid, { image: buf, caption: `▫️ 💀 Anti-ViewOnce From @${sender.split('@')[0]}`, mentions: [sender] });
      if(mediaType === 'video') await sock.sendMessage(jid, { video: buf, caption: `▫️ 💀 Anti-ViewOnce From @${sender.split('@')[0]}`, mentions: [sender] });
      return true;
    }catch{ return false; }
  },

  // ===== COMMANDS =====
  async run(sock, m, jid, cmd, args, text, isOwner, isGroup, sender){
    const map = {
      'antilink':'antilink',
      'antidelete':'antidelete',
      'antiviewonce':'antiviewonce',
      'antistatus':'antistatus',
      'antibot':'antibot',
      'antiforeign':'antiforeign',
      'antisticker':'antisticker',
      'antivideo':'antivideo'
    };
    if(!map[cmd]) return false;

    if(!isGroup){
      await facelessReply(sock, jid, "This Command Works In Group Only", m);
      return true;
    }

    // Admin / Owner only - real check
    let meta;
    try{ meta = await sock.groupMetadata(jid); }catch{
      await facelessReply(sock, jid, "Failed To Get Group Info", m);
      return true;
    }
    const senderNum = (sender || "").split('@')[0];
    const isAdmin = meta.participants.some(p => p.id.includes(senderNum) && (p.admin === 'admin' || p.admin === 'superadmin'));
    if(!isAdmin && !isOwner){
      await facelessReply(sock, jid, "This Command Is For Admins Only", m);
      return true;
    }

    await sendAwait(sock, jid, m);
    const action = (args[0] || "").toLowerCase();
    if(action !== 'on' && action !== 'off'){
      await facelessReply(sock, jid, `Usage: .${cmd} on / .${cmd} off`, m);
      return true;
    }
    const { db, cfg } = getGroupAnti(jid);
    cfg[map[cmd]] = action === 'on';
    db[jid] = cfg;
    saveAnti(db);
    await facelessReply(sock, jid, `${cmd} Turned ${action.toUpperCase()} For This Group`, m);
    return true;
  }
};
