const { facelessReply, sendAwait } = require('../lib/function');
const fs = require('fs');
const path = require('path');

const autoPath = path.join(__dirname, '../database/auto.json');

function loadAuto(){
  try{ if(fs.existsSync(autoPath)) return JSON.parse(fs.readFileSync(autoPath,'utf8')); }catch{}
  return { autostatus: false, autoreact: false, autotyping: false, autoread: false, welcome: {}, goodbye: {} };
}
function saveAuto(d){
  try{ fs.mkdirSync(path.dirname(autoPath),{recursive:true}); fs.writeFileSync(autoPath, JSON.stringify(d,null,2)); }catch{}
}

// Real welcome / goodbye DB per group
function getWelcome(jid){
  const db = loadAuto();
  return db.welcome[jid] || false;
}
function getGoodbye(jid){
  const db = loadAuto();
  return db.goodbye[jid] || false;
}

const reactEmojis = ['❤️','😂','🔥','😍','😮','👍','💀','🙏','😭','😎'];

module.exports = {
  name: "auto",
  loadAuto, saveAuto,

  // ===== REAL AUTO STATUS VIEW - Called from index.js on status update =====
  async handleStatus(sock, statusMsg){
    const db = loadAuto();
    if(!db.autostatus) return;
    try{
      const jid = statusMsg.key.remoteJid; // status@broadcast
      // Real: mark as read + react
      await sock.readMessages([statusMsg.key]);
      // React with random emoji
      const emoji = reactEmojis[Math.floor(Math.random()*reactEmojis.length)];
      await sock.sendMessage(jid, { react: { text: emoji, key: statusMsg.key } });
    }catch{}
  },

  // ===== REAL AUTO REACT - Called on every message =====
  async handleAutoReact(sock, m, jid){
    const db = loadAuto();
    if(!db.autoreact) return;
    try{
      const emoji = reactEmojis[Math.floor(Math.random()*reactEmojis.length)];
      await sock.sendMessage(jid, { react: { text: emoji, key: m.key } });
    }catch{}
  },

  // ===== REAL AUTO READ + TYPING =====
  async handleAutoReadTyping(sock, m, jid){
    const db = loadAuto();
    if(db.autoread){
      try{ await sock.readMessages([m.key]); }catch{}
    }
    if(db.autotyping){
      try{
        await sock.sendPresenceUpdate('composing', jid);
        setTimeout(async () => {
          try{ await sock.sendPresenceUpdate('paused', jid); }catch{}
        }, 2000);
      }catch{}
    }
  },

  // ===== REAL WELCOME - Called on groupParticipantsUpdate ADD =====
  async handleWelcome(sock, jid, participants, action){
    const db = loadAuto();
    if(action === 'add' && db.welcome[jid]){
      for(const p of participants){
        try{
          let pp = '';
          try{ pp = await sock.profilePictureUrl(p, 'image'); }catch{}
          const caption = `▫️ 💀 Welcome To The Group\n\n@${p.split('@')[0]}\nWe Are Happy To Have You Here!\nRead Group Rules And Enjoy`;
          if(pp) await sock.sendMessage(jid, { image: { url: pp }, caption, mentions: [p] });
          else await sock.sendMessage(jid, { text: caption, mentions: [p] });
        }catch{}
      }
    }
    if(action === 'remove' && db.goodbye[jid]){
      for(const p of participants){
        try{
          await sock.sendMessage(jid, { text: `▫️ 💀 Goodbye @${p.split('@')[0]}\nWe Will Miss You`, mentions: [p] });
        }catch{}
      }
    }
  },

  // ===== COMMANDS =====
  async run(sock, m, jid, cmd, args, text, isOwner, isGroup, sender){

    const autoCmds = ['autostatus','autoreact','autotyping','autoread','welcome','goodbye','autobio'];
    if(!autoCmds.includes(cmd)) return false;

    if(!isOwner){
      await facelessReply(sock, jid, "This Command Is For Owner Only", m);
      return true;
    }

    await sendAwait(sock, jid, m);
    const action = (args[0]||"").toLowerCase();

    // --- GLOBAL TOGGLES: autostatus / autoreact / autotyping / autoread ---
    if(['autostatus','autoreact','autotyping','autoread'].includes(cmd)){
      if(action !== 'on' && action !== 'off'){
        await facelessReply(sock, jid, `Usage: .${cmd} on / .${cmd} off`, m);
        return true;
      }
      const db = loadAuto();
      db[cmd] = action === 'on';
      saveAuto(db);
      await facelessReply(sock, jid, `${cmd} Turned ${action.toUpperCase()}`, m);
      return true;
    }

    // --- WELCOME / GOODBYE - Per Group ---
    if(cmd === 'welcome' || cmd === 'goodbye'){
      if(!isGroup){
        await facelessReply(sock, jid, "This Command Works In Group Only", m);
        return true;
      }
      if(action !== 'on' && action !== 'off'){
        await facelessReply(sock, jid, `Usage: .${cmd} on / .${cmd} off`, m);
        return true;
      }
      const db = loadAuto();
      if(!db.welcome) db.welcome = {};
      if(!db.goodbye) db.goodbye = {};
      db[cmd][jid] = action === 'on';
      saveAuto(db);
      await facelessReply(sock, jid, `${cmd} Turned ${action.toUpperCase()} For This Group`, m);
      return true;
    }

    // --- AUTOBIO - REAL: Update bio every hour with time ---
    if(cmd === 'autobio'){
      if(action !== 'on' && action !== 'off'){
        await facelessReply(sock, jid, "Usage: .autobio on / .autobio off", m);
        return true;
      }
      const db = loadAuto();
      db.autobio = action === 'on';
      saveAuto(db);
      if(action === 'on'){
        // Real immediate update
        try{
          const time = new Date().toLocaleTimeString('en-NG',{timeZone:'Africa/Lagos', hour:'2-digit', minute:'2-digit'});
          await sock.updateProfileStatus(`▫️ 💀 FACELESS BOT | Online ${time} | Made By Faceless`);
        }catch{}
      }
      await facelessReply(sock, jid, `Autobio Turned ${action.toUpperCase()}`, m);
      return true;
    }

    return false;
  }
};
