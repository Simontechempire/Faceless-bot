// 🔧 FACELESS - MODERATOR PLUGIN - REAL HANDLER
const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '..', 'database');
const WARN_DB = path.join(DB_DIR, 'warns.json');
const BAN_DB = path.join(DB_DIR, 'banned.json');

function loadJson(p, def={}){
  try{
    if(!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR,{recursive:true});
    if(!fs.existsSync(p)) fs.writeFileSync(p, JSON.stringify(def,null,2));
    return JSON.parse(fs.readFileSync(p,'utf8')||JSON.stringify(def));
  }catch{ return def; }
}
function saveJson(p, d){ try{ fs.writeFileSync(p, JSON.stringify(d,null,2)); }catch{} }

const COMMANDS = ['kick','add','promote','demote','mute','unmute','warn','warnings','resetwarn','ban','unban','delete','tagall','hidetag','groupinfo','staff','resetlink','lock','unlock','clear'];

async function getMeta(sock, jid){ return await sock.groupMetadata(jid); }
async function isAdmin(sock, jid, sender){
  try{
    const meta = await getMeta(sock, jid);
    const p = meta.participants.find(x=>x.id===sender);
    return !!(p?.admin);
  }catch{ return false; }
}
async function isBotAdmin(sock, jid){
  try{
    const meta = await getMeta(sock, jid);
    const me = sock.user.id.split(':')[0];
    const p = meta.participants.find(x=>x.id.split('@')[0]===me || x.id===sock.user.id);
    return !!(p?.admin);
  }catch{ return false; }
}

// Get target: reply > mention > number in args
function getTarget(m, args){
  // reply
  const quoted = m.message?.extendedTextMessage?.contextInfo?.participant;
  if(quoted) return quoted;
  // mention
  const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  if(mentioned?.length) return mentioned[0];
  // number: .kick 234903... / .kick @user
  let num = (args[0]||'').replace(/[^0-9]/g,'');
  if(num){
    if(num.length === 10 && num.startsWith('0')) num = '234' + num.slice(1);
    if(num.length < 10) return null;
    return num + '@s.whatsapp.net';
  }
  return null;
}

