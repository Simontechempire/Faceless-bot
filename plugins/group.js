// 👥 FACELESS - GROUP PLUGIN - REAL HANDLER
const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '..', 'database');
const DB = path.join(DB_DIR, 'groups.json');

function load(){
  try{
    if(!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR,{recursive:true});
    if(!fs.existsSync(DB)) fs.writeFileSync(DB, JSON.stringify({},null,2));
    return JSON.parse(fs.readFileSync(DB,'utf8')||'{}');
  }catch{ return {}; }
}
function save(d){ try{ fs.writeFileSync(DB, JSON.stringify(d,null,2)); }catch{} }
function gCfg(jid){ const db=load(); if(!db[jid]) db[jid]={ welcome:false, goodbye:false, welcomeText:'Welcome @user to @group', goodbyeText:'Goodbye @user', antilink:false }; return db[jid]; }
function setG(jid, k, v){ const db=load(); const c=gCfg(jid); c[k]=v; db[jid]=c; save(db); }

const COMMANDS = ['group','setname','setdesc','setgpp','welcome','goodbye','setwelcome','setgoodbye','open','close','link','revoke','invite','leave','join','poll','tagall','hidetag','getmembers','grouplist','antilink','groupinfo','setsubject','setdescription','resetgroup'];

async function isAdmin(sock, jid, sender){
  try{ const meta=await sock.groupMetadata(jid); const p=meta.participants.find(x=>x.id===sender); return !!(p?.admin); }catch{ return false; }
}
async function isBotAdmin(sock, jid){
  try{ const meta=await sock.groupMetadata(jid); const me=sock.user.id.split(':')[0]; const p=meta.participants.find(x=>x.id.split('@')[0]===me); return !!(p?.admin); }catch{ return false; }
}

