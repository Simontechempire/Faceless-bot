// 🛠️ FACELESS - UTILITY PLUGIN - REAL HANDLER

const START = Date.now();
function formatUptime(ms){
  const s = Math.floor(ms/1000);
  const d = Math.floor(s/86400), h = Math.floor((s%86400)/3600), m = Math.floor((s%3600)/60), sec = s%60;
  return `${d}d ${h}h ${m}m ${sec}s`;
}
function toBase64(s){ return Buffer.from(s).toString('base64'); }
function fromBase64(s){ try{ return Buffer.from(s,'base64').toString('utf8'); }catch{ return 'Invalid base64'; } }

const COMMANDS = ['ping','speed','uptime','runtime','info','id','jid','getid','screenshot','ss','qr','qrcode','shorten','short','tinyurl','url','base64','encode','decode','binary','calculator','calc','time','date','day','whois','ip','password','passgen','random','dice','coin','flip','choose','pick','count','reverse','uppercase','lowercase','repeat','length','wordcount','emoji','stickerinfo2','vcard','getpp','profile','check','device','botinfo','system','memory','cpu','version','help2'];

module.exports = {
  name: 'utility',
  commands: COMMANDS,
  run: async (sock, m, jid, cmd, args, text, isOwner, isGroup, sender) => {
    if(!COMMANDS.includes(cmd)) return false;

    // --- PING / SPEED ---
    if(cmd==='ping' || cmd==='speed'){
      const start = Date.now();
      const sent = await sock.sendMessage(jid, { text: '🏓 Pinging...' }, { quoted: m });
      const latency = Date.now() - start;
      await sock.sendMessage(jid, { text: `🏓 *PONG!*\n\n⚡ Speed: ${latency}ms\n⏱️ Uptime: ${formatUptime(Date.now()-START)}\n🤖 Bot: FACELESS\n📶 Status: Online ✅` }, { quoted: m });
      return true;
    }

    // --- UPTIME / RUNTIME / BOTINFO / SYSTEM / MEMORY ---
    if(cmd==='uptime' || cmd==='runtime'){
      await sock.sendMessage(jid, { text: `⏱️ *UPTIME*\n\nBot has been running for:\n${formatUptime(Date.now()-START)}\n\nStarted: ${new Date(START).toLocaleString('en-NG',{timeZone:'Africa/Lagos'})}` }, { quoted: m });
      return true;
    }
    if(cmd==='botinfo' || cmd==='info' || cmd==='system'){
      const mem = process.memoryUsage();
      await sock.sendMessage(jid, { text: `🤖 *FACELESS BOT INFO*\n\n👤 Owner: ${global.config?.ownerName||'FACELESS'}\n⏱️ Uptime: ${formatUptime(Date.now()-START)}\n💾 Memory: ${(mem.heapUsed/1024/1024).toFixed(1)} MB / ${(mem.heapTotal/1024/1024).toFixed(1)} MB\n🖥️ Platform: ${process.platform} | Node ${process.version}\n📦 Commands: 200+\n🔌 Plugins: 27\n✅ Status: Online` }, { quoted: m });
      return true;
    }
    if(cmd==='memory' || cmd==='cpu'){
      const mem = process.memoryUsage();
      await sock.sendMessage(jid, { text: `💾 *SYSTEM*\n\nHeap Used: ${(mem.heapUsed/1024/1024).toFixed(1)} MB\nHeap Total: ${(mem.heapTotal/1024/1024).toFixed(1)} MB\nRSS: ${(mem.rss/1024/1024).toFixed(1)} MB\nCPU: ${process.cpuUsage().user/1000000}s user\nUptime: ${formatUptime(process.uptime()*1000)}` }, { quoted: m });
      return true;
    }
    if(cmd==='version'){
      await sock.sendMessage(jid, { text: `📦 *VERSION*\n\nFACELESS v1.0.0\nNode: ${process.version}\nBaileys: Latest\nUpdated: 2026` }, { quoted: m });
      return true;
    }

    // --- ID / JID / GETID ---
    if(['id','jid','getid'].includes(cmd)){
      const target = m.message?.extendedTextMessage?.contextInfo?.participant || sender;
      await sock.sendMessage(jid, { text: `🆔 *ID INFO*\n\nChat ID: ${jid}\nYour ID: ${sender}\n${isGroup?`Group ID: ${jid}\n` : ''}Target: ${target}` }, { quoted: m });
      return true;
    }

    // --- SCREENSHOT / SS ---
    if(cmd==='screenshot' || cmd==='ss'){
      if(!text || !text.startsWith('http')){ await sock.sendMessage(jid, { text: 'Usage: .ss https://google.com' }, { quoted: m }); return true; }
      await sock.sendMessage(jid, { text: '📸 Taking screenshot...' }, { quoted: m });
      try{
        const url = `https://image.thum.io/get/width/1200/crop/800/fullpage/${text}`;
        await sock.sendMessage(jid, { image: { url }, caption: `📸 Screenshot: ${text}` }, { quoted: m });
      }catch(e){ await sock.sendMessage(jid, { text: `❌ Screenshot failed: ${e.message}` }, { quoted: m }); }
      return true;
    }

    // --- QR / QRCODE ---
    if(cmd==='qr' || cmd==='qrcode'){
      if(!text){ await sock.sendMessage(jid, { text: 'Usage: .qr Hello World' }, { quoted: m }); return true; }
      try{
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;
        await sock.sendMessage(jid, { image: { url }, caption: `📷 QR for: ${text}` }, { quoted: m });
      }catch(e){ await sock.sendMessage(jid, { text: `❌ QR failed` }, { quoted: m }); }
      return true;
    }

    // --- SHORTEN / SHORT / TINYURL / URL ---
    if(['shorten','short','tinyurl','url'].includes(cmd)){
      if(!text || !text.startsWith('http')){ await sock.sendMessage(jid, { text: 'Usage: .shorten https://very-long-link.com/xxxx' }, { quoted: m }); return true; }
      try{
        const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(text)}`);
        const short = await res.text();
        await sock.sendMessage(jid, { text: `🔗 *SHORTENED*\n\nOriginal: ${text}\nShort: ${short}` }, { quoted: m });
      }catch(e){ await sock.sendMessage(jid, { text: `❌ Shorten failed` }, { quoted: m }); }
      return true;
    }

    // --- BASE64 / ENCODE / DECODE / BINARY / REVERSE / UPPERCASE etc ---
    if(cmd==='base64' || cmd==='encode'){
      if(!text){ await sock.sendMessage(jid, { text: 'Usage: .base64 Hello' }, { quoted: m }); return true; }
      await sock.sendMessage(jid, { text: `🔐 *BASE64*\n\nOriginal: ${text}\nEncoded: ${toBase64(text)}` }, { quoted: m });
      return true;
    }
    if(cmd==='decode'){
      if(!text){ await sock.sendMessage(jid, { text: 'Usage: .decode SGVsbG8=' }, { quoted: m }); return true; }
      await sock.sendMessage(jid, { text: `🔓 *DECODED*\n\nEncoded: ${text}\nDecoded: ${fromBase64(text)}` }, { quoted: m });
      return true;
    }
    if(cmd==='binary'){
      if(!text){ await sock.sendMessage(jid, { text: 'Usage: .binary Hello' }, { quoted: m }); return true; }
      const bin = text.split('').map(c=>c.charCodeAt(0).toString(2).padStart(8,'0')).join(' ');
      await sock.sendMessage(jid, { text: `💻 *BINARY*\n\nOriginal: ${text}\nBinary: ${bin}` }, { quoted: m });
      return true;
    }
    if(cmd==='reverse'){
      await sock.sendMessage(jid, { text: `🔄 *REVERSED*\n\n${text.split('').reverse().join('')}` }, { quoted: m });
      return true;
    }
    if(cmd==='uppercase'){ await sock.sendMessage(jid, { text: text.toUpperCase() }, { quoted: m }); return true; }
    if(cmd==='lowercase'){ await sock.sendMessage(jid, { text: text.toLowerCase() }, { quoted: m }); return true; }
    if(cmd==='repeat'){
      const parts = text.split(' ');
      const count = parseInt(parts[0])||1;
      const msg = parts.slice(1).join(' ');
      if(count>20){ await sock.sendMessage(jid, { text: 'Max 20 repeats' }, { quoted: m }); return true; }
      await sock.sendMessage(jid, { text: Array(count).fill(msg).join('\n') }, { quoted: m });
      return true;
    }
    if(cmd==='length' || cmd==='wordcount'){
      const words = text.split(/\s+/).filter(Boolean);
      await sock.sendMessage(jid, { text: `📏 *COUNT*\n\nText: ${text}\nCharacters: ${text.length}\nWords: ${words.length}` }, { quoted: m });
      return true;
    }

    // --- CALCULATOR / CALC ---
    if(cmd==='calculator' || cmd==='calc'){
      if(!text){ await sock.sendMessage(jid, { text: 'Usage: .calc 2+2*5' }, { quoted: m }); return true; }
      try{
        const clean = text.replace(/[^0-9+\-*/().% ]/g,'');
        if(!clean){ await sock.sendMessage(jid, { text: 'Invalid calculation' }, { quoted: m }); return true; }
        const result = Function(`return (${clean})`)();
        await sock.sendMessage(jid, { text: `🧮 *CALCULATOR*\n\n${text} = ${result}` }, { quoted: m });
      }catch{ await sock.sendMessage(jid, { text: '❌ Invalid calculation. Try: .calc 2+2' }, { quoted: m }); }
      return true;
    }

    // --- TIME / DATE / DAY ---
    if(['time','date','day'].includes(cmd)){
      const now = new Date();
      const lagos = now.toLocaleString('en-NG', { timeZone:'Africa/Lagos', weekday:'long', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit' });
      await sock.sendMessage(jid, { text: `🕐 *TIME - NIGERIA (Lagos)*\n\n${lagos}\n\n🌍 UTC: ${now.toUTCString()}` }, { quoted: m });
      return true;
    }

    // --- WHOIS / IP ---
    if(cmd==='whois' || cmd==='ip'){
      if(!text){ await sock.sendMessage(jid, { text: 'Usage: .ip 8.8.8.8 OR .whois google.com' }, { quoted: m }); return true; }
      try{
        const domain = text.replace(/https?:\/\//,'').split('/')[0];
        const res = await fetch(`http://ip-api.com/json/${domain}`);
        const d = await res.json();
        if(d.status!=='success'){ await sock.sendMessage(jid, { text: `❌ Lookup failed for: ${text}` }, { quoted: m }); return true; }
        await sock.sendMessage(jid, { text: `🌐 *IP INFO - ${domain}*\n\nIP: ${d.query}\nCountry: ${d.country} ${d.countryCode}\nRegion: ${d.regionName}\nCity: ${d.city}\nISP: ${d.isp}\nTimezone: ${d.timezone}\nLat/Lon: ${d.lat}, ${d.lon}` }, { quoted: m });
      }catch(e){ await sock.sendMessage(jid, { text: `❌ Failed: ${e.message}` }, { quoted: m }); }
      return true;
    }

    // --- PASSWORD / PASSGEN ---
    if(cmd==='password' || cmd==='passgen'){
      const len = parseInt(args[0])||12;
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      let pass='';
      for(let i=0;i<Math.min(len,32);i++) pass+=chars[Math.floor(Math.random()*chars.length)];
      await sock.sendMessage(jid, { text: `🔐 *GENERATED PASSWORD (${pass.length} chars)*\n\n\`${pass}\`\n\n_Don't share it with anyone!_` }, { quoted: m });
      return true;
    }

    // --- RANDOM / DICE / COIN / FLIP / CHOOSE / PICK ---
    if(cmd==='random'){
      const max = parseInt(args[0])||100;
      await sock.sendMessage(jid, { text: `🎲 Random number (1-${max}): *${Math.floor(Math.random()*max)+1}*` }, { quoted: m });
      return true;
    }
    if(cmd==='dice'){ await sock.sendMessage(jid, { text: `🎲 Dice: *${Math.floor(Math.random()*6)+1}* ${['⚀','⚁','⚂','⚃','⚄','⚅'][Math.floor(Math.random()*6)]||''}` }, { quoted: m }); return true; }
    if(cmd==='coin' || cmd==='flip'){ const r=Math.random()<0.5?'Heads 🪙':'Tails 🪙'; await sock.sendMessage(jid, { text: `🪙 Coin Flip: *${r}*` }, { quoted: m }); return true; }
    if(cmd==='choose' || cmd==='pick'){
      const opts = text.split(/,|\|/).map(s=>s.trim()).filter(Boolean);
      if(opts.length<2){ await sock.sendMessage(jid, { text: 'Usage: .choose rice, beans, yam' }, { quoted: m }); return true; }
      await sock.sendMessage(jid, { text: `🤔 I choose: *${opts[Math.floor(Math.random()*opts.length)]}*\nFrom: ${opts.join(', ')}` }, { quoted: m });
      return true;
    }
    if(cmd==='count'){
      const max = parseInt(args[0])||10;
      let out=''; for(let i=1;i<=Math.min(max,50);i++) out+=`${i} `;
      await sock.sendMessage(jid, { text: `🔢 Counting to ${max}:\n${out}` }, { quoted: m });
      return true;
    }

    // --- EMOJI ---
    if(cmd==='emoji'){
      if(!text){ await sock.sendMessage(jid, { text: 'Usage: .emoji love' }, { quoted: m }); return true; }
      const map = { love:'❤️💕💖', money:'💰💸🤑', food:'🍚🍗🍕', happy:'😊😂🤣', sad:'😔😢😭', fire:'🔥💥', nigeria:'🇳🇬', cat:'🐱🐈', dog:'🐶🐕' };
      const key = text.toLowerCase();
      await sock.sendMessage(jid, { text: `😀 *EMOJI for ${text}*\n\n${map[key]||'✨🎉🔥💖😍🌟'}` }, { quoted: m });
      return true;
    }

    // --- VCARD / GETPP / PROFILE / CHECK / DEVICE ---
    if(cmd==='vcard'){
      const target = m.message?.extendedTextMessage?.contextInfo?.participant || sender;
      const num = target.split('@')[0];
      await sock.sendMessage(jid, { contacts: { displayName: `User ${num}`, contacts: [{ vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:User ${num}\nTEL;TYPE=CELL:+${num}\nEND:VCARD` }] } }, { quoted: m });
      return true;
    }
    if(cmd==='getpp' || cmd==='profile'){
      const target = m.message?.extendedTextMessage?.contextInfo?.participant || sender;
      try{
        const url = await sock.profilePictureUrl(target, 'image');
        await sock.sendMessage(jid, { image: { url }, caption: `👤 Profile pic of @${target.split('@')[0]}`, mentions:[target] }, { quoted: m });
      }catch{ await sock.sendMessage(jid, { text: '❌ No profile picture / private' }, { quoted: m }); }
      return true;
    }
    if(cmd==='check'){
      const target = m.message?.extendedTextMessage?.contextInfo?.participant || sender;
      try{ const status = await sock.fetchStatus(target); await sock.sendMessage(jid, { text: `👤 *CHECK @${target.split('@')[0]}*\n\nBio: ${status?.status||'No bio'}\nSet: ${status?.setAt||'Unknown'}`, mentions:[target] }, { quoted: m }); }
      catch{ await sock.sendMessage(jid, { text: '❌ Cannot fetch status' }, { quoted: m }); }
      return true;
    }
    if(cmd==='device'){
      await sock.sendMessage(jid, { text: `📱 *DEVICE*\n\nYou are on WhatsApp\nBot is running on server\nPlatform: ${process.platform}` }, { quoted: m });
      return true;
    }
    if(cmd==='help2'){
      await sock.sendMessage(jid, { text: `🛠️ *UTILITY COMMANDS*\n\n.ping .uptime .botinfo .calc 2+2\n.qr Hello .shorten <link> .ss https://google.com\n.base64 Hello .decode SGVsbG8=\n.password 16 .random 100 .dice .coin\n.choose rice, beans .time .ip 8.8.8.8\n.getpp .vcard .check` }, { quoted: m });
      return true;
    }

    return false;
  }
};
