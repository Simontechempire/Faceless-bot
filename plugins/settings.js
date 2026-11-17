// ⚙️ FACELESS - SETTINGS PLUGIN - REAL HANDLER
// Group settings: antilink, welcome, goodbye, antispam, antilink2, antibadword, autoreact, etc
// Bot settings: mode, prefix, autobio, etc - stored in memory + JSON file

const fs = require('fs');
const path = require('path');

let SETTINGS = {};
const SETTINGS_FILE = path.join(__dirname, '../settings.json');

// Load
try{ if(fs.existsSync(SETTINGS_FILE)) SETTINGS = JSON.parse(fs.readFileSync(SETTINGS_FILE,'utf8')); }catch{ SETTINGS = {}; }
function save(){
  try{ fs.writeFileSync(SETTINGS_FILE, JSON.stringify(SETTINGS, null, 2)); }catch{}
}
function getGroup(jid){
  if(!SETTINGS.groups) SETTINGS.groups = {};
  if(!SETTINGS.groups[jid]) SETTINGS.groups[jid] = {
    antilink: false, antilink2: false, welcome: false, goodbye: false,
    antispam: false, antibadword: false, antisticker: false, antiviewonce: false,
    antilinkall: false, antitag: false, antimedia: false, autoreact: false,
    nsfw: false, economy: true, games: true, fun: true, chat: true,
    onlyadmin: false, onlyowner: false, muted: false
  };
  return SETTINGS.groups[jid];
}
function getBot(){
  if(!SETTINGS.bot) SETTINGS.bot = {
    mode: 'public', prefix: '.', autobio: false, autoread: false,
    autotype: false, autoreact: false, antidelete: false, antcall: false,
    autorecord: false, anticall: false, statusview: false, alwaysonline: false
  };
  return SETTINGS.bot;
}

const GROUP_TOGGLES = {
  antilink: 'Anti-Link - deletes WhatsApp / Telegram links',
  antilink2: 'Anti-Link 2 - deletes ALL links',
  antilinkall: 'Anti-Link All - deletes any URL',
  welcome: 'Welcome - welcomes new members',
  goodbye: 'Goodbye - says bye to leavers',
  antispam: 'Anti-Spam - kicks spammers',
  antibadword: 'Anti-Badword - deletes bad words',
  antisticker: 'Anti-Sticker - deletes stickers',
  antiviewonce: 'Anti-ViewOnce - resends view-once',
  antitag: 'Anti-TagAll - blocks tagall spam',
  antimedia: 'Anti-Media - deletes photos/videos (strict)',
  autoreact: 'Auto-React - reacts to messages',
  nsfw: 'NSFW - allows anime NSFW (SFW only in this bot)',
  economy: 'Economy - allows .daily .balance .work',
  games: 'Games - allows .ttt .quiz .guess',
  fun: 'Fun - allows .joke .meme .roast',
  chat: 'Chat - allows .chat AI',
  onlyadmin: 'Only Admin - only admins can use bot',
  onlyowner: 'Only Owner - only owner can use bot',
  muted: 'Muted - bot silent in group',
};

const BOT_TOGGLES = {
  mode: 'Mode - public / private / self',
  prefix: 'Prefix - . / ! / #',
  autobio: 'Auto-Bio - updates bio with time',
  autoread: 'Auto-Read - marks messages read',
  autotype: 'Auto-Type - shows typing',
  autoreact: 'Auto-React - reacts to all messages',
  antidelete: 'Anti-Delete - resends deleted messages',
  antcall: 'Anti-Call - rejects calls',
  anticall: 'Anti-Call - rejects calls',
  autorecord: 'Auto-Record - shows recording',
  statusview: 'Status View - views all statuses',
  alwaysonline: 'Always Online - always online',
};

const COMMANDS = ['settings','setting','set','toggle','enable','disable','on','off','antilink','welcome','goodbye','antispam','antibadword','antisticker','antiviewonce','antitag','antimedia','autoreact','nsfw','economy','games','fun','chat','onlyadmin','onlyowner','muted','mode','prefix','autobio','autoread','autotype','antidelete','antcall','anticall','autorecord','statusview','alwaysonline','groupsettings','botsettings','botsetting','config','viewsettings','resetsettings','antilinkall','antilink2'];

