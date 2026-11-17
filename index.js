// 👤 FACELESS BOT - V3 - FIXED ADMIN + ALL PLUGINS + ANTI + AUTO
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers,
  downloadMediaMessage
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const chalk = require('chalk');
const express = require('express');
const path = require('path');
const fs = require('fs');

const msgRetryCounterCache = { _cache: new Map(), get(k){ return this._cache.get(k); }, set(k,v){ this._cache.set(k,v); return v; }, del(k){ this._cache.delete(k); }, has(k){ return this._cache.has(k); } };
const msgStore = new Map();
function storeMsg(m){ if(!m?.key?.id) return; msgStore.set(m.key.id, m.message); if(msgStore.size>500) msgStore.delete(msgStore.keys().next().value); }
async function getMessage(key){ if(!key?.id) return undefined; return msgStore.get(key.id); }

// ✅ FIX 1: Correct JID normalizing - THIS was why bot said "not admin" when it WAS admin
function bare(jid){ if(!jid) return ''; return String(jid).split(':')[0].split('@')[0]; }
function normalizeJid(jid){ if(!jid) return ''; return String(jid).split(':')[0].split('@')[0] + '@s.whatsapp.net'; }
function isAdminFlag(p){ return p && (p.admin==='admin'||p.admin==='superadmin'||p.isAdmin===true); }

let config;
try { config = require('./settings'); } catch {
  config = { botName: "FACELESS", ownerName: "ALPHA", ownerNumber: "239166265317", prefix: ".", sessionName: "session", PORT: process.env.PORT || 10000 };
}
config.ownerNumber = "239166265317";
config.botName = "👤 FACELESS";
config.sessionName = "session";

global.sock = null; global.isConnected = false; global.connectionStatus = '⚠️ NOT LINKED'; global.pairingCode = null; global.currentPairingNumber = null; global.lastPairTime = 0; global.appStarted = false;

global.db = global.db || {};
global.db.groups = global.db.groups || {};
global.db.settings = global.db.settings || { prefix: ".", mode: "public", autoread: false, autostatus: false, autovv: false, autolike: false, autoreact: false, autotyping: false, autopresence: false, autoreply: false, anticall: false, antidelete: false, autobio: false };
global.db.banned = global.db.banned || [];
global.db.warnings = global.db.warnings || {};
global.db.messages = global.db.messages || {};
global.db.spam = global.db.spam || {};
global.db.sudo = global.db.sudo || ["239166265317@s.whatsapp.net"];
global.db.data = global.db.data || {};
global.db.data.groups = global.db.groups;
global.groupSettings = global.db.groups;

// ✅ FIX 2: getGroup with ALL toggles - so .settings plugin + index agree
function getGroup(jid){
  global.db.groups[jid] = global.db.groups[jid] || {
    antilink:false, antilink2:false, antilinkall:false, antibot:false, antispam:false,
    antiviewonce:false, antidelete:false, antibadword:false, antisticker:false, antitag:false, antimedia:false,
    welcome:false, goodbye:false, welcomeText:"", goodbyeText:"",
    autoreact:false, economy:true, games:true, fun:true, chat:true,
    onlyadmin:false, onlyowner:false, muted:false, nsfw:false
  };
  return global.db.groups[jid];
}
function isAntilinkOn(jid){ const g = global.db.groups?.[jid]; return !!(g?.antilink || g?.antilink2 || g?.antilinkall); }
global.getGroup = getGroup;
global.isAntilinkOn = isAntilinkOn;

global.plugins = new Map();
global.facelessCommands = {};
global.wolfCommands = global.facelessCommands;
global.metaPlugins = [];