module.exports = {
  name: 'group',
  commands: COMMANDS,

  // Real welcome / goodbye - index.js will call this at end
  onGroupUpdate: async (sock, update) => {
    try{
      const { id, participants, action } = update;
      const cfg = gCfg(id);
      for(const p of participants){
        if(action==='add' && cfg.welcome){
          const txt = cfg.welcomeText.replace('@user','@'+p.split('@')[0]).replace('@group', id);
          await sock.sendMessage(id, { text: txt, mentions:[p] });
        }
        if(action==='remove' && cfg.goodbye){
          const txt = cfg.goodbyeText.replace('@user','@'+p.split('@')[0]);
          await sock.sendMessage(id, { text: txt, mentions:[p] });
        }
      }
    }catch{}
  },

  run: async (sock, m, jid, cmd, args, text, isOwner, isGroup, sender) => {
    if(!COMMANDS.includes(cmd)) return false;

    // --- GROUPLIST - owner only, lists all groups bot is in ---
    if(cmd === 'grouplist'){
      if(!isOwner){ await sock.sendMessage(jid, { text: '❌ Owner only' }, { quoted: m }); return true; }
      const groups = await sock.groupFetchAllParticipating();
      const list = Object.values(groups);
      await sock.sendMessage(jid, { text: `👥 *GROUPS: ${list.length}*\n\n${list.map((g,i)=>`${i+1}. ${g.subject}\n   ID: ${g.id}\n   Members: ${g.participants.length}`).join('\n\n')}` }, { quoted: m });
      return true;
    }

    // --- JOIN - owner only ---
    if(cmd === 'join'){
      if(!isOwner){ await sock.sendMessage(jid, { text: '❌ Owner only' }, { quoted: m }); return true; }
      const link = args[0]||'';
      const code = link.split('/').pop();
      if(!code){ await sock.sendMessage(jid, { text: 'Usage: .join https://chat.whatsapp.com/xxxx' }, { quoted: m }); return true; }
      try{ const res = await sock.groupAcceptInvite(code); await sock.sendMessage(jid, { text: `✅ Joined group: ${res}` }, { quoted: m }); }
      catch(e){ await sock.sendMessage(jid, { text: `❌ Failed to join: ${e.message}` }, { quoted: m }); }
      return true;
    }

    // --- LEAVE ---
    if(cmd === 'leave'){
      if(!isOwner && !await isAdmin(sock, jid, sender)){ await sock.sendMessage(jid, { text: '❌ Admins / Owner only' }, { quoted: m }); return true; }
      await sock.sendMessage(jid, { text: '👋 Goodbye! Leaving group...' });
      await sock.groupLeave(jid);
      return true;
    }

    if(!isGroup){ await sock.sendMessage(jid, { text: '❌ Group only' }, { quoted: m }); return true; }
    const admin = await isAdmin(sock, jid, sender);
    const botAdmin = await isBotAdmin(sock, jid);
    const cfg = gCfg(jid);

    // --- GROUP - menu / info ---
    if(cmd === 'group'){
      const meta = await sock.groupMetadata(jid);
      await sock.sendMessage(jid, { text: `👥 *${meta.subject}*\n\nMembers: ${meta.participants.length}\nWelcome: ${cfg.welcome?'✅ ON':'❌ OFF'}\nGoodbye: ${cfg.goodbye?'✅ ON':'❌ OFF'}\nAntilink: ${cfg.antilink?'✅ ON':'❌ OFF'}\n\nCommands: .open .close .link .tagall .welcome on .goodbye on .setwelcome <text>` }, { quoted: m });
      return true;
    }
    if(cmd === 'groupinfo'){
      const meta = await sock.groupMetadata(jid);
      const admins = meta.participants.filter(p=>p.admin);
      await sock.sendMessage(jid, { text: `👥 *${meta.subject}*\n\nID: ${meta.id}\nMembers: ${meta.participants.length}\nAdmins: ${admins.length}\nCreated: ${new Date(meta.creation*1000).toLocaleDateString()}\nDesc: ${meta.desc||'No description'}\n\nAdmins:\n${admins.map(p=>'@'+p.id.split('@')[0]).join('\n')}`, mentions: admins.map(p=>p.id) }, { quoted: m });
      return true;
    }
    if(cmd === 'getmembers'){
      const meta = await sock.groupMetadata(jid);
      await sock.sendMessage(jid, { text: `👥 *MEMBERS - ${meta.subject} (${meta.participants.length})*\n\n${meta.participants.map((p,i)=>`${i+1}. @${p.id.split('@')[0]} ${p.admin?'[Admin]':''}`).join('\n')}`, mentions: meta.participants.map(p=>p.id) }, { quoted: m });
      return true;
    }
    if(cmd === 'tagall' || cmd === 'hidetag'){
      if(!isOwner && !admin){ await sock.sendMessage(jid, { text: '❌ Admins only' }, { quoted: m }); return true; }
      const meta = await sock.groupMetadata(jid);
      const members = meta.participants.map(p=>p.id);
      const msg = text || '📢 Attention!';
      if(cmd==='tagall') await sock.sendMessage(jid, { text: `📢 *TAGALL*\n\n${msg}\n\n${members.map(x=>'@'+x.split('@')[0]).join(' ')}`, mentions: members }, { quoted: m });
      else await sock.sendMessage(jid, { text: msg, mentions: members });
      return true;
    }

    // --- OPEN / CLOSE ---
    if(cmd === 'open' || cmd === 'close'){
      if(!isOwner && !admin){ await sock.sendMessage(jid, { text: '❌ Admins only' }, { quoted: m }); return true; }
      if(!botAdmin){ await sock.sendMessage(jid, { text: '❌ Bot must be admin' }, { quoted: m }); return true; }
      await sock.groupSettingUpdate(jid, cmd==='close' ? 'announcement' : 'not_announcement');
      await sock.sendMessage(jid, { text: cmd==='close' ? '🔒 Group closed - only admins can chat' : '🔓 Group opened - everyone can chat' }, { quoted: m });
      return true;
    }

    // --- LINK / REVOKE / INVITE ---
    if(cmd === 'link' || cmd === 'revoke' || cmd === 'invite'){
      if(!isOwner && !admin){ await sock.sendMessage(jid, { text: '❌ Admins only' }, { quoted: m }); return true; }
      if(!botAdmin){ await sock.sendMessage(jid, { text: '❌ Bot must be admin' }, { quoted: m }); return true; }
      if(cmd==='revoke'){
        const code = await sock.groupRevokeInvite(jid);
        await sock.sendMessage(jid, { text: `🔗 New link:\nhttps://chat.whatsapp.com/${code}` }, { quoted: m });
        return true;
      }
      const code = await sock.groupInviteCode(jid);
      if(cmd==='invite'){
        const num = (args[0]||'').replace(/[^0-9]/g,'');
        if(!num){ await sock.sendMessage(jid, { text: 'Usage: .invite 2349037483649' }, { quoted: m }); return true; }
        await sock.sendMessage(num+'@s.whatsapp.net', { text: `You are invited to join group:\nhttps://chat.whatsapp.com/${code}` });
        await sock.sendMessage(jid, { text: `✅ Invite sent to @${num}`, mentions:[num+'@s.whatsapp.net'] }, { quoted: m });
        return true;
      }
      await sock.sendMessage(jid, { text: `🔗 Group link:\nhttps://chat.whatsapp.com/${code}` }, { quoted: m });
      return true;
    }

    // --- POLL ---
    if(cmd === 'poll'){
      // .poll Question | Option1 | Option2 | Option3
      const parts = text.split('|').map(s=>s.trim()).filter(Boolean);
      if(parts.length < 3){ await sock.sendMessage(jid, { text: 'Usage: .poll Question | Option1 | Option2 | Option3' }, { quoted: m }); return true; }
      await sock.sendMessage(jid, { poll: { name: parts[0], values: parts.slice(1), selectableCount: 1 } }, { quoted: m });
      return true;
    }

    // --- SETNAME / SETSUBJECT / SETDESC / SETDESCRIPTION ---
    if(['setname','setsubject'].includes(cmd)){
      if(!isOwner && !admin){ await sock.sendMessage(jid, { text: '❌ Admins only' }, { quoted: m }); return true; }
      if(!botAdmin){ await sock.sendMessage(jid, { text: '❌ Bot must be admin' }, { quoted: m }); return true; }
      if(!text){ await sock.sendMessage(jid, { text: `Usage: .${cmd} New Group Name` }, { quoted: m }); return true; }
      await sock.groupUpdateSubject(jid, text);
      await sock.sendMessage(jid, { text: `✅ Group name changed to: ${text}` }, { quoted: m });
      return true;
    }
    if(['setdesc','setdescription'].includes(cmd)){
      if(!isOwner && !admin){ await sock.sendMessage(jid, { text: '❌ Admins only' }, { quoted: m }); return true; }
      if(!botAdmin){ await sock.sendMessage(jid, { text: '❌ Bot must be admin' }, { quoted: m }); return true; }
      if(!text){ await sock.sendMessage(jid, { text: `Usage: .${cmd} New description` }, { quoted: m }); return true; }
      await sock.groupUpdateDescription(jid, text);
      await sock.sendMessage(jid, { text: `✅ Description updated` }, { quoted: m });
      return true;
    }

    // --- SETGPP - set group pic (reply to image) ---
    if(cmd === 'setgpp'){
      if(!isOwner && !admin){ await sock.sendMessage(jid, { text: '❌ Admins only' }, { quoted: m }); return true; }
      if(!botAdmin){ await sock.sendMessage(jid, { text: '❌ Bot must be admin' }, { quoted: m }); return true; }
      const ctx = m.message?.extendedTextMessage?.contextInfo;
      const quoted = ctx?.quotedMessage;
      const imgMsg = quoted?.imageMessage || m.message?.imageMessage;
      if(!imgMsg){ await sock.sendMessage(jid, { text: 'Reply to an image with .setgpp or send image with caption .setgpp' }, { quoted: m }); return true; }
      try{
        const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
        const stream = await downloadContentFromMessage(imgMsg, 'image');
        let buf = Buffer.from([]);
        for await(const c of stream) buf = Buffer.concat([buf, c]);
        await sock.updateProfilePicture(jid, buf);
        await sock.sendMessage(jid, { text: '✅ Group picture updated' }, { quoted: m });
      }catch(e){ await sock.sendMessage(jid, { text: `❌ Failed: ${e.message}` }, { quoted: m }); }
      return true;
    }

    // --- WELCOME / GOODBYE / SETWELCOME / SETGOODBYE ---
    if(cmd === 'welcome' || cmd === 'goodbye'){
      if(!isOwner && !admin){ await sock.sendMessage(jid, { text: '❌ Admins only' }, { quoted: m }); return true; }
      const arg = (args[0]||'').toLowerCase();
      if(arg==='on'||arg==='off'){ setG(jid, cmd, arg==='on'); await sock.sendMessage(jid, { text: `✅ ${cmd} is now ${arg==='on'?'✅ ON':'❌ OFF'}` }, { quoted: m }); return true; }
      await sock.sendMessage(jid, { text: `${cmd} is ${cfg[cmd]?'✅ ON':'❌ OFF'}\nUsage: .${cmd} on / .${cmd} off` }, { quoted: m });
      return true;
    }
    if(cmd === 'setwelcome' || cmd === 'setgoodbye'){
      if(!isOwner && !admin){ await sock.sendMessage(jid, { text: '❌ Admins only' }, { quoted: m }); return true; }
      if(!text){ await sock.sendMessage(jid, { text: `Usage: .${cmd} Welcome @user to @group\nUse @user for mention, @group for group name` }, { quoted: m }); return true; }
      const key = cmd==='setwelcome' ? 'welcomeText' : 'goodbyeText';
      setG(jid, key, text);
      setG(jid, cmd==='setwelcome'?'welcome':'goodbye', true);
      await sock.sendMessage(jid, { text: `✅ ${cmd} set:\n${text}` }, { quoted: m });
      return true;
    }

    // --- ANTILINK (group local - also in anti.js) ---
    if(cmd === 'antilink'){
      if(!isOwner && !admin){ await sock.sendMessage(jid, { text: '❌ Admins only' }, { quoted: m }); return true; }
      const arg = (args[0]||'').toLowerCase();
      if(arg==='on'||arg==='off'){ setG(jid, 'antilink', arg==='on'); await sock.sendMessage(jid, { text: `🛡️ Antilink ${arg==='on'?'✅ ON':'❌ OFF'}` }, { quoted: m }); return true; }
      await sock.sendMessage(jid, { text: `Antilink: ${cfg.antilink?'✅ ON':'❌ OFF'}` }, { quoted: m });
      return true;
    }

    // --- RESETGROUP ---
    if(cmd === 'resetgroup'){
      if(!isOwner){ await sock.sendMessage(jid, { text: '❌ Owner only' }, { quoted: m }); return true; }
      const db = load(); delete db[jid]; save(db);
      await sock.sendMessage(jid, { text: '✅ Group settings reset' }, { quoted: m });
      return true;
    }

    return false;
  }
};