module.exports = {
  name: 'settings',
  commands: COMMANDS,
  // Export helpers for index.js to use in message handler
  getGroup, getBot, SETTINGS, save,
  run: async (sock, m, jid, cmd, args, text, isOwner, isGroup, sender) => {
    if(!COMMANDS.includes(cmd)) return false;

    // --- Helper: check admin ---
    async function isAdmin(){
      if(!isGroup) return true;
      try{
        const meta = await sock.groupMetadata(jid);
        const p = meta.participants.find(x=>x.id===sender);
        return p?.admin==='admin' || p?.admin==='superadmin' || isOwner;
      }catch{ return isOwner; }
    }

    // --- SETTINGS MENU ---
    if(cmd==='settings' || cmd==='setting' || cmd==='groupsettings' || cmd==='viewsettings' || cmd==='config'){
      if(!isGroup){
        const bot = getBot();
        let msg = `⚙️ *BOT SETTINGS*\n\n`;
        msg += `Mode: ${bot.mode}\nPrefix: ${bot.prefix}\nAuto-Bio: ${bot.autobio?'ON ✅':'OFF ❌'}\nAuto-Read: ${bot.autoread?'ON ✅':'OFF ❌'}\nAuto-Type: ${bot.autotype?'ON ✅':'OFF ❌'}\nAnti-Delete: ${bot.antidelete?'ON ✅':'OFF ❌'}\nAnti-Call: ${bot.antcall?'ON ✅':'OFF ❌'}\n\n_Usage: .mode public / .prefix ! / .autobio on_\n_Only owner can change bot settings_`;
        await sock.sendMessage(jid, { text: msg }, { quoted: m });
        return true;
      }
      const g = getGroup(jid);
      let msg = `⚙️ *GROUP SETTINGS*\n\n`;
      for(const [k,v] of Object.entries(g)){
        const label = GROUP_TOGGLES[k]||k;
        msg += `${v?'✅':'❌'} .${k} - ${label}\n`;
      }
      msg += `\n_Usage: .antilink on / .welcome off_\n_Admins + Owner only_`;
      await sock.sendMessage(jid, { text: msg }, { quoted: m });
      return true;
    }

    if(cmd==='botsettings' || cmd==='botsetting'){
      const bot = getBot();
      let msg = `🤖 *BOT SETTINGS*\n\n`;
      for(const [k,v] of Object.entries(bot)){
        msg += `${k}: ${v}\n`;
      }
      msg += `\n_Usage: .mode public / .prefix !_\n_Only owner_`;
      await sock.sendMessage(jid, { text: msg }, { quoted: m });
      return true;
    }

    // --- RESET ---
    if(cmd==='resetsettings'){
      if(!(await isAdmin())){ await sock.sendMessage(jid, { text: '❌ Only admins / owner can do this' }, { quoted: m }); return true; }
      if(isGroup){ delete SETTINGS.groups[jid]; save(); await sock.sendMessage(jid, { text: '✅ Group settings reset to default' }, { quoted: m }); }
      else { SETTINGS.bot = null; save(); await sock.sendMessage(jid, { text: '✅ Bot settings reset' }, { quoted: m }); }
      return true;
    }

    // --- GROUP TOGGLES ---
    if(GROUP_TOGGLES[cmd]){
      if(!isGroup){ await sock.sendMessage(jid, { text: `❌ .${cmd} is only for groups` }, { quoted: m }); return true; }
      if(!(await isAdmin())){ await sock.sendMessage(jid, { text: '❌ Only group admins / owner can change settings' }, { quoted: m }); return true; }
      const arg = (args[0]||'').toLowerCase();
      const g = getGroup(jid);
      if(arg==='on' || arg==='enable' || arg==='1' || arg==='true'){
        g[cmd]=true; save();
        await sock.sendMessage(jid, { text: `✅ *${cmd.toUpperCase()} ENABLED*\n\n${GROUP_TOGGLES[cmd]}` }, { quoted: m });
      } else if(arg==='off' || arg==='disable' || arg==='0' || arg==='false'){
        g[cmd]=false; save();
        await sock.sendMessage(jid, { text: `❌ *${cmd.toUpperCase()} DISABLED*\n\n${GROUP_TOGGLES[cmd]}` }, { quoted: m });
      } else {
        // Toggle if no arg
        g[cmd]=!g[cmd]; save();
        await sock.sendMessage(jid, { text: `${g[cmd]?'✅':'❌'} *${cmd.toUpperCase()}* is now ${g[cmd]?'ON':'OFF'}\n\n${GROUP_TOGGLES[cmd]}\n\n_Usage: .${cmd} on / .${cmd} off_` }, { quoted: m });
      }
      return true;
    }

    // --- ENABLE / DISABLE generic ---
    if(cmd==='enable' || cmd==='disable' || cmd==='toggle' || cmd==='on' || cmd==='off'){
      if(!isGroup){ await sock.sendMessage(jid, { text: '❌ Use in group' }, { quoted: m }); return true; }
      if(!(await isAdmin())){ await sock.sendMessage(jid, { text: '❌ Only admins' }, { quoted: m }); return true; }
      const feature = (args[0]||'').toLowerCase().replace('.','');
      if(!GROUP_TOGGLES[feature] && !BOT_TOGGLES[feature]){ await sock.sendMessage(jid, { text: `❌ Unknown feature: ${feature}\n\nAvailable: ${Object.keys(GROUP_TOGGLES).join(', ')}` }, { quoted: m }); return true; }
      const g = getGroup(jid);
      const newVal = cmd==='enable' || cmd==='on' ? true : cmd==='disable' || cmd==='off' ? false : !g[feature];
      g[feature]=newVal; save();
      await sock.sendMessage(jid, { text: `${newVal?'✅':'❌'} *${feature.toUpperCase()}* is now ${newVal?'ON':'OFF'}` }, { quoted: m });
      return true;
    }

    // --- SET generic ---
    if(cmd==='set'){
      const feature = (args[0]||'').toLowerCase();
      const value = args[1]||'';
      if(GROUP_TOGGLES[feature]){
        if(!(await isAdmin())){ await sock.sendMessage(jid, { text: '❌ Only admins' }, { quoted: m }); return true; }
        const g = getGroup(jid);
        g[feature] = value==='on' ? true : value==='off' ? false : value;
        save(); await sock.sendMessage(jid, { text: `✅ ${feature} set to ${g[feature]}` }, { quoted: m }); return true;
      }
      if(feature==='prefix' || feature==='mode'){
        if(!isOwner){ await sock.sendMessage(jid, { text: '❌ Only owner' }, { quoted: m }); return true; }
        const bot = getBot();
        bot[feature]=value; save(); await sock.sendMessage(jid, { text: `✅ Bot ${feature} set to ${value}` }, { quoted: m }); return true;
      }
      await sock.sendMessage(jid, { text: 'Usage: .set antilink on / .set mode public / .set prefix !' }, { quoted: m });
      return true;
    }

    // --- BOT TOGGLES - owner only ---
    if(BOT_TOGGLES[cmd]){
      if(!isOwner){ await sock.sendMessage(jid, { text: '❌ Only owner can change bot settings' }, { quoted: m }); return true; }
      const bot = getBot();
      // Special: mode / prefix need value
      if(cmd==='mode'){
        const mode = (args[0]||'').toLowerCase();
        if(!['public','private','self'].includes(mode)){ await sock.sendMessage(jid, { text: 'Usage: .mode public / private / self\n\npublic = everyone can use\nprivate = only owner\nself = only owner in DM' }, { quoted: m }); return true; }
        bot.mode=mode; save();
        await sock.sendMessage(jid, { text: `✅ *MODE* set to ${mode.toUpperCase()}` }, { quoted: m });
        return true;
      }
      if(cmd==='prefix'){
        const p = args[0]||'.';
        bot.prefix=p; save();
        await sock.sendMessage(jid, { text: `✅ *PREFIX* set to ${p}\n\nRestart bot to apply fully` }, { quoted: m });
        return true;
      }
      const arg = (args[0]||'').toLowerCase();
      if(arg==='on' || arg==='enable') bot[cmd]=true;
      else if(arg==='off' || arg==='disable') bot[cmd]=false;
      else bot[cmd]=!bot[cmd];
      save();
      await sock.sendMessage(jid, { text: `${bot[cmd]?'✅':'❌'} *${cmd.toUpperCase()}* is now ${bot[cmd]?'ON':'OFF'}` }, { quoted: m });
      return true;
    }

    return false;
  }
};
