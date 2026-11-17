// 👑 FACELESS - OWNER PLUGIN - REAL HANDLER
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const config = require('../config');

const DB_DIR = path.join(__dirname, '..', 'database');
const OWNER_DB = path.join(DB_DIR, 'owners.json');
const BAN_DB = path.join(DB_DIR, 'banned_users.json');

function loadJson(p, def){
  try{ if(!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR,{recursive:true}); if(!fs.existsSync(p)) fs.writeFileSync(p, JSON.stringify(def,null,2)); return JSON.parse(fs.readFileSync(p,'utf8')||JSON.stringify(def)); }catch{ return def; }
}
function saveJson(p,d){ try{ fs.writeFileSync(p, JSON.stringify(d,null,2)); }catch{} }
function getOwners(){ const db=loadJson(OWNER_DB, { owners:[config.ownerNumber||'2349037483649'] }); return db.owners; }

const COMMANDS = ['owner','mode','public','private','setprefix','setname','setbio','setpp','restart','shutdown','update','broadcast','bcgroup','bcstatus','eval','exec','getfile','delplugin','listplugin','join','leave','block','unblock','banuser','unbanuser','addowner','delowner','setppbot','getsession','clearsession'];

function getTarget(m, args){
  const q = m.message?.extendedTextMessage?.contextInfo?.participant;
  if(q) return q;
  const men = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  if(men?.length) return men[0];
  let num = (args[0]||'').replace(/[^0-9]/g,'');
  if(num && num.length>=10) return num+'@s.whatsapp.net';
  return null;
}