// ✅ FIX 3: Loader that handles ALL plugin styles: {name,run,commands} + {command,execute} + {name,execute} + function
function loadPlugins(){
  const possiblePaths = [path.join(__dirname,'plugins'), path.join(__dirname,'../plugins'), path.join(__dirname,'src/plugins')];
  let pPath = null;
  for(const pp of possiblePaths){ if(fs.existsSync(pp)){ pPath=pp; break; } }
  if(!pPath) { console.log(chalk.red('No plugins folder found')); return; }
  global.plugins.clear(); global.facelessCommands = {}; global.wolfCommands = global.facelessCommands; global.metaPlugins = [];
  let t=0;
  const IGNORED = ['main.js','index.js','connection.js','settings.js','config.js','app.js','bot.js','server.js'];
  function rd(dir){
    for(const it of fs.readdirSync(dir)){
      const full=path.join(dir,it); const st=fs.statSync(full);
      if(st.isDirectory()){ if(it==='node_modules'||it.startsWith('.')||IGNORED.includes(it)) continue; rd(full); continue; }
      if(!it.endsWith('.js')||IGNORED.includes(it)) continue;
      try{
        delete require.cache[require.resolve(full)];
        const d=require(full); const arr=Array.isArray(d)?d:[d];
        for(const pl of arr){
          // Style A: FACELESS { name, commands:[...], run(sock,m,jid,cmd,args,text,isOwner,isGroup,sender) }
          if(pl && pl.run && pl.name){
            const wrapped = async (sock, m, ctx) => { return await pl.run(sock, m, m.chat, ctx.command, ctx.args, ctx.text, m.isOwner, m.isGroup, m.sender); };
            const obj = { name: pl.name, execute: wrapped, isFacelessStyle: true, commands: pl.commands };
            global.plugins.set(pl.name.toLowerCase(), obj); global.facelessCommands[pl.name.toLowerCase()]=wrapped; global.metaPlugins.push(obj);
            if(pl.commands) for(const c of pl.commands){ global.plugins.set(String(c).toLowerCase(), obj); global.facelessCommands[String(c).toLowerCase()]=wrapped; }
            if(pl.alias) for(const a of pl.alias){ global.plugins.set(String(a).toLowerCase(), obj); global.facelessCommands[String(a).toLowerCase()]=wrapped; }
            t++; continue;
          }
          // Style B: { command, execute } or { name, execute }
          if(pl && pl.execute){
            const cmds = pl.command ? (Array.isArray(pl.command)?pl.command:[pl.command]) : pl.commands ? pl.commands : pl.cmd ? (Array.isArray(pl.cmd)?pl.cmd:[pl.cmd]) : [pl.name];
            for(const cmd of cmds){ if(!cmd) continue; global.plugins.set(String(cmd).toLowerCase(), pl); global.facelessCommands[String(cmd).toLowerCase()]=pl.execute; }
            if(pl.alias) for(const a of pl.alias){ global.plugins.set(String(a).toLowerCase(), pl); global.facelessCommands[String(a).toLowerCase()]=pl.execute; }
            t++; continue;
          }
          // Style C: bare function
          if(typeof pl === 'function'){
            const nm = (pl.name||it.replace('.js','')).toLowerCase();
            global.plugins.set(nm, { name:nm, execute: pl }); global.facelessCommands[nm]=pl; t++; continue;
          }
        }
      }catch(e){ console.log(`Load err ${it}: ${e.message}`); }
    }
  }
  rd(pPath); global.wolfCommands = global.facelessCommands;
  console.log(chalk.green(`✅ FACELESS WIRED ${t} files | ${Object.keys(global.facelessCommands).length} CMDS + ${global.metaPlugins.length} FACELESS plugins`));
  console.log(chalk.cyan(`CMDS: ${Object.keys(global.facelessCommands).join(', ')}`));
}
loadPlugins();

// ✅ FIX 4: Cache 15s only + invalidate on participants.update - so admin change is instant
const groupCache=new Map();
async function getCachedMeta(sock,jid,force=false){
  if(!force){ const c=groupCache.get(jid); if(c && Date.now()-c.time<15000) return c.meta; }
  try{ const meta=await sock.groupMetadata(jid); groupCache.set(jid,{meta,time:Date.now()}); if(groupCache.size>50) groupCache.delete(groupCache.keys().next().value); return meta; }catch{ return null; }
}

