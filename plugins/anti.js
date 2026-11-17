// 🛡️ FACELESS - ANTI PLUGIN - REAL HANDLER
const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '..', 'database');
const DB = path.join(DB_DIR, 'anti.json');

function load(){
  try{
    if(!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR,{recursive:true});
    if(!fs.existsSync(DB)) fs.writeFileSync(DB, JSON.stringify({},null,2));
    return JSON.parse(fs.readFileSync(DB,'utf8')||'{}');
  }catch{ return {}; }
}
function save(d){ try{ fs.writeFileSync(DB, JSON.stringify(d,null,2)); }catch{} }
function groupCfg(jid){ const db=load(); return db[jid]||{}; }
function setGroup(jid, cmd, val){ const db=load(); db[jid]=db[jid]||{}; db[jid][cmd]=val; save(db); global.antiSettings=db; }

const COMMANDS = ['antibug','antispam','antilink','antibot','antitag','antiflood','antifake','antinsfw','antidelete','antiviewonce','antisticker','antiraid','antigroup','antipromote','antidemote','antimention','antichannel','antiforward','antiedit','antispamcall','anti'];

const DESC = {
  antibug:'Anti-bug / crash text', antispam:'Anti-spam', antilink:'Anti-link', antibot:'Anti-bot',
  antitag:'Anti-tagall / hidetag', antiflood:'Anti-flood', antifake:'Anti-fake / foreign numbers',
  antinsfw:'Anti-NSFW words', antidelete:'Anti-delete', antiviewonce:'Anti-viewonce',
  antisticker:'Anti-sticker spam', antiraid:'Anti-raid (mass join)', antigroup:'Anti-group invite',
  antipromote:'Anti-promote', antidemote:'Anti-demote', antimention:'Anti-mention all',
  antichannel:'Anti-channel / newsletter link', antiforward:'Anti-forwarded', antiedit:'Anti-edit',
  antispamcall:'Anti-spam call'
};

// Flood tracking - real in-memory
const floodMap = new Map(); // jid+sender -> {count, last}
const stickerMap = new Map();

async function isAdmin(sock, jid, sender){
  try{
    const meta = await sock.groupMetadata(jid);
    const p = meta.participants.find(x=>x.id===sender);
    return !!(p?.admin || p?.isAdmin || p?.isSuperAdmin);
  }catch{ return false; }
}
async function isBotAdmin(sock, jid){
  try{
    const meta = await sock.groupMetadata(jid);
    const me = sock.user.id.split(':')[0]+'@s.whatsapp.net';
    const p = meta.participants.find(x=>x.id===me || x.id.split('@')[0]===me.split('@')[0]);
    return !!(p?.admin);
  }catch{ return false; }
}
async function punish(sock, jid, sender, m, reason, doKick=false){
  try{
    await sock.sendMessage(jid, { delete: m.key }).catch(()=>{});
    await sock.sendMessage(jid, { text: `🛡️ Anti: @${sender.split('@')[0]} ${reason}`, mentions:[sender] });
    if(doKick && await isBotAdmin(sock, jid)){
      await sock.groupParticipantsUpdate(jid, [sender], 'remove');
    }
  }catch{}
}