module.exports = {
  name: 'owner',
  commands: COMMANDS,

  run: async (sock, m, jid, cmd, args, text, isOwner, isGroup, sender) => {
    if(!COMMANDS.includes(cmd)) return false;
    if(!isOwner){
      await sock.sendMessage(jid, { text: '❌ Owner only command' }, { quoted: m });
      return true;
    }

    // --- OWNER INFO ---
    if(cmd === 'owner'){
      const owners = getOwners();
      await sock.sendMessage(jid, { text: `👑 *OWNER - FACELESS BOT*\n\nName: ${config.ownerName}\nNumber: +${config.ownerNumber}\nOwners: ${owners.map(o=>'+'+o).join(', ')}\nPrefix: ${global.prefix||config.prefix}\nMode: ${global.mode||config.mode}\n\nContact: wa.me/${config.ownerNumber}`, mentions: owners.map(o=>o+'@s.whatsapp.net') }, { quoted: m });
      return true;
    }

    // --- MODE / PUBLIC / PRIVATE ---
    if(cmd === 'mode'){
      const arg = (args[0]||'').toLowerCase();
      if(arg==='public'||arg==='private'){ global.mode = arg; config.mode = arg; await sock.sendMessage(jid, { text: `✅ Mode set to *${arg}*` }, { quoted: m }); return true; }
      await sock.sendMessage(jid, { text: `Current mode: ${global.mode||config.mode}\nUsage: .mode public / .mode private` }, { quoted: m });
      return true;
    }
    if(cmd === 'public'){ global.mode='public'; config.mode='public'; await sock.sendMessage(jid, { text: '✅ Bot is now PUBLIC - everyone can use' }, { quoted: m }); return true; }
    if(cmd === 'private'){ global.mode='private'; config.mode='private'; await sock.sendMessage(jid, { text: '✅ Bot is now PRIVATE - owner only' }, { quoted: m }); return true; }

    // --- SETPREFIX ---
    if(cmd === 'setprefix'){
      const p = args[0]||'';
      if(!p){ await sock.sendMessage(jid, { text: 'Usage: .setprefix .' }, { quoted: m }); return true; }
      global.prefix = p; config.prefix = p;
      await sock.sendMessage(jid, { text: `✅ Prefix changed to: ${p}\nExample: ${p}menu` }, { quoted: m });
      return true;
    }

    // --- SETNAME / SETBIO (bot profile) ---
    if(cmd === 'setname'){
      if(!text){ await sock.sendMessage(jid, { text: 'Usage: .setname FACELESS BOT' }, { quoted: m }); return true; }
      await sock.updateProfileName(text);
      await sock.sendMessage(jid, { text: `✅ Bot name changed to: ${text}` }, { quoted: m });
      return true;
    }
    if(cmd === 'setbio'){
      if(!text){ await sock.sendMessage(jid, { text: 'Usage: .setbio Your bio here' }, { quoted: m }); return true; }
      await sock.updateProfileStatus(text);
      await sock.sendMessage(jid, { text: `✅ Bot bio changed to:\n${text}` }, { quoted: m });
      return true;
    }

    // --- SETPP / SETPPBOT - set bot PP (reply to image) ---
    if(cmd === 'setpp' || cmd === 'setppbot'){
      const ctx = m.message?.extendedTextMessage?.contextInfo;
      const quoted = ctx?.quotedMessage;
      const imgMsg = quoted?.imageMessage || m.message?.imageMessage;
      if(!imgMsg){ await sock.sendMessage(jid, { text: 'Reply to an image with .setpp' }, { quoted: m }); return true; }
      try{
        const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
        const stream = await downloadContentFromMessage(imgMsg, 'image');
        let buf = Buffer.from([]); for await(const c of stream) buf = Buffer.concat([buf, c]);
        await sock.updateProfilePicture(sock.user.id, buf);
        await sock.sendMessage(jid, { text: '✅ Bot profile picture updated' }, { quoted: m });
      }catch(e){ await sock.sendMessage(jid, { text: `❌ Failed: ${e.message}` }, { quoted: m }); }
      return true;
    }

    // --- RESTART / SHUTDOWN ---
    if(cmd === 'restart'){
      await sock.sendMessage(jid, { text: '🔄 Restarting bot...' }, { quoted: m });
      setTimeout(()=>{ process.exit(0); }, 1000);
      return true;
    }
    if(cmd === 'shutdown'){
      await sock.sendMessage(jid, { text: '🛑 Shutting down...' }, { quoted: m });
      setTimeout(()=>{ process.exit(0); }, 1000);
      return true;
    }

    // --- UPDATE - git pull ---
    if(cmd === 'update'){
      await sock.sendMessage(jid, { text: '⏳ Updating...' }, { quoted: m });
      exec('git pull', (err, stdout, stderr)=>{
        sock.sendMessage(jid, { text: `📥 Update:\n${stdout||stderr||err?.message||'Done'}\n\nRestart with .restart` });
      });
      return true;
    }

    // --- BROADCAST / BCGROUP / BCSTATUS ---
    if(cmd === 'broadcast' || cmd === 'bcgroup' || cmd === 'bcstatus'){
      if(!text){ await sock.sendMessage(jid, { text: `Usage: .${cmd} Your message` }, { quoted: m }); return true; }
      await sock.sendMessage(jid, { text: '⏳ Broadcasting...' }, { quoted: m });
      let count = 0;
      try{
        if(cmd === 'bcstatus'){
          await sock.sendMessage('status@broadcast', { text });
          await sock.sendMessage(jid, { text: '✅ Posted to status' });
          return true;
        }
        if(cmd === 'bcgroup'){
          const groups = await sock.groupFetchAllParticipating();
          for(const g of Object.keys(groups)){
            await sock.sendMessage(g, { text: `📢 *BROADCAST*\n\n${text}` }).catch(()=>{});
            count++;
            await new Promise(r=>setTimeout(r, 1000));
          }
        } else {
          // broadcast to all chats
          const chats = await sock.groupFetchAllParticipating();
          for(const g of Object.keys(chats)){ await sock.sendMessage(g, { text: `📢 *BROADCAST*\n\n${text}` }).catch(()=>{}); count++; }
          // also to recent private chats - via store if available
        }
        await sock.sendMessage(jid, { text: `✅ Broadcast sent to ${count} groups` });
      }catch(e){ await sock.sendMessage(jid, { text: `❌ Broadcast failed: ${e.message}` }); }
      return true;
    }

    // --- EVAL - run JS code ---
    if(cmd === 'eval'){
      if(!text){ await sock.sendMessage(jid, { text: 'Usage: .eval 1+1' }, { quoted: m }); return true; }
      try{
        let res = eval(text);
        if(typeof res === 'object') res = JSON.stringify(res, null, 2);
        await sock.sendMessage(jid, { text: `✅ Eval:\n${String(res).slice(0,3000)}` }, { quoted: m });
      }catch(e){ await sock.sendMessage(jid, { text: `❌ Eval error:\n${e.message}` }, { quoted: m }); }
      return true;
    }

    // --- EXEC - run shell ---
    if(cmd === 'exec'){
      if(!text){ await sock.sendMessage(jid, { text: 'Usage: .exec ls' }, { quoted: m }); return true; }
      exec(text, { timeout: 15000 }, (err, stdout, stderr)=>{
        sock.sendMessage(jid, { text: `💻 Exec:\n${stdout||stderr||err?.message||'Done'}`.slice(0,3000) }, { quoted: m });
      });
      return true;
    }

    // --- GETFILE / LISTPLUGIN / DELPLUGIN ---
    if(cmd === 'listplugin'){
      const files = fs.readdirSync(path.join(__dirname)).filter(f=>f.endsWith('.js'));
      await sock.sendMessage(jid, { text: `📂 *PLUGINS (${files.length})*\n\n${files.map((f,i)=>`${i+1}. ${f}`).join('\n')}` }, { quoted: m });
      return true;
    }
    if(cmd === 'getfile'){
      const name = args[0]||'';
      if(!name){ await sock.sendMessage(jid, { text: 'Usage: .getfile auto.js' }, { quoted: m }); return true; }
      const p = path.join(__dirname, name);
      if(!fs.existsSync(p)){ await sock.sendMessage(jid, { text: 'File not found' }, { quoted: m }); return true; }
      await sock.sendMessage(jid, { document: fs.readFileSync(p), fileName: name, mimetype:'text/javascript' }, { quoted: m });
      return true;
    }
    if(cmd === 'delplugin'){
      const name = args[0]||'';
      if(!name){ await sock.sendMessage(jid, { text: 'Usage: .delplugin auto.js' }, { quoted: m }); return true; }
      const p = path.join(__dirname, name);
      if(!fs.existsSync(p)){ await sock.sendMessage(jid, { text: 'File not found' }, { quoted: m }); return true; }
      fs.unlinkSync(p);
      await sock.sendMessage(jid, { text: `✅ Deleted ${name}\nRestart with .restart` }, { quoted: m });
      return true;
    }

    // --- JOIN / LEAVE ---
    if(cmd === 'join'){
      const link = args[0]||'';
      const code = link.split('/').pop();
      if(!code){ await sock.sendMessage(jid, { text: 'Usage: .join https://chat.whatsapp.com/xxxx' }, { quoted: m }); return true; }
      try{ const res = await sock.groupAcceptInvite(code); await sock.sendMessage(jid, { text: `✅ Joined: ${res}` }, { quoted: m }); }
      catch(e){ await sock.sendMessage(jid, { text: `❌ Failed: ${e.message}` }, { quoted: m }); }
      return true;
    }
    if(cmd === 'leave'){
      if(!isGroup){ await sock.sendMessage(jid, { text: 'Use in group to leave' }, { quoted: m }); return true; }
      await sock.sendMessage(jid, { text: '👋 Leaving...' });
      await sock.groupLeave(jid);
      return true;
    }

    // --- BLOCK / UNBLOCK ---
    if(cmd === 'block' || cmd === 'unblock'){
      const target = getTarget(m, args);
      if(!target){ await sock.sendMessage(jid, { text: `Usage: .${cmd} @user` }, { quoted: m }); return true; }
      await sock.updateBlockStatus(target, cmd==='block'?'block':'unblock');
      await sock.sendMessage(jid, { text: `${cmd==='block'?'🚫 Blocked':'✅ Unblocked'} @${target.split('@')[0]}`, mentions:[target] }, { quoted: m });
      return true;
    }

    // --- BANUSER / UNBANUSER ---
    if(cmd === 'banuser' || cmd === 'unbanuser'){
      const target = getTarget(m, args);
      if(!target){ await sock.sendMessage(jid, { text: `Usage: .${cmd} @user` }, { quoted: m }); return true; }
      const db = loadJson(BAN_DB, { banned:[] });
      if(cmd==='banuser'){
        if(!db.banned.includes(target)) db.banned.push(target);
        saveJson(BAN_DB, db);
        await sock.sendMessage(jid, { text: `🚫 Banned @${target.split('@')[0]} from using bot`, mentions:[target] }, { quoted: m });
      } else {
        db.banned = db.banned.filter(x=>x!==target);
        saveJson(BAN_DB, db);
        await sock.sendMessage(jid, { text: `✅ Unbanned @${target.split('@')[0]}`, mentions:[target] }, { quoted: m });
      }
      return true;
    }

    // --- ADDOWNER / DELOWNER ---
    if(cmd === 'addowner' || cmd === 'delowner'){
      const target = getTarget(m, args);
      if(!target){ await sock.sendMessage(jid, { text: `Usage: .${cmd} @user / .${cmd} 2349037483649` }, { quoted: m }); return true; }
      const num = target.split('@')[0];
      const db = loadJson(OWNER_DB, { owners:[config.ownerNumber] });
      if(cmd==='addowner'){ if(!db.owners.includes(num)) db.owners.push(num); }
      else { db.owners = db.owners.filter(x=>x!==num); }
      saveJson(OWNER_DB, db);
      global.owners = db.owners;
      await sock.sendMessage(jid, { text: `${cmd==='addowner'?'✅ Added':'✅ Removed'} owner: @${num}\nOwners: ${db.owners.join(', ')}`, mentions:[target] }, { quoted: m });
      return true;
    }

    // --- GETSESSION / CLEARSESSION ---
    if(cmd === 'getsession'){
      await sock.sendMessage(jid, { text: `🔑 Session Info:\n\nBot: ${sock.user?.id}\nName: ${sock.user?.name}\nSession folder: ./session/\n\nTo get new session, delete session folder and re-pair on website.` }, { quoted: m });
      return true;
    }
    if(cmd === 'clearsession'){
      await sock.sendMessage(jid, { text: '🧹 Clearing session...\nBot will logout. Re-pair on website.' }, { quoted: m });
      try{ await sock.logout(); }catch{}
      setTimeout(()=>process.exit(0), 1000);
      return true;
    }

    return false;
  }
};