// Anti-spam tracker
const spamMap = new Map(); // sender -> {count, lastTime, lastText}
const BADWORDS = ['fuck','shit','bitch','bastard','dick','pussy','motherfucker','fucking','nigga','nigger','whore','slut'];

async function startConnection(){
  if(!global.appStarted){
    const app=express();
    app.use(express.json()); app.use(express.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname,'public'))); app.use(express.static(__dirname)); app.use(express.static(path.join(__dirname,'../public')));
    app.get('/',(req,res)=>{
      const idx1 = path.join(__dirname,'public/index.html'); const idx2 = path.join(__dirname,'index.html'); const idx3 = path.join(__dirname,'../public/index.html');
      if(fs.existsSync(idx1)) return res.sendFile(idx1); if(fs.existsSync(idx2)) return res.sendFile(idx2); if(fs.existsSync(idx3)) return res.sendFile(idx3);
      res.send(`<h1>👤 FACELESS</h1><p>Owner: 239166265317</p><p>CMDS: ${Object.keys(global.facelessCommands).length}</p><p><a href="/api/status">Status</a> | <a href="/getcode?number=239166265317">Get Code</a></p>`);
    });
    app.get('/health',(req,res)=>res.send('FACELESS LIVE'));
    app.get('/api/status',(req,res)=>res.json({ botName:"FACELESS", owner:"239166265317", status:global.connectionStatus, isConnected:global.isConnected, pairingCode:global.pairingCode, plugins:Object.keys(global.facelessCommands).length, cmds:Object.keys(global.facelessCommands) }));
    app.post('/api/pair',async(req,res)=>{ try{ let phone=(req.body.phone||req.body.number||'').replace(/[^0-9]/g,''); if(phone.length<10) return res.json({success:false,message:'Enter valid number'}); if(!global.sock) return res.json({success:false,message:'Bot starting... wait 5 sec'}); if(global.isConnected) return res.json({success:false,message:'Already linked!'}); const code=await global.sock.requestPairingCode(phone); global.pairingCode=code; global.currentPairingNumber=phone; global.connectionStatus=`CODE: ${code}`; res.json({success:true,code}); }catch(e){ res.json({success:false,message:e.message}); } });
    app.get('/getcode',async(req,res)=>{ try{ let phone=(req.query.number||req.query.phone||'').replace(/[^0-9]/g,''); if(!phone) return res.json({success:false,message:'Add ?number=239166265317'}); if(!global.sock) return res.json({success:false,message:'Bot starting... wait 5 sec'}); if(global.isConnected) return res.json({success:false,message:'Already linked!'}); const code=await global.sock.requestPairingCode(phone); global.pairingCode=code; global.currentPairingNumber=phone; global.connectionStatus=`CODE: ${code}`; res.json({success:true, code, phone, codeFormatted: code.match(/.{1,4}/g)?.join("-")}); }catch(e){ res.json({success:false,message:e.message}); } });
    app.post('/api/logout',async(req,res)=>{ try{ if(global.sock) await global.sock.logout().catch(()=>{}); }catch{} try{ fs.rmSync(`./${config.sessionName}`,{recursive:true,force:true}); fs.rmSync(`./auth`,{recursive:true,force:true}); }catch{} global.sock=null; global.isConnected=false; res.json({success:true}); setTimeout(()=>initBaileys(),2000); });
    app.post('/api/reload', (req,res)=>{ loadPlugins(); res.json({success:true, cmds:Object.keys(global.facelessCommands).length}); });
    const PORT=config.PORT||process.env.PORT||10000;
    app.listen(PORT,'0.0.0.0',()=>console.log(chalk.cyan(`🌐 FACELESS Dashboard ${PORT} | ${Object.keys(global.facelessCommands).length} CMDS`)));
    global.appStarted=true;
  }

  async function initBaileys(){
    try{
      const authPath=`./${config.sessionName}`;
      if((!fs.existsSync(authPath)||fs.readdirSync(authPath).length===0)&&process.env.SESSION_DATA){
        fs.mkdirSync(authPath,{recursive:true}); let d; try{ d=JSON.parse(process.env.SESSION_DATA); }catch{ d=JSON.parse(Buffer.from(process.env.SESSION_DATA,'base64').toString()); } fs.writeFileSync(path.join(authPath,'creds.json'),JSON.stringify(d,null,2));
      }
    }catch(e){}
    const {state,saveCreds}=await useMultiFileAuthState(`./${config.sessionName}`);
    const {version}=await fetchLatestBaileysVersion();
    const sock=makeWASocket({
      version, logger:pino({level:'silent'}), printQRInTerminal:false, browser:Browsers.macOS('Safari'),
      auth:{creds:state.creds,keys:makeCacheableSignalKeyStore(state.keys,pino({level:'silent'}))},
      markOnlineOnConnect:true, connectTimeoutMs:60000, keepAliveIntervalMs:10000, syncFullHistory:false,
      retryRequestDelayMs:2000, msgRetryCounterCache, getMessage, generateHighQualityLinkPreview:false, shouldSyncHistoryMessage:()=>false
    });
    global.sock=sock; sock.ev.on('creds.update',saveCreds);

    // ✅ AUTO: Anti-call
    sock.ev.on('call',async(calls)=>{ for(let c of calls){ try{ if(global.db.settings.anticall || global.db.settings.antcall) await sock.rejectCall(c.id,c.from); }catch{} } });

    // ✅ AUTO: Anti-delete
    sock.ev.on('messages.update',async(updates)=>{ for(let up of updates){ if(up.update.message===null){ const saved=global.db.messages[up.key.id]; if(!saved) continue; const g=getGroup(saved.from); if(!(g.antidelete||global.db.settings.antidelete)) continue; try{ await sock.sendMessage(saved.from,{text:`*🔍 ANTI-DELETE FACELESS*\nFrom: @${bare(saved.sender)}\n> ${saved.text?.slice(0,300)}`,mentions:[saved.sender]}); }catch{} } } });

    // ✅ AUTO: Welcome / Goodbye + cache invalidate on admin change
    sock.ev.on('group-participants.update',async(up)=>{
      try{
        groupCache.delete(up.id); // FIX: clear cache so bot admin status updates instantly
        const g=getGroup(up.id);
        const meta=await getCachedMeta(sock,up.id,true);
        for(const user of up.participants){
          if(up.action==='add' && g.welcome){
            const txt = g.welcomeText || `👋 Welcome @${bare(user)} to ${meta?.subject||'group'}!\n\nRead rules, no links, respect everyone.`;
            await sock.sendMessage(up.id,{text:txt,mentions:[user]}).catch(()=>{});
          }
          if((up.action==='remove'||up.action==='leave') && g.goodbye){
            const txt = g.goodbyeText || `👋 Goodbye @${bare(user)}, we will miss you!`;
            await sock.sendMessage(up.id,{text:txt,mentions:[user]}).catch(()=>{});
          }
        }
      }catch(e){ console.log('Participants update err:',e.message); }
    });

    sock.ev.on('connection.update',async(update)=>{
      const {connection,lastDisconnect}=update;
      if(connection==='connecting') global.connectionStatus='Connecting FACELESS...';
      if(connection==='open'){ global.isConnected=true; global.connectionStatus='ONLINE ✅ FACELESS'; console.log(chalk.green.bold(`\n✅ FACELESS ONLINE! ${Object.keys(global.facelessCommands).length} CMDS\n`)); if(global.db.settings.autobio) sock.updateProfileStatus(`👤 FACELESS ONLINE | ${new Date().toLocaleTimeString()}`).catch(()=>{}); }
      if(connection==='close'){ const code=lastDisconnect?.error?.output?.statusCode; console.log(chalk.red(`❌ Closed ${code}`)); global.isConnected=false; global.sock=null; groupCache.clear(); if([DisconnectReason.loggedOut,401,440,405].includes(code)){ try{ fs.rmSync(`./${config.sessionName}`,{recursive:true,force:true}); }catch{} global.connectionStatus='LOGGED OUT'; setTimeout(()=>initBaileys(),3000); } else{ global.connectionStatus='Reconnecting FACELESS...'; setTimeout(()=>initBaileys(),5000); } }
    });

    sock.ev.on('messages.upsert',async({messages,type})=>{
      try{
        if(type!=='notify') return;
        for(const m of messages){
          try{
            if(!m?.message) continue;
            storeMsg(m);
            const from=m.key.remoteJid;
            if(from==='status@broadcast'){ if(global.db.settings.autostatus) sock.readMessages([m.key]).catch(()=>{}); continue; }
            const sender=m.key.participant||from; const isGroup=from.endsWith('@g.us');
            const body=m.message.conversation||m.message.extendedTextMessage?.text||m.message.imageMessage?.caption||m.message.videoMessage?.caption||m.message.extendedTextMessage?.contextInfo?.quotedMessage?.conversation||"";
            if(m.key.id){ global.db.messages[m.key.id]={text:body,sender,from,time:Date.now(), message:m.message}; if(Object.keys(global.db.messages).length>150) delete global.db.messages[Object.keys(global.db.messages)[0]]; }

            // ✅ AUTO: autoread + autotyping + presence
            if(global.db.settings.autoread) sock.readMessages([m.key]).catch(()=>{});
            if(global.db.settings.autotyping && isGroup===false) sock.sendPresenceUpdate('composing',{to:from}).catch(()=>{});
            if(global.db.settings.autopresence) sock.sendPresenceUpdate('available').catch(()=>{});

            // ✅ ADMIN CHECK - FIXED: use bare() on BOTH sides, fresh meta if bot admin unknown
            let meta=null, isAdmin=false, isBotAdmin=false, participants=[];
            if(isGroup){
              meta=await getCachedMeta(sock,from);
              participants=meta?.participants||[];
              const botBare = bare(sock.user.id); // e.g 239166265317 - NOT 239...:123
              const senderBare = bare(sender);
              const me=participants.find(p=>bare(p.id)===botBare);
              const senderP=participants.find(p=>bare(p.id)===senderBare);
              isBotAdmin=isAdminFlag(me);
              isAdmin=isAdminFlag(senderP);
              // If bot not found in cached list, refetch once (admin just changed)
              if(!me){ meta=await getCachedMeta(sock,from,true); participants=meta?.participants||[]; const me2=participants.find(p=>bare(p.id)===botBare); isBotAdmin=isAdminFlag(me2); }
            }
            const isOwner=bare(sender)==='239166265317'||global.db.sudo.includes(sender)||global.db.sudo.some(s=>bare(s)==='239166265317')||m.key.fromMe;
            const isSenderAdmin=isAdmin||isOwner;

            // ================= ANTI / AUTO - GROUP ONLY =================
            if(isGroup && !m.key.fromMe){
              const g=getGroup(from);
              const isBotMsg = m.key.id?.startsWith('BAE5') || bare(sender)===bare(sock.user.id);

              // --- ANTI-LINK ---
              if(isAntilinkOn(from) && !isSenderAdmin){
                let hasLink=false;
                if(g.antilink) hasLink=/(https?:\/\/|www\.|chat\.whatsapp\.com|wa\.me\/|t\.me\/|instagram\.com|youtube\.com|discord\.gg)/i.test(body);
                if(g.antilink2 || g.antilinkall) hasLink=/(https?:\/\/|www\.|\.com|\.net|\.org|\.me\/|\.gg)/i.test(body);
                if(hasLink){
                  if(isBotAdmin){
                    await sock.sendMessage(from,{delete:m.key}).catch(()=>{});
                    await sock.sendMessage(from,{text:`⚠️ @${bare(sender)} links not allowed!`,mentions:[sender]}).catch(()=>{});
                  } else {
                    await sock.sendMessage(from,{text:`⚠️ @${bare(sender)} link detected but I'm not admin, make me admin to delete!`,mentions:[sender]}).catch(()=>{});
                  }
                  continue;
                }
              }
              // --- ANTI-BADWORD ---
              if(g.antibadword && !isSenderAdmin){
                if(BADWORDS.some(w=>body.toLowerCase().includes(w))){
                  if(isBotAdmin) await sock.sendMessage(from,{delete:m.key}).catch(()=>{});
                  await sock.sendMessage(from,{text:`⚠️ @${bare(sender)} watch your language!`,mentions:[sender]}).catch(()=>{});
                  continue;
                }
              }
              // --- ANTI-BOT ---
              if(g.antibot && !isSenderAdmin && isBotMsg && !m.key.fromMe){
                if(isBotAdmin) await sock.sendMessage(from,{delete:m.key}).catch(()=>{});
                continue;
              }
              // --- ANTI-SPAM (5 msgs in 5 sec) ---
              if(g.antispam && !isSenderAdmin){
                const now=Date.now(); const s=spamMap.get(sender)||{count:0,last:0,lastText:''};
                if(now - s.last < 5000 && body===s.lastText) s.count++; else if(now - s.last < 5000) s.count++; else s.count=1;
                s.last=now; s.lastText=body; spamMap.set(sender,s);
                if(s.count>=5){
                  if(isBotAdmin){ await sock.sendMessage(from,{delete:m.key}).catch(()=>{}); await sock.sendMessage(from,{text:`⚠️ @${bare(sender)} stop spamming!`,mentions:[sender]}).catch(()=>{}); }
                  spamMap.delete(sender); continue;
                }
              }
               // --- ANTI-STICKER ---
              if(g.antisticker && !isSenderAdmin && m.message.stickerMessage){
                if(isBotAdmin) await sock.sendMessage(from,{delete:m.key}).catch(()=>{});
                continue;
              }
              // --- ANTI-TAGALL / ANTI-TAG ---
              if(g.antitag && !isSenderAdmin && (m.message.extendedTextMessage?.contextInfo?.mentionedJid?.length>5)){
                if(isBotAdmin) await sock.sendMessage(from,{delete:m.key}).catch(()=>{});
                await sock.sendMessage(from,{text:`⚠️ @${bare(sender)} no mass tagging!`,mentions:[sender]}).catch(()=>{});
                continue;
              }
              // --- ANTI-VIEWONCE ---
              if((global.db.settings.autovv||g.antiviewonce) && (m.message.viewOnceMessage||m.message.viewOnceMessageV2||m.message.viewOnceMessageV2Extension)){
                try{
                  const q=m.message.viewOnceMessage||m.message.viewOnceMessageV2||m.message.viewOnceMessageV2Extension;
                  const inner=q?.message||q;
                  await sock.sendMessage(from,{text:`👁️ *ANTI-VIEWONCE* by @${bare(sender)}`,mentions:[sender]}).catch(()=>{});
                  if(inner?.imageMessage) await sock.sendMessage(from,{image:inner.imageMessage},{quoted:m}).catch(()=>{});
                  else if(inner?.videoMessage) await sock.sendMessage(from,{video:inner.videoMessage},{quoted:m}).catch(()=>{});
                }catch{}
              }
              // --- AUTO-REACT (group) ---
              if((g.autoreact||global.db.settings.autoreact) && body){
                const emojis=['❤️','😂','🔥','👍','😍','🙏'];
                await sock.sendMessage(from,{react:{text:emojis[Math.floor(Math.random()*emojis.length)], key:m.key}}).catch(()=>{});
              }
            }

            // ================= COMMANDS =================
            if(!body) continue;
            const prefix=global.db.settings.prefix||config.prefix||'.';
            if(!body.trim().startsWith(prefix)) {
              // ✅ AUTO: autoreply if enabled and DM
              if(global.db.settings.autoreply && !isGroup) await sock.sendMessage(from,{text:'👤 FACELESS here! Send .menu to see commands'},{quoted:m}).catch(()=>{});
              continue;
            }
            const args=body.trim().slice(prefix.length).trim().split(/ +/); const rawCmd=args.shift()?.toLowerCase(); if(!rawCmd) continue;
            const cmdName=rawCmd.replace(/[^a-z0-9]/g,'')||rawCmd;

            // ✅ MODE: private = only owner
            if(global.db.settings.mode==='private' && !isOwner) continue;
            if(global.db.settings.mode==='self' && !m.key.fromMe && !isOwner) continue;

            // ✅ GROUP SETTINGS: muted / onlyadmin / feature toggles
            if(isGroup){
              const g=getGroup(from);
              if(g.muted && !isOwner) continue;
              if(g.onlyadmin && !isSenderAdmin) { await sock.sendMessage(from,{text:'❌ Only admins can use bot here'}).catch(()=>{}); continue; }
              if(g.onlyowner && !isOwner) continue;
              if(g.games===false && ['ttt','quiz','guess','wordle','rps','tictactoe'].includes(cmdName)) continue;
              if(g.fun===false && ['joke','meme','roast','truth','dare'].includes(cmdName)) continue;
              if(g.economy===false && ['daily','balance','work','bet','slot','bank'].includes(cmdName)) continue;
              if(g.chat===false && ['chat','ai','gpt'].includes(cmdName)) continue;
            }

            let plugin = global.plugins.get(rawCmd) || global.plugins.get(cmdName);
            if(!plugin && !global.metaPlugins.length) { console.log(chalk.yellow(`No plugin for .${rawCmd}`)); continue; }
            if(global.db.banned.includes(sender)) continue;

            m.body=body; m.text=args.join(' '); m.args=args; m.sender=sender; m.chat=from; m.from=from; m.isGroup=isGroup; m.fromMe=m.key.fromMe; m.pushName=m.pushName||"ALPHA";
            m.isOwner=isOwner; m.isAdmin=isSenderAdmin; m.isBotAdmin=isBotAdmin; m.isGroupAdmin=isSenderAdmin; m.isBotGroupAdmin=isBotAdmin;
            m.groupMetadata=meta; m.participants=participants; m.metadata=meta;
            m.botNumber=sock.user.id; m.botJid=sock.user.id;
            m.sock=sock; m.conn=sock; m.client=sock;
            m.reply=async(txt)=>await sock.sendMessage(from,{text:typeof txt==='string'?txt:String(txt)},{quoted:m});
            m.download=async()=>await downloadMediaMessage(m,'buffer',{},{logger:pino({level:"silent"}),reuploadRequest:sock.updateMediaMessage});

            console.log(chalk.green(`▶️ .${rawCmd} ${bare(sender)} admin:${isSenderAdmin} botAdmin:${isBotAdmin}`));

            const ctx = { sock, conn: sock, client: sock, prefix, args, command:cmdName, text:args.join(' '), config, plugins:global.plugins, from, sender, getGroup, isOwner:m.isOwner, isAdmin:m.isAdmin, isBotAdmin:m.isBotAdmin, groupMetadata:meta, participants, reply:m.reply };

            if(!plugin){
              let handled=false;
              for(const mp of global.metaPlugins){ try{ const r = await mp.execute(sock, m, ctx); if(r){ handled=true; break; } }catch(e){} }
              if(!handled) console.log(chalk.yellow(`No plugin handled .${rawCmd}`));
              continue;
            }
            const execFn = typeof plugin === 'function' ? plugin : plugin.execute;
            if(typeof execFn !== 'function') continue;
            try{ await execFn(sock, m, ctx); }
            catch(e1){ try{ await execFn(m, ctx); } catch(e2){ try{ await execFn(m, sock, ctx); } catch(e3){ console.log(chalk.red(`Exec fail .${rawCmd}: ${e3.message}`)); } } }

          }catch(e){ console.log('Msg loop err:', e.message); }
        }
      }catch(e){ console.log('Upsert err:', e.message); }
    });
  }
  initBaileys();
  }
startConnection();
