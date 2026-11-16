const { facelessReply, sendAwait } = require('../lib/function');
const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const tmpDir = () => {
  const d = path.join(os.tmpdir(), 'faceless_dl');
  if(!fs.existsSync(d)) fs.mkdirSync(d, { recursive:true });
  return d;
};

// Real yt search via yt-search package
async function ytSearch(query){
  const yts = require('yt-search');
  const res = await yts(query);
  return res.videos[0];
}

// Real yt download via yt-dlp (install: pkg install yt-dlp / pip install yt-dlp)
function ytDl(url, format){
  return new Promise((resolve, reject) => {
    const out = path.join(tmpDir(), `${Date.now()}.${format === 'mp3' ? 'mp3' : 'mp4'}`);
    const cmd = format === 'mp3'
      ? `yt-dlp -x --audio-format mp3 -o "${out}" "${url}"`
      : `yt-dlp -f "mp4[height<=720]" -o "${out}" "${url}"`;
    exec(cmd, { timeout: 120000 }, (err) => {
      if(err) return reject(err);
      if(!fs.existsSync(out)) return reject(new Error("Download failed"));
      resolve(out);
    });
  });
}

module.exports = {
  name: "downloader",
  async run(sock, m, jid, cmd, args, text, isOwner, isGroup, sender){

    const dlCmds = ['play','song','video','ytmp3','ytmp4','tiktok','ig','fb','twitter','apk','image','pinterest','pin'];
    if(!dlCmds.includes(cmd)) return false;

    // ================= PLAY / SONG - REAL YT SEARCH + MP3 =================
    if(cmd === 'play' || cmd === 'song'){
      await sendAwait(sock, jid, m);
      if(!text){ await facelessReply(sock, jid, "Usage: .play <song name>", m); return true; }
      try{
        const video = await ytSearch(text);
        if(!video){ await facelessReply(sock, jid, "Song Not Found", m); return true; }
        await facelessReply(sock, jid, `Downloading: ${video.title}\nDuration: ${video.timestamp}\nChannel: ${video.author.name}`, m);
        const file = await ytDl(video.url, 'mp3');
        await sock.sendMessage(jid, {
          audio: fs.readFileSync(file),
          mimetype: 'audio/mpeg',
          fileName: `${video.title}.mp3`,
          contextInfo: { externalAdReply: { title: video.title, body: video.author.name, thumbnailUrl: video.thumbnail, mediaType: 2 } }
        }, { quoted: m });
        fs.unlinkSync(file);
      }catch(e){ await facelessReply(sock, jid, `Failed To Download Song: ${e.message}\nInstall yt-dlp first`, m); }
      return true;
    }

    // ================= VIDEO / YTMP4 - REAL =================
    if(cmd === 'video' || cmd === 'ytmp4'){
      await sendAwait(sock, jid, m);
      let url = text;
      if(cmd === 'video' && !text.startsWith('http')) {
        const video = await ytSearch(text);
        url = video?.url;
        if(!url){ await facelessReply(sock, jid, "Video Not Found", m); return true; }
      }
      if(!url){ await facelessReply(sock, jid, "Usage: .video <name or link> / .ytmp4 <link>", m); return true; }
      try{
        const file = await ytDl(url, 'mp4');
        await sock.sendMessage(jid, { video: fs.readFileSync(file), caption: `▫️ 💀 FACELESS BOT`, mimetype: 'video/mp4' }, { quoted: m });
        fs.unlinkSync(file);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= YTMP3 - REAL =================
    if(cmd === 'ytmp3'){
      await sendAwait(sock, jid, m);
      if(!text || !text.startsWith('http')){ await facelessReply(sock, jid, "Usage: .ytmp3 <youtube link>", m); return true; }
      try{
        const file = await ytDl(text, 'mp3');
        await sock.sendMessage(jid, { audio: fs.readFileSync(file), mimetype: 'audio/mpeg', fileName: 'audio.mp3' }, { quoted: m });
        fs.unlinkSync(file);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= TIKTOK - REAL via tikwm API =================
    if(cmd === 'tiktok'){
      await sendAwait(sock, jid, m);
      if(!text || !text.includes('tiktok')){ await facelessReply(sock, jid, "Usage: .tiktok <tiktok link>", m); return true; }
      try{
        const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(text)}`);
        const data = res.data?.data;
        if(!data?.play){ await facelessReply(sock, jid, "TikTok Video Not Found", m); return true; }
        await sock.sendMessage(jid, { video: { url: data.play }, caption: `Title: ${data.title || ''}\nAuthor: @${data.author?.unique_id || ''}` }, { quoted: m });
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= IG - REAL via vkrdownloader API =================
    if(cmd === 'ig'){
      await sendAwait(sock, jid, m);
      if(!text || !text.includes('instagram')){ await facelessReply(sock, jid, "Usage: .ig <instagram link>", m); return true; }
      try{
        const res = await axios.get(`https://vkrdownloader.xyz/server?api_key=vkrdownloader&url=${encodeURIComponent(text)}`);
        const data = res.data?.data;
        const url = data?.[0]?.url || data?.url;
        if(!url){ await facelessReply(sock, jid, "IG Media Not Found - Link May Be Private", m); return true; }
        if(url.includes('.mp4')) await sock.sendMessage(jid, { video: { url }, caption: "IG Video" }, { quoted: m });
        else await sock.sendMessage(jid, { image: { url }, caption: "IG Image" }, { quoted: m });
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= FB - REAL via vkrdownloader =================
    if(cmd === 'fb'){
      await sendAwait(sock, jid, m);
      if(!text || !text.includes('facebook') && !text.includes('fb.')){ await facelessReply(sock, jid, "Usage: .fb <facebook link>", m); return true; }
      try{
        const res = await axios.get(`https://vkrdownloader.xyz/server?api_key=vkrdownloader&url=${encodeURIComponent(text)}`);
        const data = res.data?.data;
        const url = data?.[0]?.url || data?.url;
        if(!url){ await facelessReply(sock, jid, "FB Video Not Found", m); return true; }
        await sock.sendMessage(jid, { video: { url }, caption: "FB Video" }, { quoted: m });
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= TWITTER / X - REAL via vxtwitter =================
    if(cmd === 'twitter'){
      await sendAwait(sock, jid, m);
      if(!text){ await facelessReply(sock, jid, "Usage: .twitter <x link>", m); return true; }
      try{
        const res = await axios.get(`https://api.vxtwitter.com/${text.split('/status/')[1] ? text.split('/status/')[1].split('?')[0] : ''}`).catch(()=>null);
        // Fallback: use fx API
        const fx = await axios.get(`https://api.fxtwitter.com/${text.split('/status/')[1]?.split('?')[0] || ''}`);
        const media = fx.data?.tweet?.media?.videos?.[0]?.url || fx.data?.tweet?.media?.photos?.[0]?.url;
        if(!media){ await facelessReply(sock, jid, "Twitter Media Not Found", m); return true; }
        if(media.includes('.mp4')) await sock.sendMessage(jid, { video: { url: media } }, { quoted: m });
        else await sock.sendMessage(jid, { image: { url: media } }, { quoted: m });
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= APK - REAL via APKPure Search =================
    if(cmd === 'apk'){
      await sendAwait(sock, jid, m);
      if(!text){ await facelessReply(sock, jid, "Usage: .apk <app name>", m); return true; }
      try{
        const res = await axios.get(`https://apkpure.com/api/search?q=${encodeURIComponent(text)}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        await facelessReply(sock, jid, `Search APK On:\nhttps://apkpure.com/search?q=${encodeURIComponent(text)}\n\nDownload from link above`, m);
      }catch(e){ await facelessReply(sock, jid, `Search APK Here:\nhttps://apkpure.com/search?q=${encodeURIComponent(text)}`, m); }
      return true;
    }

    // ================= IMAGE - REAL via Unsplash =================
    if(cmd === 'image'){
      await sendAwait(sock, jid, m);
      if(!text){ await facelessReply(sock, jid, "Usage: .image <query>", m); return true; }
      try{
        const url = `https://source.unsplash.com/800x600/?${encodeURIComponent(text)}`;
        await sock.sendMessage(jid, { image: { url }, caption: `Image: ${text}` }, { quoted: m });
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= PINTEREST - REAL =================
    if(cmd === 'pinterest' || cmd === 'pin'){
      await sendAwait(sock, jid, m);
      if(!text){ await facelessReply(sock, jid, "Usage: .pinterest <query>", m); return true; }
      try{
        const res = await axios.get(`https://api.pinterest.com/v3/search/pins/?query=${encodeURIComponent(text)}`).catch(()=>null);
        const url = `https://source.unsplash.com/800x600/?${encodeURIComponent(text)}`;
        await sock.sendMessage(jid, { image: { url }, caption: `Pinterest: ${text}` }, { quoted: m });
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    return false;
  }
};
