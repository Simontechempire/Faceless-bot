// ================= META AI V2 - index.js - PAIRING ONLY =================
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');

// ===== LOAD ALL PLUGINS =====
const moderator = require('./plugins/moderator');
const settingsPlugin = require('./plugins/settings');
const filePlugin = require('./plugins/file');
const networkPlugin = require('./plugins/network');
const imagePlugin = require('./plugins/imagestudio');
const videoPlugin = require('./plugins/video');

const ALL_PLUGINS = [
  moderator,
  settingsPlugin,
  filePlugin,
  networkPlugin,
  imagePlugin,
  videoPlugin,
];

const { facelessReply, sendAwait } = require('./lib/function');

const OWNER_NUMBER = process.env.OWNER_NUMBER || '2340000000000';
const SESSION_DIR = './session';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (q) => new Promise(res => rl.question(q, res));

async function startBot(){
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    auth: state,
    browser: ['META AI V2', 'Chrome', '1.0.0'],
    syncFullHistory: false,
    markOnlineOnConnect: true,
  });

  sock.ev.on('creds.update', saveCreds);

  // ===== PAIRING CODE ONLY - NO QR =====
  if(!sock.authState.creds.registered){
    setTimeout(async () => {
      try{
        const num = await question('Enter Your WhatsApp Number (without +): ');
        const code = await sock.requestPairingCode(num.trim());
        console.log('\n================================');
        console.log('YOUR PAIRING CODE:', code);
        console.log('Go to WhatsApp > Linked Devices > Link with Phone Number');
        console.log('Enter Code There');
        console.log('================================\n');
      }catch(e){ console.log('Pairing Failed:', e.message); }
    }, 3000);
  }

  // ===== CONNECTION - NO QR =====
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if(connection === 'close'){
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Connection Closed, Reconnecting:', shouldReconnect);
      if(shouldReconnect) startBot();
      else console.log('Logged Out - Delete session folder and restart');
    }
    if(connection === 'open'){
      console.log('✅ META AI V2 CONNECTED VIA PAIRING CODE');
      console.log('✅ Loaded Plugins:', ALL_PLUGINS.map(p=>p.name).join(', '));
      try{
        const settings = settingsPlugin.getSettings();
        await sock.sendMessage(OWNER_NUMBER + '@s.whatsapp.net', { text: `✅ META AI V2 Online\nPrefix: ${settings.prefix}\nMode: ${settings.mode}\nPlugins: ${ALL_PLUGINS.length} Loaded` });
      }catch{}
    }
  });

  // ===== WELCOME / GOODBYE =====
  sock.ev.on('group-participants.update', async (update) => {
    try{
      const settings = settingsPlugin.getSettings();
      const jid = update.id;
      for(const participant of update.participants){
        if(update.action === 'add'){
          const welcomeMsg = settings.welcome?.[jid] || `Welcome @${participant.split('@')[0]} to the group 🎉`;
          await sock.sendMessage(jid, { text: welcomeMsg, mentions: [participant] });
        }
        if(update.action === 'remove'){
          const byeMsg = settings.goodbye?.[jid] || `Goodbye @${participant.split('@')[0]} 👋`;
          await sock.sendMessage(jid, { text: byeMsg, mentions: [participant] });
        }
      }
    }catch{}
  });

  // ===== MAIN MESSAGE HANDLER =====
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if(!m || !m.message) return;
    if(m.key.fromMe) return;

    const jid = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;
    const isGroup = jid.endsWith('@g.us');
    const isOwner = sender.split('@')[0] === OWNER_NUMBER || jid.split('@')[0] === OWNER_NUMBER;

    if(jid === 'status@broadcast'){
      try{
        const s = settingsPlugin.getSettings();
        if(s.antistatus) await sock.readMessages([m.key]);
      }catch{}
      return;
    }

    const body = m.message?.conversation
      || m.message?.extendedTextMessage?.text
      || m.message?.imageMessage?.caption
      || m.message?.videoMessage?.caption
      || '';

    if(isGroup){
      try{
        const muted = await moderator.handleMute(sock, m, jid, sender);
        if(muted) return;
      }catch{}
    }

    const settings = settingsPlugin.getSettings();
    const PREFIX = settings.prefix || '.';

    if(settings.mode === 'self' && !isOwner) return;

    if(!body.startsWith(PREFIX)){
      try{ await settingsPlugin.handleAutoReply(sock, m, jid); }catch{}
      return;
    }

    const args = body.slice(PREFIX.length).trim().split(/ +/);
    const cmd = args.shift()?.toLowerCase();
    const text = args.join(' ');
    if(!cmd) return;

    console.log(`[CMD] ${isGroup ? 'GROUP' : 'DM'} ${sender.split('@')[0]}: ${PREFIX}${cmd} ${text}`);

    if(cmd === 'menu' || cmd === 'help'){
      await sendAwait(sock, jid, m);
      const menuText = `▫️ 💀 META AI V2 - MENU

👑 OWNER:
.menu - Show Menu
.settings - View Settings
.setprefix - Change Prefix
.mode - Change Mode

🛡️ MODERATOR:
.kick .mute .unmute
.warn .unwarn .warns
.promote .demote
.tagall .hidetag
.delete .close .open

📁 FILE:
.tofile .savefile .getfile
.listfiles .deletefile
.renamefile .downloadfile
.tourl .toimage .toaudio

🌐 NETWORK:
.ping .speedtest .dns
.whois .ipinfo .headers
.ssl .checksite .port .mac

🖼️ PHOTO:
.blur .grayscale .invert
.flip .sepia .pixelate
.brightness .contrast
.enhance .rotate .resize
.circle .meme
.beautiful .wanted .jail
.trigger .gay .trash .rip

🎬 VIDEO:
.tovideo .togif .slowmo
.fast .reverse .mutevideo
.trim .volume .bwvideo
.rotatevideo .compressvideo
.tomp3

Prefix: ${PREFIX}
Owner: ${settings.ownerName}
Bot: ${settings.botName}`;

      if(settings.menuImage){
        try{ await sock.sendMessage(jid, { image: { url: settings.menuImage }, caption: menuText }, { quoted: m }); }
        catch{ await facelessReply(sock, jid, menuText, m); }
      } else {
        await facelessReply(sock, jid, menuText, m);
      }
      return;
    }

    if(cmd === 'alive'){
      await facelessReply(sock, jid, `✅ META AI V2 Alive\nPrefix: ${PREFIX}\nMode: ${settings.mode}\nPlugins: ${ALL_PLUGINS.length}`, m);
      return;
    }

    if(cmd === 'owner'){
      await facelessReply(sock, jid, `Owner: ${settings.ownerName}\nNumber: ${OWNER_NUMBER}`, m);
      return;
    }

    for(const plugin of ALL_PLUGINS){
      try{
        const handled = await plugin.run(sock, m, jid, cmd, args, text, isOwner, isGroup, sender);
        if(handled) return;
      }catch(e){
        console.log(`Plugin ${plugin.name} Error:`, e.message);
      }
    }

    if(!isGroup){
      await facelessReply(sock, jid, `Unknown Command: ${PREFIX}${cmd}\nType ${PREFIX}menu`, m);
    }
  });
}

startBot();

require('http').createServer((req,res)=>{ res.end('META AI V2 Online'); }).listen(process.env.PORT || 3000);