module.exports = {
  name: 'moderator',
  commands: COMMANDS,

  run: async (sock, m, jid, cmd, args, text, isOwner, isGroup, sender) => {
    if(!COMMANDS.includes(cmd)) return false;
    if(!isGroup){
      await sock.sendMessage(jid, { text: '❌ Group only command' }, { quoted: m });
      return true;
    }

    const admin = await isAdmin(sock, jid, sender);
    const botAdmin = await isBotAdmin(sock, jid);
    const target = getTarget(m, args);

    // --- DELETE: anyone can delete bot msg, admin can delete any ---
    if(cmd === 'delete'){
      const quotedKey = m.message?.extendedTextMessage?.contextInfo?.stanzaId;
      if(!quotedKey){ await sock.sendMessage(jid, { text: 'Reply to a message to delete it\nUsage: reply + .delete' }, { quoted: m }); return true; }
      if(!botAdmin){ await sock.sendMessage(jid, { text: '❌ Bot must be admin to delete' }, { quoted: m }); return true; }
      await sock.sendMessage(jid, { delete: { remoteJid: jid, fromMe: false, id: quotedKey, participant: m.message.extendedTextMessage.contextInfo.participant } });
      return true;
    }

    // --- TAGALL / HIDETAG / GROUPINFO / STAFF - admin only, but tagall needs admin ---
    if(['tagall','hidetag','groupinfo','staff'].includes(cmd)){
      if(cmd === 'groupinfo'){
        const meta = await getMeta(sock, jid);
        const admins = meta.participants.filter(p=>p.admin).map(p=>'@'+p.id.split('@')[0]);
        await sock.sendMessage(jid, { text: `👥 *${meta.subject}*\n\nID: ${meta.id}\nMembers: ${meta.participants.length}\nAdmins: ${admins.length}\nCreated: ${new Date(meta.creation*1000).toLocaleDateString()}\nDesc: ${meta.desc||'No description'}\n\nAdmins:\n${admins.join('\n')}`, mentions: meta.participants.filter(p=>p.admin).map(p=>p.id) }, { quoted: m });
        return true;
      }
      if(cmd === 'staff'){
        const meta = await getMeta(sock, jid);
        const admins = meta.participants.filter(p=>p.admin);
        await sock.sendMessage(jid, { text: `👑 *STAFF - ${meta.subject}*\n\n${admins.map((p,i)=>`${i+1}. @${p.id.split('@')[0]} ${p.admin==='superadmin'?'[Owner]':'[Admin]'}`).join('\n')}`, mentions: admins.map(p=>p.id) }, { quoted: m });
        return true;
      }
      if(!isOwner && !admin){ await sock.sendMessage(jid, { text: '❌ Admins only' }, { quoted: m }); return true; }
      const meta = await getMeta(sock, jid);
      const members = meta.participants.map(p=>p.id);
      const msg = text || '📢 Attention everyone!';
      if(cmd === 'tagall'){
        await sock.sendMessage(jid, { text: `📢 *TAGALL*\n\n${msg}\n\n${members.map(x=>'@'+x.split('@')[0]).join(' ')}`, mentions: members }, { quoted: m });
      } else {
        // hidetag - message without visible tags
        await sock.sendMessage(jid, { text: msg, mentions: members });
      }
      return true;
    }

    // --- CLEAR - delete last 100 msgs is not possible in WA, we clear by sending clear notice + delete bot msgs ---
    if(cmd === 'clear'){
      if(!isOwner && !admin){ await sock.sendMessage(jid, { text: '❌ Admins only' }, { quoted: m }); return true; }
      await sock.sendMessage(jid, { text: '🧹 Group cleared - chat history cleared on your device only.\nOn WhatsApp, bot cannot delete all messages at once.' }, { quoted: m });
      return true;
    }

    // --- LOCK / UNLOCK / MUTE / UNMUTE ---
    if(['lock','unlock','mute','unmute'].includes(cmd)){
      if(!isOwner && !admin){ await sock.sendMessage(jid, { text: '❌ Admins only' }, { quoted: m }); return true; }
      if(!botAdmin){ await sock.sendMessage(jid, { text: '❌ Bot must be admin' }, { quoted: m }); return true; }
      const lock = (cmd==='lock' || cmd==='mute');
      await sock.groupSettingUpdate(jid, lock ? 'announcement' : 'not_announcement');
      await sock.sendMessage(jid, { text: lock ? '🔒 Group locked - only admins can send messages' : '🔓 Group unlocked - everyone can send messages' }, { quoted: m });
      return true;
    }

    // --- RESETLINK ---
    if(cmd === 'resetlink'){
      if(!isOwner && !admin){ await sock.sendMessage(jid, { text: '❌ Admins only' }, { quoted: m }); return true; }
      if(!botAdmin){ await sock.sendMessage(jid, { text: '❌ Bot must be admin' }, { quoted: m }); return true; }
      const code = await sock.groupRevokeInvite(jid);
      await sock.sendMessage(jid, { text: `🔗 New group link:\nhttps://chat.whatsapp.com/${code}` }, { quoted: m });
      return true;
    }

    // --- KICK / ADD / PROMOTE / DEMOTE / BAN / UNBAN - need admin + bot admin ---
    if(['kick','add','promote','demote','ban','unban'].includes(cmd)){
      if(!isOwner && !admin){ await sock.sendMessage(jid, { text: '❌ Admins only' }, { quoted: m }); return true; }
      if(!botAdmin){ await sock.sendMessage(jid, { text: '❌ Bot must be admin' }, { quoted: m }); return true; }
      if(!target && cmd !== 'unban'){ await sock.sendMessage(jid, { text: `Usage: .${cmd} @user / reply to user / .${cmd} 2349037483649` }, { quoted: m }); return true; }
      if(target === sender && !isOwner){ await sock.sendMessage(jid, { text: '❌ You cannot do this to yourself' }, { quoted: m }); return true; }

      if(cmd === 'kick'){
        await sock.groupParticipantsUpdate(jid, [target], 'remove');
        await sock.sendMessage(jid, { text: `👢 Kicked @${target.split('@')[0]}`, mentions:[target] }, { quoted: m });
      }
      if(cmd === 'add'){
        const res = await sock.groupParticipantsUpdate(jid, [target], 'add');
        const status = res?.[0]?.status || res?.[target]?.status;
        if(status === '200' || !status) await sock.sendMessage(jid, { text: `✅ Added @${target.split('@')[0]}`, mentions:[target] }, { quoted: m });
        else await sock.sendMessage(jid, { text: `❌ Could not add @${target.split('@')[0]} - user has privacy / needs invite link\nInvite: https://chat.whatsapp.com/${await sock.groupInviteCode(jid)}`, mentions:[target] }, { quoted: m });
      }
      if(cmd === 'promote'){
        await sock.groupParticipantsUpdate(jid, [target], 'promote');
        await sock.sendMessage(jid, { text: `👑 Promoted @${target.split('@')[0]} to Admin`, mentions:[target] }, { quoted: m });
      }
      if(cmd === 'demote'){
        await sock.groupParticipantsUpdate(jid, [target], 'demote');
        await sock.sendMessage(jid, { text: `⬇️ Demoted @${target.split('@')[0]}`, mentions:[target] }, { quoted: m });
      }
      if(cmd === 'ban'){
        const bans = loadJson(BAN_DB, {});
        bans[jid] = bans[jid] || [];
        if(!bans[jid].includes(target)) bans[jid].push(target);
        saveJson(BAN_DB, bans);
        await sock.groupParticipantsUpdate(jid, [target], 'remove');
        await sock.sendMessage(jid, { text: `🚫 Banned @${target.split('@')[0]} - will be auto-kicked on rejoin`, mentions:[target] }, { quoted: m });
      }
      if(cmd === 'unban'){
        if(!target){ await sock.sendMessage(jid, { text: 'Usage: .unban @user' }, { quoted: m }); return true; }
        const bans = loadJson(BAN_DB, {});
        bans[jid] = (bans[jid]||[]).filter(x=>x!==target);
        saveJson(BAN_DB, bans);
        await sock.sendMessage(jid, { text: `✅ Unbanned @${target.split('@')[0]}`, mentions:[target] }, { quoted: m });
      }
      return true;
    }

    // --- WARN SYSTEM ---
    if(['warn','warnings','resetwarn'].includes(cmd)){
      if(cmd === 'warnings'){
        const warns = loadJson(WARN_DB, {});
        const u = target || sender;
        const count = (warns[jid]?.[u]||[]).length;
        const list = (warns[jid]?.[u]||[]).map((w,i)=>`${i+1}. ${w.reason} - ${w.date}`).join('\n') || 'No warnings';
        await sock.sendMessage(jid, { text: `⚠️ Warnings for @${u.split('@')[0]}: ${count}/3\n\n${list}`, mentions:[u] }, { quoted: m });
        return true;
      }
      if(!isOwner && !admin){ await sock.sendMessage(jid, { text: '❌ Admins only' }, { quoted: m }); return true; }
      if(!target){ await sock.sendMessage(jid, { text: 'Usage: .warn @user reason' }, { quoted: m }); return true; }
      const warns = loadJson(WARN_DB, {});
      warns[jid] = warns[jid] || {};
      if(cmd === 'resetwarn'){
        warns[jid][target] = [];
        saveJson(WARN_DB, warns);
        await sock.sendMessage(jid, { text: `✅ Warnings cleared for @${target.split('@')[0]}`, mentions:[target] }, { quoted: m });
        return true;
      }
      // warn
      warns[jid][target] = warns[jid][target] || [];
      warns[jid][target].push({ reason: args.slice(1).join(' ') || 'No reason', date: new Date().toLocaleDateString(), by: sender });
      saveJson(WARN_DB, warns);
      const count = warns[jid][target].length;
      if(count >= 3){
        warns[jid][target] = [];
        saveJson(WARN_DB, warns);
        if(botAdmin) await sock.groupParticipantsUpdate(jid, [target], 'remove');
        await sock.sendMessage(jid, { text: `🚫 @${target.split('@')[0]} reached 3 warnings - KICKED`, mentions:[target] }, { quoted: m });
      } else {
        await sock.sendMessage(jid, { text: `⚠️ Warned @${target.split('@')[0]}\nReason: ${args.slice(1).join(' ')||'No reason'}\nWarnings: ${count}/3`, mentions:[target] }, { quoted: m });
      }
      return true;
    }

    return false;
  },

  // Real auto-kick banned on rejoin - index.js will call this at end
  onGroupUpdate: async (sock, update) => {
    try{
      if(update.action !== 'add') return;
      const bans = loadJson(BAN_DB, {});
      const list = bans[update.id] || [];
      for(const p of update.participants){
        if(list.includes(p)){
          await sock.groupParticipantsUpdate(update.id, [p], 'remove');
          await sock.sendMessage(update.id, { text: `🚫 Banned user @${p.split('@')[0]} tried to rejoin - kicked`, mentions:[p] });
        }
      }
    }catch{}
  }
};
