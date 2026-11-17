// 👁️ FACELESS - VV (VIEWONCE) PLUGIN - REAL HANDLER
const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const DB_DIR = path.join(__dirname, '..', 'database');
const VV_DIR = path.join(DB_DIR, 'vv');

function ensureDir(){
  if(!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR,{recursive:true});
  if(!fs.existsSync(VV_DIR)) fs.mkdirSync(VV_DIR,{recursive:true});
}

// Unwrap viewonce - real Baileys structure
function unwrap(msg){
  if(!msg) return null;
  if(msg.viewOnceMessage) return { inner: msg.viewOnceMessage.message, type: Object.keys(msg.viewOnceMessage.message)[0], isVO: true };
  if(msg.viewOnceMessageV2) return { inner: msg.viewOnceMessageV2.message, type: Object.keys(msg.viewOnceMessageV2.message)[0], isVO: true };
  if(msg.viewOnceMessageV2Extension) return { inner: msg.viewOnceMessageV2Extension.message, type: Object.keys(msg.viewOnceMessageV2Extension.message)[0], isVO: true };
  // direct media (not viewonce but user used .vv on normal media)
  const k = Object.keys(msg)[0];
  if(['imageMessage','videoMessage','audioMessage','stickerMessage','documentMessage'].includes(k)) return { inner: msg, type: k, isVO: false };
  return null;
}

async function downloadMedia(msgObj, type){
  const kind = type.replace('Message',''); // image, video, audio, sticker, document
  const stream = await downloadContentFromMessage(msgObj, kind);
  let buf = Buffer.from([]);
  for await(const c of stream) buf = Buffer.concat([buf, c]);
  return buf;
}

async function getQuotedVV(sock, m){
  // Get quoted message from contextInfo
  const ctx = m.message?.extendedTextMessage?.contextInfo || m.message?.imageMessage?.contextInfo || m.message?.videoMessage?.contextInfo;
  if(!ctx?.quotedMessage) return null;
  return { quoted: ctx.quotedMessage, sender: ctx.participant, stanzaId: ctx.stanzaId, ctx };
}

async function sendRecovered(sock, jid, m, buf, type, caption, saveFile=true){
  ensureDir();
  const extMap = { imageMessage:'jpg', videoMessage:'mp4', audioMessage:'mp3', stickerMessage:'webp', documentMessage:'pdf' };
  const ext = extMap[type] || 'bin';
  let file = null;
  if(saveFile){
    file = path.join(VV_DIR, `${Date.now()}.${ext}`);
    fs.writeFileSync(file, buf);
  }

  if(type === 'imageMessage') await sock.sendMessage(jid, { image: buf, caption: caption || '👁️ ViewOnce Image Recovered' }, { quoted: m });
  else if(type === 'videoMessage') await sock.sendMessage(jid, { video: buf, caption: caption || '👁️ ViewOnce Video Recovered' }, { quoted: m });
  else if(type === 'audioMessage') await sock.sendMessage(jid, { audio: buf, mimetype:'audio/mp4', ptt: false }, { quoted: m });
  else if(type === 'stickerMessage') await sock.sendMessage(jid, { sticker: buf }, { quoted: m });
  else if(type === 'documentMessage') await sock.sendMessage(jid, { document: buf, fileName: `vv_${Date.now()}.${ext}`, mimetype:'application/pdf', caption: caption || '👁️ ViewOnce Doc Recovered' }, { quoted: m });
  else await sock.sendMessage(jid, { text: caption || '👁️ Recovered' }, { quoted: m });

  return file;
}

const COMMANDS = ['vv','vv2','vv3','vv4','vv5','save','retrieve','getviewonce','viewonce','vvimage','vvvideo','vvaudio','vvsticker','vvstatus','vvdoc','vvmedia','vvforward','vvinfo','vvdownload'];

