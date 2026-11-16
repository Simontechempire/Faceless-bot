const { facelessReply, sendAwait } = require('../lib/function');
const axios = require('axios');

module.exports = {
  name: "imagestudio",
  async run(sock, m, jid, cmd, args, text, isOwner, isGroup, sender){

    const imgCmds = ['blur','grayscale','grey','invert','flip','flop','rotate','circle','meme','memetext','resize','pixelate','sepia','brightness','contrast','beautiful','wanted','jail','trigger','gay','trash','rip','rainbow','compress','enhance'];
    if(!imgCmds.includes(cmd)) return false;

    const ctx = m.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;
    const hasQuotedImage = quoted && (quoted.imageMessage || quoted.stickerMessage);

    // Helper: get quoted image buffer
    async function getImageBuffer(){
      if(!hasQuotedImage) return null;
      try{
        const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
        const type = Object.keys(quoted)[0];
        const stream = await downloadContentFromMessage(quoted[type], type.replace('Message',''));
        let buffer = Buffer.from([]);
        for await(const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        return buffer;
      }catch{ return null; }
    }

    // Helper: get profile pic as buffer
    async function getProfileBuffer(target){
      try{
        const url = await sock.profilePictureUrl(target, 'image');
        const res = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(res.data);
      }catch{ return null; }
    }

    const getTarget = () => {
      if(ctx?.mentionedJid?.length) return ctx.mentionedJid[0];
      if(ctx?.participant) return ctx.participant;
      return sender;
    };

    // ================= FILTERS - REAL via wsrv.nl image proxy =================
    // wsrv.nl is a real free image proxy: blur, grayscale, invert, etc
    const filterMap = {
      blur: 'blur=10',
      grayscale: 'grayscale',
      grey: 'grayscale',
      invert: 'negate',
      flip: 'flip',
      flop: 'flop',
      sepia: 'sepia',
      pixelate: 'pixelate=20',
      brightness: 'brightness=150',
      contrast: 'contrast=150',
      enhance: 'sharpen=5&brightness=110&contrast=110',
      rainbow: 'tint=ff00ff',
      compress: 'q=20'
    };

    if(filterMap[cmd]){
      await sendAwait(sock, jid, m);
      if(!hasQuotedImage){
        await facelessReply(sock, jid, `Reply To An Image With .${cmd}`, m);
        return true;
      }
      try{
        // Upload to catbox to get public URL for wsrv
        const buffer = await getImageBuffer();
        const FormData = require('form-data');
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', buffer, { filename: 'img.jpg' });
        const up = await axios.post('https://catbox.moe/user/api.php', form, { headers: form.getHeaders(), timeout: 30000 });
        const publicUrl = up.data;
        // Apply real filter via wsrv
        const filteredUrl = `https://wsrv.nl/?url=${encodeURIComponent(publicUrl)}&${filterMap[cmd]}&output=jpg`;
        const imgRes = await axios.get(filteredUrl, { responseType: 'arraybuffer' });
        await sock.sendMessage(jid, { image: Buffer.from(imgRes.data), caption: `▫️ 💀 ${cmd.toUpperCase()} Applied` }, { quoted: m });
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= ROTATE - REAL =================
    if(cmd === 'rotate'){
      await sendAwait(sock, jid, m);
      if(!hasQuotedImage){ await facelessReply(sock, jid, "Reply To Image With .rotate <90/180/270>", m); return true; }
      const deg = parseInt(args[0]) || 90;
      try{
        const buffer = await getImageBuffer();
        const FormData = require('form-data');
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', buffer, { filename: 'img.jpg' });
        const up = await axios.post('https://catbox.moe/user/api.php', form, { headers: form.getHeaders() });
        const filteredUrl = `https://wsrv.nl/?url=${encodeURIComponent(up.data)}&rotate=${deg}&output=jpg`;
        const imgRes = await axios.get(filteredUrl, { responseType: 'arraybuffer' });
        await sock.sendMessage(jid, { image: Buffer.from(imgRes.data), caption: `Rotated ${deg}°` }, { quoted: m });
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= RESIZE - REAL =================
    if(cmd === 'resize'){
      await sendAwait(sock, jid, m);
      if(!hasQuotedImage){ await facelessReply(sock, jid, "Reply To Image With .resize <width> <height>\nExample: .resize 500 500", m); return true; }
      const w = parseInt(args[0]) || 500;
      const h = parseInt(args[1]) || 500;
      try{
        const buffer = await getImageBuffer();
        const FormData = require('form-data');
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', buffer, { filename: 'img.jpg' });
        const up = await axios.post('https://catbox.moe/user/api.php', form, { headers: form.getHeaders() });
        const filteredUrl = `https://wsrv.nl/?url=${encodeURIComponent(up.data)}&w=${w}&h=${h}&fit=cover&output=jpg`;
        const imgRes = await axios.get(filteredUrl, { responseType: 'arraybuffer' });
        await sock.sendMessage(jid, { image: Buffer.from(imgRes.data), caption: `Resized To ${w}x${h}` }, { quoted: m });
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= CIRCLE - REAL via some-random-api =================
    if(cmd === 'circle'){
      await sendAwait(sock, jid, m);
      const target = getTarget();
      try{
        const ppUrl = await sock.profilePictureUrl(target, 'image');
        const apiUrl = `https://api.some-random-api.com/canvas/circle?avatar=${encodeURIComponent(ppUrl)}`;
        const res = await axios.get(apiUrl, { responseType: 'arraybuffer' });
        await sock.sendMessage(jid, { image: Buffer.from(res.data), caption: `▫️ 💀 Circle Avatar @${target.split('@')[0]}`, mentions: [target] }, { quoted: m });
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= MEME - REAL via memegen =================
    if(cmd === 'meme' || cmd === 'memetext'){
      await sendAwait(sock, jid, m);
      // .meme top text | bottom text
      if(!text.includes('|')){ await facelessReply(sock, jid, "Usage: .meme top text | bottom text", m); return true; }
      const [top, bottom] = text.split('|').map(s=>s.trim().replace(/ /g,'_'));
      try{
        // Real memegen template - drake
        const memeUrl = `https://api.memegen.link/images/drake/${encodeURIComponent(top)}/${encodeURIComponent(bottom)}.png`;
        await sock.sendMessage(jid, { image: { url: memeUrl }, caption: "Your Meme" }, { quoted: m });
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= FUN CANVAS - REAL some-random-api =================
    const canvasMap = {
      beautiful: 'beautiful',
      wanted: 'wanted',
      jail: 'jail',
      trigger: 'triggered',
      gay: 'gay',
      trash: 'trash',
      rip: 'rip'
    };
    if(canvasMap[cmd]){
      await sendAwait(sock, jid, m);
      const target = getTarget();
      try{
        const ppUrl = await sock.profilePictureUrl(target, 'image');
        const apiUrl = `https://api.some-random-api.com/canvas/${canvasMap[cmd]}?avatar=${encodeURIComponent(ppUrl)}`;
        const res = await axios.get(apiUrl, { responseType: 'arraybuffer' });
        const isGif = cmd === 'trigger';
        if(isGif){
          await sock.sendMessage(jid, { video: Buffer.from(res.data), gifPlayback: true, caption: `▫️ 💀 ${cmd} @${target.split('@')[0]}`, mentions: [target] }, { quoted: m });
        } else {
          await sock.sendMessage(jid, { image: Buffer.from(res.data), caption: `▫️ 💀 ${cmd} @${target.split('@')[0]}`, mentions: [target] }, { quoted: m });
        }
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    return false;
  }
};