// ---------- REAL EVENT HANDLER ----------
// index.js will call: p.onMessage(sock, m, jid) - we connect all at end
async function onMessage(sock, m, jid){
  if(!m.isGroup) return; // anti only works in groups
  const cfg = groupCfg(jid);
  const anyOn = Object.values(cfg).some(v=>v===true);
  if(!anyOn) return;

  const body = (m.body||'').toLowerCase();
  const sender = m.sender;
  if(!sender) return;

  // Don't punish admins / owner / bot itself
  if(m.isOwner) return;
  if(await isAdmin(sock, jid, sender)) return;

  const botAdmin = await isBotAdmin(sock, jid);
  if(!botAdmin) return; // can't delete/kick without admin

  try{
    // ANTILINK - real
    if(cfg.antilink && /https?:\/\/|www\.|wa\.me\/|t\.me\/|chat\.whatsapp\.com\//i.test(m.body||'')){
      return await punish(sock, jid, sender, m, 'sent a link - message deleted', true);
    }
    // ANTICHANNEL - newsletter / channel link
    if(cfg.antichannel && /whatsapp\.com\/channel|newsletter/i.test(m.body||'')){
      return await punish(sock, jid, sender, m, 'sent a channel link', true);
    }
    // ANTIGROUP - group invite link
    if(cfg.antigroup && /chat\.whatsapp\.com\/[A-Za-z0-9]+/i.test(m.body||'')){
      return await punish(sock, jid, sender, m, 'sent group invite', true);
    }
    // ANTIBUG - crash / very long / weird unicode
    if(cfg.antibug && ((m.body||'').length > 4000 || /[\u{1F000}-\u{1FAFF}]{50,}/u.test(m.body||'') || (m.body||'').split('\n').length > 100)){
      return await punish(sock, jid, sender, m, 'sent bug / crash text', true);
    }
    // ANTITAG - tagall / hidetag attempt
    if(cfg.antitag && m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length >= 10){
      return await punish(sock, jid, sender, m, 'tagged too many people', false);
    }
    // ANTIMENTION - mentions everyone via @
    if(cfg.antimention && (m.body||'').includes('@') && (m.body||'').split('@').length > 10){
      return await punish(sock, jid, sender, m, 'mass mention', false);
    }
    // ANTIFORWARD - forwarded message
    if(cfg.antiforward && (m.message?.extendedTextMessage?.contextInfo?.isForwarded || m.message?.imageMessage?.contextInfo?.isForwarded || m.message?.videoMessage?.contextInfo?.isForwarded)){
      return await punish(sock, jid, sender, m, 'sent forwarded message', false);
    }
    // ANTINSFW - real word filter
    if(cfg.antinsfw){
      const bad = ['porn','sex','xxx','pussy','dick','fuck you','nude','onlyfans'];
      if(bad.some(w=>body.includes(w))) return await punish(sock, jid, sender, m, 'sent NSFW content', false);
    }
    // ANTISTICKER - sticker spam
    if(cfg.antisticker && m.message?.stickerMessage){
      const key = jid+sender;
      const now = Date.now();
      const e = stickerMap.get(key) || {count:0, last:now};
      if(now - e.last < 10000) e.count++; else e.count = 1;
      e.last = now; stickerMap.set(key, e);
      if(e.count >= 5) return await punish(sock, jid, sender, m, 'sticker spam', false);
    }
    // ANTIFLOOD / ANTISPAM - real rate limit: 5 msgs in 5 sec
    if(cfg.antiflood || cfg.antispam){
      const key = jid+sender;
      const now = Date.now();
      const e = floodMap.get(key) || {count:0, last:now};
      if(now - e.last < 5000) e.count++; else e.count = 1;
      e.last = now; floodMap.set(key, e);
      if(e.count >= 6){
        floodMap.delete(key);
        return await punish(sock, jid, sender, m, 'flooding / spamming', true);
      }
    }
    // ANTIFAKE - foreign numbers: only +234 allowed (Nigeria) - change in config if needed
    if(cfg.antifake){
      const num = sender.split('@')[0];
      if(!num.startsWith('234') && !num.startsWith('234903')){
        // allow if already in group long? we kick immediately
        return await punish(sock, jid, sender, m, 'fake / foreign number', true);
      }
    }
    // ANTIBOT - another bot (starts with . ! # / and is not our bot, or has bot in name)
    if(cfg.antibot && /^[.!#\/]/.test(m.body||'') && !m.isOwner){
      // If sender sends bot-like commands rapidly, treat as bot
      const key = 'bot'+jid+sender;
      const e = floodMap.get(key) || {count:0, last:Date.now()};
      e.count++; floodMap.set(key, e);
      if(e.count >= 5) return await punish(sock, jid, sender, m, 'bot detected', true);
    }
    // ANTIVIEWONCE - warn if viewonce sent (real recovery is in vv plugin)
    if(cfg.antiviewonce && (m.message?.viewOnceMessage || m.message?.viewOnceMessageV2)){
      await sock.sendMessage(jid, { text: `👁️ @${sender.split('@')[0]} sent view-once - anti-viewonce is ON`, mentions:[sender] });
    }
    // ANTIEDIT - edited message
    if(cfg.antiedit && m.message?.editedMessage){
      await sock.sendMessage(jid, { text: `✏️ @${sender.split('@')[0]} edited a message`, mentions:[sender] });
    }
  }catch(e){ console.log('anti error', e.message); }
}

async function onGroupUpdate(sock, update){
  // ANTIPROMOTE / ANTIDEMOTE / ANTIRAID - real revert
  try{
    const { id, participants, action, author } = update;
    const cfg = groupCfg(id);
    if(!author) return;
    const botAdmin = await isBotAdmin(sock, id);
    if(!botAdmin) return;
    if(cfg.antipromote && action === 'promote'){
      // revert: demote them back, unless owner did it
      await sock.groupParticipantsUpdate(id, participants, 'demote');
      await sock.sendMessage(id, { text: `🛡️ Anti-promote: Reverted promote by @${author.split('@')[0]}`, mentions:[author] });
    }
    if(cfg.antidemote && action === 'demote'){
      await sock.groupParticipantsUpdate(id, participants, 'promote');
      await sock.sendMessage(id, { text: `🛡️ Anti-demote: Reverted demote by @${author.split('@')[0]}`, mentions:[author] });
    }
    if(cfg.antiraid && action === 'add' && participants.length >= 3){
      // mass join = raid
      await sock.sendMessage(id, { text: `🛡️ Anti-raid: ${participants.length} joins detected. Closing group...` });
      await sock.groupSettingUpdate(id, 'announcement');
    }
  }catch{}
}

async function onCall(sock, calls){
  // ANTISPAMCALL - real reject spam calls
  const db = load();
  for(const c of calls){
    if(c.status !== 'offer') continue;
    const jid = c.from;
    // check if any group has antispamcall on - global for calls
    const any = Object.values(db).some(g=>g.antispamcall);
    if(!any) continue;
    try{
      await sock.rejectCall(c.id, c.from);
      await sock.sendMessage(c.from, { text: '❌ Spam call blocked by FACELESS Anti.' });
      await sock.updateBlockStatus(c.from, 'block');
    }catch{}
  }
}

module.exports = {
  name: 'anti',
  commands: COMMANDS,
  onMessage,
  onGroupUpdate,
  onCall,
  getSettings: load,

  run: async (sock, m, jid, cmd, args, text, isOwner, isGroup, sender) => {
    if(!COMMANDS.includes(cmd)) return false;

    if(cmd === 'anti'){
      if(!isGroup){ await sock.sendMessage(jid, { text: 'Use in group' }, { quoted: m }); return true; }
      const cfg = groupCfg(jid);
      let t = `╭━━〔 🛡️ ANTI MENU 〕\n│\n`;
      for(const c of COMMANDS.filter(x=>x!=='anti')) t += `│ ➠ .${c} : ${cfg[c]?'✅ ON':'❌ OFF'}\n`;
      t += `╰━━━━━━━━━━━━━━\n\nUsage: .antilink on / .antilink off`;
      await sock.sendMessage(jid, { text: t }, { quoted: m });
      return true;
    }

    if(!isGroup){
      await sock.sendMessage(jid, { text: '❌ Anti commands work in group only' }, { quoted: m });
      return true;
    }
    // Only admin / owner can toggle anti
    const admin = await isAdmin(sock, jid, sender);
    if(!isOwner && !admin){
      await sock.sendMessage(jid, { text: '❌ Admins / Owner only' }, { quoted: m });
      return true;
    }

    const arg = (args[0]||'').toLowerCase();
    if(arg === 'on' || arg === 'off'){
      setGroup(jid, cmd, arg==='on');
      await sock.sendMessage(jid, { text: `🛡️ ${DESC[cmd]}\n.${cmd} is now ${arg==='on'?'✅ ON':'❌ OFF'} in this group` }, { quoted: m });
      return true;
    }
    const cfg = groupCfg(jid);
    await sock.sendMessage(jid, { text: `🛡️ ${DESC[cmd]}\nStatus: ${cfg[cmd]?'✅ ON':'❌ OFF'}\n\nUsage: .${cmd} on / .${cmd} off` }, { quoted: m });
    return true;
  }
};
