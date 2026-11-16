const { facelessReply, sendAwait } = require('../lib/function');
const fs = require('fs');
const path = require('path');

const welcomePath = path.join(__dirname, '../database/groups.json');
function loadWelcome(){
  try{ if(fs.existsSync(welcomePath)) return JSON.parse(fs.readFileSync(welcomePath,'utf8')); }catch{}
  return {};
}
function saveWelcome(d){ try{ fs.mkdirSync(path.dirname(welcomePath),{recursive:true}); fs.writeFileSync(welcomePath, JSON.stringify(d,null,2)); }catch{} }

module.exports = {
  name: "group",
  async run(sock, m, jid, cmd, args, text, isOwner, isGroup, sender){

    const groupCmds = ['tagall','hidetag','kick','add','promote','demote','group','link','revoke','setname','setdesc','setppgc','welcome','goodbye','tag','admins'];
    if(!groupCmds.includes(cmd)) return false;

    // --- All group cmds need group ---
    if(!isGroup){
      await facelessReply(sock, jid, "This Command Works In Group Only", m);
      return true;
    }

    // --- Get real metadata + admins ---
    let metadata;
    try{ metadata = await sock.groupMetadata(jid); }catch(e){
      await facelessReply(sock, jid, "Failed To Get Group Info", m);
      return true;
    }
    const participants = metadata.participants || [];
    const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const botNum = sock.user.id.split(':')[0];
    const isBotAdmin = participants.some(p => (p.id === botJid || p.id.includes(botNum)) && (p.admin === 'admin' || p.admin === 'superadmin'));
    const senderNum = (sender || "").split('@')[0];
    const isSenderAdmin = participants.some(p => p.id.includes(senderNum) && (p.admin === 'admin' || p.admin === 'superadmin'));

    // Admin / Owner check for sensitive cmds
    const adminOnly = ['kick','add','promote','demote','group','revoke','setname','setdesc','setppgc'];
    if(adminOnly.includes(cmd) && !isSenderAdmin && !isOwner){
      await facelessReply(sock, jid, "This Command Is For Admins Only", m);
      return true;
    }
    if(adminOnly.includes(cmd) && !isBotAdmin){
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

    // ================= TAGALL - REAL =================
    if(cmd === 'tagall'){
      await sendAwait(sock, jid, m);
      const msg = text || "Tag All";
      const mentions = participants.map(p => p.id);
      await sock.sendMessage(jid, {
        text: `▫️ 💀 Tag All\n\n${msg}\n\n` + mentions.map(x => `@${x.split('@')[0]}`).join(' '),
        mentions
      }, { quoted: m });
      return true;
    }

    // ================= HIDETAG - REAL =================
    if(cmd === 'hidetag' || cmd === 'tag'){
      await sendAwait(sock, jid, m);
      if(!text){
        await facelessReply(sock, jid, "Usage: .hidetag <message>", m);
        return true;
      }
      const mentions = participants.map(p => p.id);
      await sock.sendMessage(jid, { text: text, mentions }, { quoted: m });
      return true;
    }

    // ================= ADMINS - REAL =================
    if(cmd === 'admins'){
      await sendAwait(sock, jid, m);
      const admins = participants.filter(p => p.admin);
      const mentions = admins.map(p => p.id);
      await sock.sendMessage(jid, {
        text: `Group Admins (${admins.length}):\n` + admins.map(a => `@${a.id.split('@')[0]}`).join('\n'),
        mentions
      }, { quoted: m });
      return true;
    }

    // ================= KICK - REAL =================
    if(cmd === 'kick'){
      await sendAwait(sock, jid, m);
      const target = getTarget();
      if(!target){
        await facelessReply(sock, jid, "Mention / Reply To User To Kick", m);
        return true;
      }
      try{
        await sock.groupParticipantsUpdate(jid, [target], 'remove');
        await facelessReply(sock, jid, `Kicked: @${target.split('@')[0]}`, m);
      }catch(e){ await facelessReply(sock, jid, `Failed To Kick: ${e.message}`, m); }
      return true;
    }

    // ================= ADD - REAL =================
    if(cmd === 'add'){
      await sendAwait(sock, jid, m);
      if(!args[0]){
        await facelessReply(sock, jid, "Usage: .add 2349037483649", m);
        return true;
      }
      const target = args[0].replace(/[^0-9]/g,'') + '@s.whatsapp.net';
      try{
        await sock.groupParticipantsUpdate(jid, [target], 'add');
        await facelessReply(sock, jid, `Added: @${target.split('@')[0]}`, m);
      }catch(e){ await facelessReply(sock, jid, `Failed To Add: ${e.message}`, m); }
      return true;
    }

    // ================= PROMOTE / DEMOTE - REAL =================
    if(cmd === 'promote' || cmd === 'demote'){
      await sendAwait(sock, jid, m);
      const target = getTarget();
      if(!target){
        await facelessReply(sock, jid, `Mention / Reply To User To ${cmd}`, m);
        return true;
      }
      try{
        await sock.groupParticipantsUpdate(jid, [target], cmd === 'promote' ? 'promote' : 'demote');
        await facelessReply(sock, jid, `${cmd === 'promote' ? 'Promoted' : 'Demoted'}: @${target.split('@')[0]}`, m);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= GROUP OPEN / CLOSE - REAL =================
    if(cmd === 'group'){
      await sendAwait(sock, jid, m);
      const action = (args[0] || "").toLowerCase();
      if(action !== 'open' && action !== 'close'){
        await facelessReply(sock, jid, "Usage: .group open / .group close", m);
        return true;
      }
      try{
        await sock.groupSettingUpdate(jid, action === 'close' ? 'announcement' : 'not_announcement');
        await facelessReply(sock, jid, `Group ${action === 'close' ? 'Closed - Only Admins Can Send' : 'Opened - Everyone Can Send'}`, m);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= LINK - REAL =================
    if(cmd === 'link'){
      await sendAwait(sock, jid, m);
      try{
        const code = await sock.groupInviteCode(jid);
        await facelessReply(sock, jid, `Group Link:\nhttps://chat.whatsapp.com/${code}`, m);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= REVOKE - REAL =================
    if(cmd === 'revoke'){
      await sendAwait(sock, jid, m);
      try{
        await sock.groupRevokeInvite(jid);
        const code = await sock.groupInviteCode(jid);
        await facelessReply(sock, jid, `Link Revoked, New Link:\nhttps://chat.whatsapp.com/${code}`, m);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= SETNAME - REAL =================
    if(cmd === 'setname'){
      await sendAwait(sock, jid, m);
      if(!text){
        await facelessReply(sock, jid, "Usage: .setname <new name>", m);
        return true;
      }
      try{
        await sock.groupUpdateSubject(jid, text);
        await facelessReply(sock, jid, `Group Name Changed To: ${text}`, m);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= SETDESC - REAL =================
    if(cmd === 'setdesc'){
      await sendAwait(sock, jid, m);
      if(!text){
        await facelessReply(sock, jid, "Usage: .setdesc <new desc>", m);
        return true;
      }
      try{
        await sock.groupUpdateDescription(jid, text);
        await facelessReply(sock, jid, "Group Description Updated", m);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= SETPPGC - REAL =================
    if(cmd === 'setppgc'){
      await sendAwait(sock, jid, m);
      const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const imgMsg = quoted?.imageMessage;
      if(!imgMsg){
        await facelessReply(sock, jid, "Reply To An Image With .setppgc", m);
        return true;
      }
      try{
        const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
        const stream = await downloadContentFromMessage(imgMsg, 'image');
        let buf = Buffer.from([]);
        for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
        await sock.updateProfilePicture(jid, buf);
        await facelessReply(sock, jid, "Group Picture Updated", m);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= WELCOME / GOODBYE - REAL DB =================
    if(cmd === 'welcome' || cmd === 'goodbye'){
      await sendAwait(sock, jid, m);
      const action = (args[0] || "").toLowerCase();
      if(action !== 'on' && action !== 'off'){
        await facelessReply(sock, jid, `Usage: .${cmd} on / .${cmd} off`, m);
        return true;
      }
      const db = loadWelcome();
      if(!db[jid]) db[jid] = {};
      db[jid][cmd] = action === 'on';
      saveWelcome(db);
      await facelessReply(sock, jid, `${cmd} Turned ${action.toUpperCase()} For This Group`, m);
      return true;
    }

    return false;
  }
};
