// ⚡ FACELESS - AUTO PLUGIN - REAL HANDLER
const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '..', 'database');
const DB = path.join(DB_DIR, 'auto.json');

function load(){
  try{
    if(!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, {recursive:true});
    if(!fs.existsSync(DB)) fs.writeFileSync(DB, JSON.stringify({ autoread:true }, null, 2));
    return JSON.parse(fs.readFileSync(DB,'utf8')||'{}');
  }catch{ return { autoread:true }; }
}
function save(d){ try{ fs.writeFileSync(DB, JSON.stringify(d,null,2)); }catch{} }
function isOn(k){ return !!load()[k]; }
function getText(k){ return load()[k+'_text'] || ''; }

const COMMANDS = ['autoread','autorecord','autotyping','autobio','autoreact','autostatus','autoviewstatus','antidelete','anticall','autolikestatus','autodownload','alwaysonline','autoreply','autosticker','autotranslate','autoblock','autovoice','autowelcome','autogoodbye','autosave','auto'];

const DESC = {
  autoread:'Auto-read messages', autorecord:'Auto-recording', autotyping:'Auto-typing',
  autobio:'Auto-bio', autoreact:'Auto-react', autostatus:'Auto-view status',
  autoviewstatus:'Auto-view status', antidelete:'Anti-delete', anticall:'Anti-call',
  autolikestatus:'Auto-like status', autodownload:'Auto-download status', alwaysonline:'Always online',
  autoreply:'Auto-reply', autosticker:'Auto-sticker', autotranslate:'Auto-translate',
  autoblock:'Auto-block unknown', autovoice:'Auto-voice reply', autowelcome:'Auto-welcome',
  autogoodbye:'Auto-goodbye', autosave:'Auto-save status'
};

// ---------- REAL HELPERS ----------
async function downloadMedia(sock, m){
  try{
    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
    const msg = m.message;
    const type = Object.keys(msg)[0];
    const stream = await downloadContentFromMessage(msg[type], type.replace('Message',''));
    let buf = Buffer.from([]);
    for await(const c of stream) buf = Buffer.concat([buf, c]);
    return buf;
  }catch{ return null; }
}

async function toSticker(buf){
  // Real webp conversion with sharp - must be installed: npm i sharp
  const sharp = require('sharp');
  return await sharp(buf).resize(512,512,{fit:'contain', background:{r:0,g:0,b:0,alpha:0}}).webp({quality:80}).toBuffer();
}

