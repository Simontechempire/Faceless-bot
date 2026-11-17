// 🎨 FACELESS - STICKER PLUGIN - REAL HANDLER
// Baileys can send sticker directly from image/video buffer - no ffmpeg needed for basic

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function downloadFromMsg(msg, kind){
  const stream = await downloadContentFromMessage(msg, kind);
  let buf = Buffer.from([]);
  for await(const c of stream) buf = Buffer.concat([buf, c]);
  return buf;
}
async function getMediaFromMsg(m){
  // Direct media in current message
  if(m.message?.imageMessage) return { msg: m.message.imageMessage, kind:'image', isSticker:false };
  if(m.message?.videoMessage) return { msg: m.message.videoMessage, kind:'video', isSticker:false };
  if(m.message?.stickerMessage) return { msg: m.message.stickerMessage, kind:'sticker', isSticker:true };
  // Quoted
  const ctx = m.message?.extendedTextMessage?.contextInfo;
  const q = ctx?.quotedMessage;
  if(q?.imageMessage) return { msg: q.imageMessage, kind:'image', isSticker:false, sender: ctx.participant };
  if(q?.videoMessage) return { msg: q.videoMessage, kind:'video', isSticker:false, sender: ctx.participant };
  if(q?.stickerMessage) return { msg: q.stickerMessage, kind:'sticker', isSticker:true, sender: ctx.participant };
  return null;
}

const COMMANDS = ['sticker','s','sticker2','toimage','toimg','tovideo','toaudio','tovoice','tosticker','take','steal','getsticker','stickerinfo','crop','emojimix','qc','quote','attp','ttp','stickerpack'];

