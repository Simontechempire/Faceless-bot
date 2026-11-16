const { facelessReply, sendAwait } = require('../lib/function');
const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '../database/settings.json');

function loadSettings(){
  try{ if(fs.existsSync(settingsPath)) return JSON.parse(fs.readFileSync(settingsPath,'utf8')); }catch{}
  return {
    prefix: '.',
    mode: 'public', // public | self
    botName: 'META AI V2',
    ownerName: 'SIMON TECH',
    autoreply: false,
    autoreplyText: 'Hello! I am META AI V2. Type .menu for commands.',
    menuImage: '',
    antistatus: false,
    readReceipts: false,
    autoStatusReply: false,
    antilink: {},
    antisticker: {},
    antidelete: {},
    antibadword: {},
    welcome: {},
    goodbye: {}
  };
}
function saveSettings(d){
  try{ fs.mkdirSync(path.dirname(settingsPath),{recursive:true}); fs.writeFileSync(settingsPath, JSON.stringify(d,null,2)); }catch{}
}
function getSettings(){ return loadSettings(); }
function getPrefix(){ return loadSettings().prefix || '.'; }

module.exports = {
  name: "settings",
  loadSettings, saveSettings, getSettings, getPrefix,

  async run(sock, m, jid, cmd, args, text, isOwner, isGroup, sender){

    const setCmds = ['setprefix','prefix','mode','setmode','setbotname','botname','setowner','setmenuimage','menuimage','autoreply','setautoreply','settings','setting','allsettings','resetsettings','antistatus','setwelcome','setgoodbye'];
    if(!setCmds.includes(cmd)) return false;

    if(!isOwner){
      await facelessReply(sock, jid, "This Command Is For Owner Only", m);
      return true;
    }
    await sendAwait(sock, jid, m);

    // ================= VIEW ALL SETTINGS - REAL =================
    if(cmd === 'settings' || cmd === 'setting' || cmd === 'allsettings'){
      const s = loadSettings();
      await facelessReply(sock, jid,
`▫️ 💀 BOT SETTINGS

Prefix: ${s.prefix}
Mode: ${s.mode}
Bot Name: ${s.botName}
Owner Name: ${s.ownerName}
AutoReply: ${s.autoreply ? 'ON' : 'OFF'}
AutoReply Text: ${s.autoreplyText}
Menu Image: ${s.menuImage ? 'Set' : 'Not Set'}
AntiStatus: ${s.antistatus ? 'ON' : 'OFF'}

Change With:
.setprefix !
.mode self
.setbotname New Name
.autoreply on
.setautoreply <text>
.setmenuimage <link>`, m);
      return true;
    }

    // ================= SET PREFIX - REAL =================
    if(cmd === 'setprefix' || cmd === 'prefix'){
      const newPrefix = args[0];
      if(!newPrefix || newPrefix.length > 2){
        await facelessReply(sock, jid, "Usage: .setprefix !\nExample: .setprefix ! / .setprefix /", m);
        return true;
      }
      const s = loadSettings();
      s.prefix = newPrefix;
      saveSettings(s);
      await facelessReply(sock, jid, `Prefix Changed To: ${newPrefix}\nExample: ${newPrefix}menu`, m);
      return true;
    }

    // ================= MODE - REAL public / self =================
    if(cmd === 'mode' || cmd === 'setmode'){
      const mode = (args[0]||'').toLowerCase();
      if(mode !== 'public' && mode !== 'self'){
        await facelessReply(sock, jid, "Usage: .mode public / .mode self\nPublic = Everyone Can Use Bot\nSelf = Only Owner", m);
        return true;
      }
      const s = loadSettings();
      s.mode = mode;
      saveSettings(s);
      await facelessReply(sock, jid, `Bot Mode Changed To: ${mode.toUpperCase()}`, m);
      return true;
    }

    // ================= BOT NAME =================
    if(cmd === 'setbotname' || cmd === 'botname'){
      if(!text){ await facelessReply(sock, jid, "Usage: .setbotname META AI V2", m); return true; }
      const s = loadSettings();
      s.botName = text;
      saveSettings(s);
      await facelessReply(sock, jid, `Bot Name Changed To: ${text}`, m);
      return true;
    }

    // ================= OWNER NAME =================
    if(cmd === 'setowner'){
      if(!text){ await facelessReply(sock, jid, "Usage: .setowner Simon Tech", m); return true; }
      const s = loadSettings();
      s.ownerName = text;
      saveSettings(s);
      await facelessReply(sock, jid, `Owner Name Changed To: ${text}`, m);
      return true;
    }

    // ================= MENU IMAGE - REAL =================
    if(cmd === 'setmenuimage' || cmd === 'menuimage'){
      if(!text || !text.startsWith('http')){
        await facelessReply(sock, jid, "Usage: .setmenuimage <image link>", m);
        return true;
      }
      const s = loadSettings();
      s.menuImage = text;
      saveSettings(s);
      await facelessReply(sock, jid, `Menu Image Set\nIt Will Show On .menu`, m);
      return true;
    }

    // ================= AUTOREPLY - REAL =================
    if(cmd === 'autoreply'){
      const action = (args[0]||'').toLowerCase();
      if(action !== 'on' && action !== 'off'){
        await facelessReply(sock, jid, "Usage: .autoreply on / .autoreply off", m);
        return true;
      }
      const s = loadSettings();
      s.autoreply = action === 'on';
      saveSettings(s);
      await facelessReply(sock, jid, `AutoReply Turned ${action.toUpperCase()}`, m);
      return true;
    }
    if(cmd === 'setautoreply'){
      if(!text){ await facelessReply(sock, jid, "Usage: .setautoreply <text>", m); return true; }
      const s = loadSettings();
      s.autoreplyText = text;
      s.autoreply = true;
      saveSettings(s);
      await facelessReply(sock, jid, `AutoReply Text Set To:\n${text}`, m);
      return true;
    }

    // ================= ANTISTATUS - REAL =================
    if(cmd === 'antistatus'){
      const action = (args[0]||'').toLowerCase();
      if(action !== 'on' && action !== 'off'){
        await facelessReply(sock, jid, "Usage: .antistatus on / .antistatus off", m);
        return true;
      }
      const s = loadSettings();
      s.antistatus = action === 'on';
      saveSettings(s);
      await facelessReply(sock, jid, `AntiStatus Turned ${action.toUpperCase()}`, m);
      return true;
    }

    // ================= WELCOME / GOODBYE TEXT - REAL =================
    if(cmd === 'setwelcome' || cmd === 'setgoodbye'){
      if(!isGroup){ await facelessReply(sock, jid, "Use In Group Only", m); return true; }
      if(!text){ await facelessReply(sock, jid, `Usage: .${cmd} <message>\nUse @user for mention`, m); return true; }
      const s = loadSettings();
      const key = cmd === 'setwelcome' ? 'welcome' : 'goodbye';
      if(!s[key]) s[key] = {};
      s[key][jid] = text;
      saveSettings(s);
      await facelessReply(sock, jid, `${key} Message Set For This Group:\n${text}`, m);
      return true;
    }

    // ================= RESET - REAL =================
    if(cmd === 'resetsettings'){
      if(fs.existsSync(settingsPath)) fs.unlinkSync(settingsPath);
      await facelessReply(sock, jid, "All Settings Reset To Default\nPrefix: .\nMode: public", m);
      return true;
    }

    return false;
  },

  // ===== REAL AUTOREPLY ENFORCER - Called from index.js =====
  async handleAutoReply(sock, m, jid){
    const s = loadSettings();
    if(!s.autoreply) return false;
    // Only reply if message is NOT a command
    const body = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
    if(body.startsWith(s.prefix)) return false;
    try{
      await facelessReply(sock, jid, s.autoreplyText, m);
      return true;
    }catch{ return false; }
  }
};
