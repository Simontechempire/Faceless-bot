const { facelessReply, sendAwait } = require('../lib/function');
const fs = require('fs');
const path = require('path');

const warnPath = path.join(__dirname, '../database/warn.json');
const mutePath = path.join(__dirname, '../database/mute.json');

function loadJson(p){
  try{ if(fs.existsSync(p)) return JSON.parse(fs.readFileSync(p,'utf8')); }catch{}
  return {};
}
function saveJson(p, d){
  try{ fs.mkdirSync(path.dirname(p),{recursive:true}); fs.writeFileSync(p, JSON.stringify(d,null,2)); }catch{}
}

// Real mute checker - called from index.js
async function isMuted(jid, sender){
  const db = loadJson(mutePath);
  const list = db[jid] || [];
  return list.includes(sender);
}

module.exports = {
  name: "moderator",
  isMuted,

  async run(sock, m, jid, cmd, args, text, isOwner, isGroup, sender){

    const modCmds = ['kick','mute','unmute','warn','unwarn','warns','promote','demote','tagall','hidetag','delete','del','purge','antilinkwarn','close','open','lock','unlock'];
    if(!modCmds.includes(cmd)) return false;

    if(!isGroup){
      await facelessReply(sock, jid, "This Command Works In Group Only", m);
      return true;
    }

    // ===== REAL ADMIN CHECK =====
    let meta;
    try{ meta = await sock.groupMetadata(jid); }catch{
      await facelessReply(sock, jid, "Failed To Get Group Info", m);
      return true;
    }
    const senderNum = sender.split('@')[0];
    const botNum = sock.user.id.split(':')[0];
    const isAdmin = meta.participants.some(p => p.id.includes(senderNum) && (p.admin === 'admin' || p.admin === 'superadmin'));
    const isBotAdmin = meta.participants.some(p => p.id.includes(botNum) && (p.admin === 'admin' || p.admin === 'superadmin'));

    if(!isAdmin && !isOwner){
      await facelessReply(sock, jid, "This Command Is For Admins Only", m);
      return true;
    }
    if(!isBotAdmin && ['kick','mute','unmute','promote','demote','close','open'].includes(cmd)){
      await facelessReply(sock, jid, "Bot Must Be Admin To Do This", m);
      return true;
    }

    const getTarget = () => {
      const ctx = m.message?.extendedTextMessage?.contextInfo;
      if(ctx?.mentionedJid?.length) return ctx.mentionedJid[0];
      if(ctx?.participant) return ctx.participant;
      if(args[0]) return args[0].replace(/[^0-9]/g,'') + '@s.whatsapp.net';
      return null;
    };

    // ================= KICK - REAL =================
    if(cmd === 'kick'){
      await sendAwait(sock, jid, m);
      const target = getTarget();
      if(!target){ await facelessReply(sock, jid, "Usage: .kick @user / reply", m); return true; }
      if(target === sender){ await facelessReply(sock, jid, "You Cannot Kick Yourself", m); return true; }
      try{
        await sock.groupParticipantsUpdate(jid, [target], 'remove');
        await sock.sendMessage(jid, { text: `▫️ 💀 @${target.split('@')[0]} Kicked From Group`, mentions: [target] }, { quoted: m });
      }catch(e){ await facelessReply(sock, jid, `Failed To Kick: ${e.message}`, m); }
      return true;
    }

    // ================= MUTE / UNMUTE - REAL DB =================
    if(cmd === 'mute'){
      await sendAwait(sock, jid, m);
      const target = getTarget();
      if(!target){ await facelessReply(sock, jid, "Usage: .mute @user", m); return true; }
      const db = loadJson(mutePath);
      if(!db[jid]) db[jid] = [];
      if(db[jid].includes(target)){ await facelessReply(sock, jid, "User Already Muted", m); return true; }
      db[jid].push(target);
      saveJson(mutePath, db);
      await sock.sendMessage(jid, { text: `▫️ 💀 @${target.split('@')[0]} Muted - Their Messages Will Be Deleted`, mentions: [target] }, { quoted: m });
      return true;
    }
    if(cmd === 'unmute'){
      await sendAwait(sock, jid, m);
      const target = getTarget();
      if(!target){ await facelessReply(sock, jid, "Usage: .unmute @user", m); return true; }
      const db = loadJson(mutePath);
      if(!db[jid]) db[jid] = [];
      db[jid] = db[jid].filter(x => x !== target);
      saveJson(mutePath, db);
      await sock.sendMessage(jid, { text: `▫️ 💀 @${target.split('@')[0]} Unmuted`, mentions: [target] }, { quoted: m });
      return true;
    }

    // ================= WARN / UNWARN / WARNS - REAL DB + AUTO KICK AT 3 =================
    if(cmd === 'warn'){
      await sendAwait(sock, jid, m);
      const target = getTarget();
      if(!target){ await facelessReply(sock, jid, "Usage: .warn @user", m); return true; }
      const db = loadJson(warnPath);
      if(!db[jid]) db[jid] = {};
      db[jid][target] = (db[jid][target] || 0) + 1;
      const count = db[jid][target];
      saveJson(warnPath, db);
      if(count >= 3){
        delete db[jid][target];
        saveJson(warnPath, db);
        try{ await sock.groupParticipantsUpdate(jid, [target], 'remove'); }catch{}
        await sock.sendMessage(jid, { text: `▫️ 💀 @${target.split('@')[0]} Got 3 Warns And Was Kicked`, mentions: [target] }, { quoted: m });
      } else {
        await sock.sendMessage(jid, { text: `▫️ 💀 @${target.split('@')[0]} Warned\nWarns: ${count}/3\nReason: ${args.slice(1).join(' ') || 'No Reason'}`, mentions: [target] }, { quoted: m });
      }
      return true;
    }
    if(cmd === 'unwarn'){
      await sendAwait(sock, jid, m);
      const target = getTarget();
      if(!target){ await facelessReply(sock, jid, "Usage: .unwarn @user", m); return true; }
      const db = loadJson(warnPath);
      if(!db[jid]) db[jid] = {};
      db[jid][target] = Math.max(0, (db[jid][target] || 0) - 1);
      saveJson(warnPath, db);
      await sock.sendMessage(jid, { text: `▫️ 💀 @${target.split('@')[0]} Unwarned\nWarns: ${db[jid][target]}/3`, mentions: [target] }, { quoted: m });
      return true;
    }
    if(cmd === 'warns'){
      await sendAwait(sock, jid, m);
      const target = getTarget() || sender;
      const db = loadJson(warnPath);
      const count = db[jid]?.[target] || 0;
      await sock.sendMessage(jid, { text: `▫️ 💀 Warns For @${target.split('@')[0]}: ${count}/3`, mentions: [target] }, { quoted: m });
      return true;
    }

    // ================= PROMOTE / DEMOTE - REAL =================
    if(cmd === 'promote'){
      await sendAwait(sock, jid, m);
      const target = getTarget();
      if(!target){ await facelessReply(sock, jid, "Usage: .promote @user", m); return true; }
      try{
        await sock.groupParticipantsUpdate(jid, [target], 'promote');
        await sock.sendMessage(jid, { text: `▫️ 💀 @${target.split('@')[0]} Promoted To Admin`, mentions: [target] }, { quoted: m });
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }
    if(cmd === 'demote'){
      await sendAwait(sock, jid, m);
      const target = getTarget();
      if(!target){ await facelessReply(sock, jid, "Usage: .demote @user", m); return true; }
      try{
        await sock.groupParticipantsUpdate(jid, [target], 'demote');
        await sock.sendMessage(jid, { text: `▫️ 💀 @${target.split('@')[0]} Demoted`, mentions: [target] }, { quoted: m });
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= TAGALL - REAL =================
    if(cmd === 'tagall'){
      await sendAwait(sock, jid, m);
      const members = meta.participants.map(p => p.id);
      const msg = text || "Tag All";
      let txt = `▫️ 💀 Tag All\n\n${msg}\n\n`;
      members.forEach((id, i) => txt += `${i+1}. @${id.split('@')[0]}\n`);
      await sock.sendMessage(jid, { text: txt, mentions: members }, { quoted: m });
      return true;
    }

    // ================= HIDETAG - REAL =================
    if(cmd === 'hidetag'){
      await sendAwait(sock, jid, m);
      const members = meta.participants.map(p => p.id);
      if(!text){ await facelessReply(sock, jid, "Usage: .hidetag <message>", m); return true; }
      await sock.sendMessage(jid, { text: text, mentions: members }, { quoted: m });
      return true;
    }

    // ================= DELETE - REAL =================
    if(cmd === 'delete' || cmd === 'del'){
      await sendAwait(sock, jid, m);
      const ctx = m.message?.extendedTextMessage?.contextInfo;
      const quoted = ctx?.quotedMessage;
      const quotedKey = ctx?.stanzaId;
      if(!quoted || !quotedKey){ await facelessReply(sock, jid, "Reply To A Message To Delete It", m); return true; }
      try{
        await sock.sendMessage(jid, { delete: { remoteJid: jid, fromMe: false, id: quotedKey, participant: ctx.participant } });
        await facelessReply(sock, jid, "Message Deleted", m);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= CLOSE / OPEN - REAL =================
    if(cmd === 'close' || cmd === 'lock'){
      await sendAwait(sock, jid, m);
      try{ await sock.groupSettingUpdate(jid, 'announcement'); await facelessReply(sock, jid, "Group Closed - Only Admins Can Send", m); }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }
    if(cmd === 'open' || cmd === 'unlock'){
      await sendAwait(sock, jid, m);
      try{ await sock.groupSettingUpdate(jid, 'not_announcement'); await facelessReply(sock, jid, "Group Opened - Everyone Can Send", m); }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    return false;
  },

  // ===== REAL MUTE ENFORCER - Called from index.js =====
  async handleMute(sock, m, jid, sender){
    if(await isMuted(jid, sender)){
      try{ await sock.sendMessage(jid, { delete: m.key }); }catch{}
      return true;
    }
    return false;
  }
};