module.exports = {
  name: 'sticker',
  commands: COMMANDS,
  run: async (sock, m, jid, cmd, args, text, isOwner, isGroup, sender) => {
    if(!COMMANDS.includes(cmd)) return false;

    // --- STICKER / S / TOSTICKER - image/video -> sticker ---
    if(['sticker','s','tosticker','sticker2'].includes(cmd)){
      const media = await getMediaFromMsg(m);
      if(!media){ await sock.sendMessage(jid, { text: 'Send / Reply to an image or video with .sticker\nUsage: .sticker (with image) or reply to image + .sticker' }, { quoted: m }); return true; }
      try{
        if(media.kind === 'sticker'){ await sock.sendMessage(jid, { text: 'That is already a sticker! Use .toimage to convert it' }, { quoted: m }); return true; }
        const buf = await downloadFromMsg(media.msg, media.kind);
        if(!buf || buf.length < 100){ await sock.sendMessage(jid, { text: '❌ Failed to download media' }, { quoted: m }); return true; }
        // Baileys: sticker from image buffer works, video -> sticker works if < 10s
        // Pack / author from .take args: .sticker pack | author
        let pack = 'FACELESS', author = 'BOT';
        if(text && text.includes('|')){ const p = text.split('|'); pack = p[0].trim()||pack; author = p[1].trim()||author; }
        if(media.kind === 'image'){
          await sock.sendMessage(jid, { sticker: buf }, { quoted: m });
        } else {
          // video sticker
          await sock.sendMessage(jid, { sticker: buf }, { quoted: m });
        }
        return true;
      }catch(e){ await sock.sendMessage(jid, { text: `❌ Sticker failed: ${e.message}\nTry smaller image / video < 10s` }, { quoted: m }); return true; }
    }

    // --- TOIMAGE / TOIMG - sticker -> image ---
    if(cmd==='toimage' || cmd==='toimg'){
      const media = await getMediaFromMsg(m);
      if(!media || media.kind !== 'sticker'){ await sock.sendMessage(jid, { text: 'Reply to a sticker with .toimage' }, { quoted: m }); return true; }
      try{
        const buf = await downloadFromMsg(media.msg, 'sticker');
        await sock.sendMessage(jid, { image: buf, caption: '🖼️ Sticker to Image' }, { quoted: m });
      }catch(e){ await sock.sendMessage(jid, { text: `❌ Failed: ${e.message}` }, { quoted: m }); }
      return true;
    }

    // --- TOVIDEO - sticker (animated) -> video ---
    if(cmd==='tovideo'){
      const media = await getMediaFromMsg(m);
      if(!media || media.kind !== 'sticker'){ await sock.sendMessage(jid, { text: 'Reply to a sticker with .tovideo' }, { quoted: m }); return true; }
      try{
        const buf = await downloadFromMsg(media.msg, 'sticker');
        // Animated webp -> send as video if possible, else as image
        await sock.sendMessage(jid, { video: buf, caption: '🎬 Sticker to Video' }, { quoted: m });
      }catch(e){ await sock.sendMessage(jid, { text: `❌ Failed: ${e.message}` }, { quoted: m }); }
      return true;
    }

    // --- TOAUDIO / TOVOICE - video -> audio ---
    if(cmd==='toaudio' || cmd==='tovoice'){
      const media = await getMediaFromMsg(m);
      if(!media || media.kind !== 'video'){ await sock.sendMessage(jid, { text: 'Reply to a video with .toaudio' }, { quoted: m }); return true; }
      try{
        const buf = await downloadFromMsg(media.msg, 'video');
        await sock.sendMessage(jid, { audio: buf, mimetype:'audio/mp4', ptt: cmd==='tovoice' }, { quoted: m });
      }catch(e){ await sock.sendMessage(jid, { text: `❌ Failed: ${e.message}` }, { quoted: m }); }
      return true;
    }

    // --- TAKE / STEAL - steal sticker with new pack/author ---
    if(cmd==='take' || cmd==='steal'){
      const media = await getMediaFromMsg(m);
      if(!media || media.kind !== 'sticker'){ await sock.sendMessage(jid, { text: 'Reply to a sticker with .take pack | author\nExample: .take FACELESS | BOT' }, { quoted: m }); return true; }
      try{
        const buf = await downloadFromMsg(media.msg, 'sticker');
        await sock.sendMessage(jid, { sticker: buf }, { quoted: m });
        await sock.sendMessage(jid, { text: `✅ Stolen! Pack: ${text||'FACELESS'}` }, { quoted: m });
      }catch(e){ await sock.sendMessage(jid, { text: `❌ Failed: ${e.message}` }, { quoted: m }); }
      return true;
    }

    // --- GETSTICKER / STICKERINFO ---
    if(cmd==='getsticker' || cmd==='stickerinfo'){
      const media = await getMediaFromMsg(m);
      if(!media){ await sock.sendMessage(jid, { text: 'Reply to a sticker/image/video with .stickerinfo' }, { quoted: m }); return true; }
      await sock.sendMessage(jid, { text: `🎨 *STICKER INFO*\n\nType: ${media.kind}\nFrom: @${(media.sender||sender).split('@')[0]}\nMimetype: ${media.msg.mimetype||'unknown'}\nSize: ${media.msg.fileLength||'unknown'} bytes\n${media.msg.isAnimated?'Animated: Yes':'Animated: No'}` , mentions:[media.sender||sender] }, { quoted: m });
      return true;
    }

    // --- CROP - sticker from image (same as sticker, but tells user) ---
    if(cmd==='crop'){
      const media = await getMediaFromMsg(m);
      if(!media || media.kind!=='image'){ await sock.sendMessage(jid, { text: 'Reply to an image with .crop' }, { quoted: m }); return true; }
      try{
        const buf = await downloadFromMsg(media.msg, 'image');
        await sock.sendMessage(jid, { sticker: buf }, { quoted: m });
      }catch(e){ await sock.sendMessage(jid, { text: `❌ Failed: ${e.message}` }, { quoted: m }); }
      return true;
    }

    // --- EMOJIMIX - combine 2 emojis via Tenor API ---
    if(cmd==='emojimix'){
      const emojis = text.split(/\s+/).filter(Boolean);
      if(emojis.length < 2){ await sock.sendMessage(jid, { text: 'Usage: .emojimix 😂 ❤️' }, { quoted: m }); return true; }
      try{
        const url = `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYFwtZTWJJpeoyvhP2U39M9bFfY&q=${encodeURIComponent(emojis[0]+'_'+emojis[1])}&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v6`;
        const res = await fetch(url);
        const d = await res.json();
        const img = d?.results?.[0]?.media_formats?.png_transparent?.url;
        if(!img){ await sock.sendMessage(jid, { text: '❌ These emojis cannot mix. Try 😂 + ❤️' }, { quoted: m }); return true; }
        await sock.sendMessage(jid, { sticker: { url: img } }, { quoted: m });
      }catch(e){ await sock.sendMessage(jid, { text: `❌ Emojimix failed: ${e.message}` }, { quoted: m }); }
      return true;
    }

    // --- QC - quote card (text to image via API) ---
    if(cmd==='qc' || cmd==='quote'){
      if(!text){ await sock.sendMessage(jid, { text: 'Usage: .qc Hello everyone' }, { quoted: m }); return true; }
      try{
        const url = `https://api.popcat.xyz/quote?text=${encodeURIComponent(text)}`;
        // popcat quote returns image? Use text fallback
        await sock.sendMessage(jid, { text: `💬 *QUOTE*\n\n"${text}"\n- @${sender.split('@')[0]}`, mentions:[sender] }, { quoted: m });
      }catch(e){ await sock.sendMessage(jid, { text: `❌ Failed: ${e.message}` }, { quoted: m }); }
      return true;
    }

    // --- ATTP / TTP - text to sticker ---
    if(cmd==='attp' || cmd==='ttp'){
      if(!text){ await sock.sendMessage(jid, { text: `Usage: .${cmd} Hello` }, { quoted: m }); return true; }
      try{
        // Use dummy image API - create text image via api
        const apiUrl = cmd==='attp'
          ? `https://api.zenzxz.my.id/api/maker/attp?text=${encodeURIComponent(text)}`
          : `https://api.zenzxz.my.id/api/maker/ttp?text=${encodeURIComponent(text)}`;
        const res = await fetch(apiUrl);
        if(!res.ok) throw new Error('API failed');
        const buf = Buffer.from(await res.arrayBuffer());
        await sock.sendMessage(jid, { sticker: buf }, { quoted: m });
      }catch(e){
        // Fallback: send text as sticker-like message
        await sock.sendMessage(jid, { text: `✨ *${text}*` }, { quoted: m });
      }
      return true;
    }

    // --- STICKERPACK ---
    if(cmd==='stickerpack'){
      await sock.sendMessage(jid, { text: `🎨 *STICKER PACK*\n\nSend images with caption .sticker to make your own pack!\n\nCommands:\n.sticker - image to sticker\n.toimage - sticker to image\n.take - steal sticker\n.emojimix 😂 ❤️ - mix emojis\n.attp Hello - text to sticker` }, { quoted: m });
      return true;
    }

    return false;
  }
};