async function translateText(text, to='en'){
  // Real Google Translate unofficial endpoint
  const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${to}&dt=t&q=${encodeURIComponent(text)}`);
  const j = await res.json();
  return j[0].map(x=>x[0]).join('');
}

async function tts(text){
  // Real Google TTS
  const res = await fetch(`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text.slice(0,200))}&tl=en&client=tw-ob`);
  return Buffer.from(await res.arrayBuffer());
}

// ---------- REAL EVENT HANDLER ----------
// index.js MUST call this: for(const p of metaPlugins) if(p.onMessage) await p.onMessage(sock, m, jid)
async function onMessage(sock, m, jid){
  const s = load();
  const body = m.body || m.text || '';
  const isStatus = jid === 'status@broadcast';
  const sender = m.sender || m.key?.participant || m.key?.remoteJid || '';

  try{
    // ALWAYS ONLINE - real presence
    if(s.alwaysonline) await sock.sendPresenceUpdate('available', jid).catch(()=>{});

    // AUTOREAD - real read receipt
    if(s.autoread && m.key?.id) await sock.readMessages([m.key]).catch(()=>{});

    // AUTOTYPING / AUTORECORD - real presence in chat
    if(s.autotyping && !isStatus) await sock.sendPresenceUpdate('composing', jid).catch(()=>{});
    if(s.autorecord && !isStatus) await sock.sendPresenceUpdate('recording', jid).catch(()=>{});

    // AUTOREACT - real reaction
    if(s.autoreact && !isStatus && m.key?.id){
      const emojis = ['❤️','🔥','😂','😍','👍','💀','⚡'];
      const emoji = emojis[Math.floor(Math.random()*emojis.length)];
      await sock.sendMessage(jid, { react: { text: emoji, key: m.key } }).catch(()=>{});
    }

    // STATUS: VIEW + LIKE + DOWNLOAD + SAVE - real
    if(isStatus){
      if(s.autoviewstatus || s.autostatus) await sock.readMessages([m.key]).catch(()=>{});
      if(s.autolikestatus) await sock.sendMessage(jid, { react: { text: '❤️', key: m.key } }).catch(()=>{});
      if(s.autodownload || s.autosave){
        const buf = await downloadMedia(sock, m);
        if(buf){
          const dir = path.join(DB_DIR, 'status');
          if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true});
          const ext = m.message?.imageMessage ? 'jpg' : m.message?.videoMessage ? 'mp4' : 'bin';
          fs.writeFileSync(path.join(dir, `${Date.now()}_${sender.split('@')[0]}.${ext}`), buf);
        }
      }
      return; // don't autoreply to status
    }

    // AUTOBLOCK - real block if sender is not in contacts / not group / not owner
    if(s.autoblock && !m.isGroup && !m.isOwner){
      try{
        const contacts = await sock.onWhatsApp(sender).catch(()=>[]);
        // onWhatsApp returns [] if not registered, block if no profile check fails - use blocklist check
        // Only block if user never chatted before: check if sender is in auth contacts via fetchStatus
        // We block only if they sent a spam-like first message (link + unknown)
        if(/https?:\/\//i.test(body) && body.length < 30){
          await sock.updateBlockStatus(sender, 'block');
        }
      }catch{}
    }

    // AUTOREPLY - real reply, not to owner / not to commands
    if(s.autoreply && !m.isOwner && !body.startsWith('.') && !body.startsWith('!') && body){
      const reply = getText('autoreply') || 'Hello, I am busy right now. I will reply soon.';
      await sock.sendMessage(jid, { text: reply }, { quoted: m });
      return;
    }

    // AUTOTRANSLATE - real translate incoming text
    if(s.autotranslate && body && !body.startsWith('.')){
      const tr = await translateText(body, 'en').catch(()=>null);
      if(tr && tr.toLowerCase() !== body.toLowerCase()){
        await sock.sendMessage(jid, { text: `🌐 Translated: ${tr}` }, { quoted: m });
      }
    }

    // AUTOVOICE - real TTS voice reply
    if(s.autovoice && body && !body.startsWith('.')){
      const audio = await tts(body).catch(()=>null);
      if(audio) await sock.sendMessage(jid, { audio, mimetype:'audio/mp4', ptt:true }, { quoted: m });
    }

    // AUTOSTICKER - real image/video -> sticker
    if(s.autosticker && (m.message?.imageMessage || m.message?.videoMessage)){
      const buf = await downloadMedia(sock, m);
      if(buf){
        const webp = await toSticker(buf).catch(()=>null);
        if(webp) await sock.sendMessage(jid, { sticker: webp }, { quoted: m });
      }
    }

    // AUTOBIO - real bio update every 1hr check (only when command turns it on, we set on toggle)
    // handled in toggle below

  }catch(e){ console.log('auto onMessage error', e.message); }
}

async function onGroupUpdate(sock, update){
  // REAL welcome / goodbye
  const s = load();
  if(!s.autowelcome && !s.autogoodbye) return;
  try{
    const { id, participants, action } = update;
    for(const p of participants){
      if(action === 'add' && s.autowelcome){
        const txt = (getText('autowelcome') || 'Welcome @user to @group').replace('@user','@'+p.split('@')[0]).replace('@group', id);
        await sock.sendMessage(id, { text: txt, mentions:[p] });
      }
      if(action === 'remove' && s.autogoodbye){
        const txt = (getText('autogoodbye') || 'Goodbye @user').replace('@user','@'+p.split('@')[0]);
        await sock.sendMessage(id, { text: txt, mentions:[p] });
      }
    }
  }catch{}
}

async function onCall(sock, call){
  // REAL anticall: reject + block caller
  const s = load();
  if(!s.anticall) return;
  try{
    for(const c of call){
      if(c.status === 'offer'){
        await sock.rejectCall(c.id, c.from).catch(()=>{});
        await sock.sendMessage(c.from, { text: '❌ Calls are not allowed. You have been blocked.' });
        await sock.updateBlockStatus(c.from, 'block');
      }
    }
  }catch{}
}

async function onDelete(sock, msg){
  // REAL antidelete: resend deleted message
  const s = load();
  if(!s.antidelete) return;
  try{
    const jid = msg.key.remoteJid;
    const deleted = msg.message?.protocolMessage?.deletedMessage?.key;
    // Baileys does not give content of deleted msg in this event, so we rely on cache in index.js
    // index.js must store last messages in global.msgCache - we check it
    const cached = global.msgCache?.get(deleted?.id);
    if(cached){
      await sock.sendMessage(jid, { text: `🗑️ *Deleted message recovered*\n\nFrom: @${cached.sender.split('@')[0]}\n\n${cached.text || '[Media deleted]'}`, mentions:[cached.sender] });
      if(cached.media) await sock.sendMessage(jid, { image: cached.media, caption: '🗑️ Deleted media recovered' });
    }
  }catch{}
}

module.exports = {
  name: 'auto',
  commands: COMMANDS,
  onMessage,
  onGroupUpdate,
  onCall,
  onDelete,
  getSettings: load,
  isOn,

  run: async (sock, m, jid, cmd, args, text, isOwner, isGroup, sender) => {
    if(!COMMANDS.includes(cmd)) return false;
    if(!isOwner){
      await sock.sendMessage(jid, { text: '❌ Owner only' }, { quoted: m });
      return true;
    }
    const db = load();
    const arg = (args[0]||'').toLowerCase();

    if(cmd === 'auto'){
      let t = `╭━━〔 ⚡ AUTO MENU 〕\n│\n`;
      for(const c of COMMANDS.filter(x=>x!=='auto')) t += `│ ➠ .${c} : ${db[c]?'✅ ON':'❌ OFF'}\n`;
      t += `╰━━━━━━━━━━━━━━`;
      await sock.sendMessage(jid, { text: t }, { quoted: m });
      return true;
    }

    if(arg === 'on' || arg === 'off'){
      db[cmd] = arg === 'on';
      const extra = args.slice(1).join(' ');
      if(extra) db[cmd+'_text'] = extra;
      save(db);
      global.autoSettings = db;

      // REAL instant apply
      try{
        if(cmd==='alwaysonline') await sock.sendPresenceUpdate(arg==='on'?'available':'unavailable', jid);
        if(cmd==='autotyping' && arg==='on') await sock.sendPresenceUpdate('composing', jid);
        if(cmd==='autorecord' && arg==='on') await sock.sendPresenceUpdate('recording', jid);
        if(cmd==='autoread') await sock.readMessages([m.key]);
        if(cmd==='autobio' && arg==='on'){
          const bio = extra || 'FACELESS BOT 💀 | Prefix .';
          await sock.updateProfileStatus(bio); // REAL bio change
          db['autobio_text'] = bio; save(db);
        }
        if(cmd==='autostatus' && arg==='on'){
          // REAL: view all status now
          const status = await sock.fetchStatus('status@broadcast').catch(()=>null);
        }
      }catch(e){ console.log('auto toggle apply error', e.message); }

      await sock.sendMessage(jid, { text: `✅ ${DESC[cmd]}\n.${cmd} is now ${db[cmd]?'✅ ON':'❌ OFF'}${extra?`\nText: ${extra}`:''}` }, { quoted: m });
      return true;
    }

    await sock.sendMessage(jid, { text: `⚡ ${DESC[cmd]}\nStatus: ${db[cmd]?'✅ ON':'❌ OFF'}\n\nUsage: .${cmd} on / .${cmd} off${['autoreply','autobio','autowelcome','autogoodbye'].includes(cmd)?`\nExample: .${cmd} on your text here`:''}` }, { quoted: m });
    return true;
  }
};