module.exports = {
  name: 'vv',
  commands: COMMANDS,

  // REAL auto-save: index.js will call this - saves every viewonce that passes through
  onMessage: async (sock, m, jid) => {
    try{
      const unwrapped = unwrap(m.message);
      if(!unwrapped?.isVO) return;
      ensureDir();
      const buf = await downloadMedia(unwrapped.inner[unwrapped.type], unwrapped.type);
      if(!buf) return;
      const extMap = { imageMessage:'jpg', videoMessage:'mp4', audioMessage:'mp3', stickerMessage:'webp', documentMessage:'pdf' };
      const file = path.join(VV_DIR, `${Date.now()}_${m.sender?.split('@')[0]}.${extMap[unwrapped.type]||'bin'}`);
      fs.writeFileSync(file, buf);
      // store in global cache for .retrieve
      global.vvCache = global.vvCache || new Map();
      global.vvCache.set(m.key.id, { file, type: unwrapped.type, sender: m.sender, jid, time: Date.now() });
    }catch(e){ console.log('vv autosave', e.message); }
  },

  run: async (sock, m, jid, cmd, args, text, isOwner, isGroup, sender) => {
    if(!COMMANDS.includes(cmd)) return false;
    ensureDir();

    // --- VVINFO - list saved VV files ---
    if(cmd === 'vvinfo'){
      const files = fs.existsSync(VV_DIR) ? fs.readdirSync(VV_DIR) : [];
      if(!files.length){ await sock.sendMessage(jid, { text: 'No saved ViewOnce yet.\nSend a ViewOnce and use .vv on it.' }, { quoted: m }); return true; }
      await sock.sendMessage(jid, { text: `👁️ *Saved ViewOnce: ${files.length}*\n\n${files.slice(-20).map((f,i)=>`${i+1}. ${f}`).join('\n')}\n\nUse .retrieve to get last one` }, { quoted: m });
      return true;
    }

    // --- RETRIEVE / VVSTATUS - send last saved ---
    if(cmd === 'retrieve' || cmd === 'vvstatus'){
      const files = fs.existsSync(VV_DIR) ? fs.readdirSync(VV_DIR).sort() : [];
      if(!files.length){ await sock.sendMessage(jid, { text: 'No saved ViewOnce found.' }, { quoted: m }); return true; }
      const last = files[files.length-1];
      const buf = fs.readFileSync(path.join(VV_DIR, last));
      const ext = last.split('.').pop();
      if(['jpg','jpeg','png','webp'].includes(ext)) await sock.sendMessage(jid, { image: buf, caption: '👁️ Retrieved ViewOnce' }, { quoted: m });
      else if(['mp4'].includes(ext)) await sock.sendMessage(jid, { video: buf, caption: '👁️ Retrieved ViewOnce' }, { quoted: m });
      else if(['mp3','opus'].includes(ext)) await sock.sendMessage(jid, { audio: buf, mimetype:'audio/mp4' }, { quoted: m });
      else await sock.sendMessage(jid, { document: buf, fileName: last }, { quoted: m });
      return true;
    }

    // --- SAVE - save quoted media (not just viewonce) ---
    if(cmd === 'save'){
      const q = await getQuotedVV(sock, m);
      if(!q){ await sock.sendMessage(jid, { text: 'Reply to a ViewOnce / image / video / audio to save it\nUsage: reply + .save' }, { quoted: m }); return true; }
      const u = unwrap(q.quoted);
      if(!u){ await sock.sendMessage(jid, { text: '❌ No media in quoted message' }, { quoted: m }); return true; }
      const buf = await downloadMedia(u.inner[u.type], u.type);
      const file = await sendRecovered(sock, jid, m, buf, u.type, '✅ Saved');
      await sock.sendMessage(jid, { text: `✅ Saved: ${path.basename(file)}` }, { quoted: m });
      return true;
    }

    // --- VVFOWARD - forward recovered to a number ---
    if(cmd === 'vvforward'){
      const num = (args[0]||'').replace(/[^0-9]/g,'');
      if(!num){ await sock.sendMessage(jid, { text: 'Usage: reply to ViewOnce + .vvforward 2349037483649' }, { quoted: m }); return true; }
      const q = await getQuotedVV(sock, m);
      if(!q){ await sock.sendMessage(jid, { text: 'Reply to a ViewOnce first' }, { quoted: m }); return true; }
      const u = unwrap(q.quoted);
      if(!u){ await sock.sendMessage(jid, { text: '❌ No media' }, { quoted: m }); return true; }
      const buf = await downloadMedia(u.inner[u.type], u.type);
      const targetJid = num + '@s.whatsapp.net';
      if(u.type==='imageMessage') await sock.sendMessage(targetJid, { image: buf, caption: '👁️ Forwarded ViewOnce' });
      else if(u.type==='videoMessage') await sock.sendMessage(targetJid, { video: buf, caption: '👁️ Forwarded ViewOnce' });
      else if(u.type==='audioMessage') await sock.sendMessage(targetJid, { audio: buf, mimetype:'audio/mp4' });
      else if(u.type==='stickerMessage') await sock.sendMessage(targetJid, { sticker: buf });
      else await sock.sendMessage(targetJid, { document: buf, fileName: `vv_${Date.now()}` });
      await sock.sendMessage(jid, { text: `✅ Forwarded to @${num}`, mentions:[targetJid] }, { quoted: m });
      return true;
    }

    // --- MAIN VV COMMANDS - all do same real recovery, filtered by type ---
    // .vv .vv2 .vv3 .vv4 .vv5 .getviewonce .viewonce .vvimage .vvvideo .vvaudio .vvsticker .vvdoc .vvmedia .vvdownload
    const q = await getQuotedVV(sock, m);
    if(!q){
      await sock.sendMessage(jid, { text: `👁️ *How to use .${cmd}*\n\n1. Open the ViewOnce message\n2. Reply to it with .${cmd}\n\nOr just send ViewOnce - bot auto-saves it.\nThen use .retrieve to get last saved.` }, { quoted: m });
      return true;
    }
    const u = unwrap(q.quoted);
    if(!u){
      await sock.sendMessage(jid, { text: '❌ This is not a ViewOnce / media message.\nReply to a real ViewOnce photo/video.' }, { quoted: m });
      return true;
    }
    // Type filter
    const filterMap = { vvimage:'imageMessage', vvvideo:'videoMessage', vvaudio:'audioMessage', vvsticker:'stickerMessage', vvdoc:'documentMessage' };
    if(filterMap[cmd] && u.type !== filterMap[cmd]){
      await sock.sendMessage(jid, { text: `❌ This ViewOnce is ${u.type.replace('Message','')} not ${filterMap[cmd].replace('Message','')}\nUse .vv instead` }, { quoted: m });
      return true;
    }

    try{
      await sock.sendMessage(jid, { text: '⏳ Recovering ViewOnce...' }, { quoted: m });
      const buf = await downloadMedia(u.inner[u.type], u.type);
      if(!buf || buf.length < 100){ await sock.sendMessage(jid, { text: '❌ Failed to download - ViewOnce may have expired / already opened' }, { quoted: m }); return true; }
      const senderName = q.sender ? q.sender.split('@')[0] : 'unknown';
      await sendRecovered(sock, jid, m, buf, u.type, `👁️ *ViewOnce Recovered*\nFrom: @${senderName}\nType: ${u.type.replace('Message','')}\nSize: ${(buf.length/1024).toFixed(1)} KB`);
      // mention sender
      if(q.sender) await sock.sendMessage(jid, { text: `From: @${senderName}`, mentions:[q.sender] });
    }catch(e){
      await sock.sendMessage(jid, { text: `❌ VV failed: ${e.message}\nTry opening ViewOnce first, then reply quickly with .vv` }, { quoted: m });
    }
    return true;
  }
};
