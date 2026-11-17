// 📥 FACELESS - DOWNLOAD PLUGIN - REAL HANDLER

async function fetchJson(url){
  try{
    const res = await fetch(url, { headers: { 'User-Agent':'Mozilla/5.0' } });
    if(!res.ok) return null;
    return await res.json();
  }catch{ return null; }
}
async function fetchBuffer(url){
  try{
    const res = await fetch(url, { headers: { 'User-Agent':'Mozilla/5.0' } });
    if(!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  }catch{ return null; }
}

const COMMANDS = ['ytmp3','ytmp4','yt','play','song','video','tiktok','tiktokdl','igdl','instagram','fbdl','facebook','twitter','xdl','pinterest','pindl','spotify','mediafire','capcut','threads','snapchat','apk','gdrive','terabox','soundcloud'];

module.exports = {
  name: 'download',
  commands: COMMANDS,
  run: async (sock, m, jid, cmd, args, text, isOwner, isGroup, sender) => {
    if(!COMMANDS.includes(cmd)) return false;
    if(!text){ await sock.sendMessage(jid, { text: `Usage: .${cmd} <link or search>\nExample: .${cmd} ${cmd.includes('tiktok')?'https://vm.tiktok.com/...':cmd.includes('ig')?'https://instagram.com/...':cmd.includes('yt')||cmd==='play'||cmd==='song'?'Burna Boy - City Boys':'https://...'}` }, { quoted: m }); return true; }

    // --- YOUTUBE / PLAY / SONG / VIDEO / YTMP3 / YTMP4 / YT ---
    if(['ytmp3','ytmp4','yt','play','song','video'].includes(cmd)){
      await sock.sendMessage(jid, { text: '⏳ Searching YouTube...' }, { quoted: m });
      try{
        // 1. Search YouTube via yt.lemnoslife (free, no key)
        let videoId = null, title = text, thumb = null, channel = '';
        // If user gave link, extract ID
        const idMatch = text.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if(idMatch) videoId = idMatch[1];
        else {
          // Search via invidious / yt search API
          const search = await fetchJson(`https://inv.nadeko.net/api/v1/search?q=${encodeURIComponent(text)}&type=video`);
          const first = Array.isArray(search) ? search[0] : null;
          if(first){ videoId = first.videoId; title = first.title; channel = first.author; thumb = first.videoThumbnails?.[0]?.url; }
          else {
            // Fallback: use YouTube search page via piped
            const piped = await fetchJson(`https://piped.video/api/search?q=${encodeURIComponent(text)}&filter=videos`);
            if(piped?.items?.[0]){ videoId = piped.items[0].url?.split('v=')[1] || piped.items[0].url?.split('/')[2]; title = piped.items[0].title; }
          }
        }
        if(!videoId){ await sock.sendMessage(jid, { text: `❌ Not found on YouTube: ${text}\nTry .song with artist name` }, { quoted: m }); return true; }
        const ytUrl = `https://youtube.com/watch?v=${videoId}`;

        // 2. Download via Cobalt / Vreden API (free)
        // Try Vreden YT API
        const dl = await fetchJson(`https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(ytUrl)}`);
        const dl2 = await fetchJson(`https://api.vreden.my.id/api/ytmp4?url=${encodeURIComponent(ytUrl)}`);
        const isAudio = ['ytmp3','play','song'].includes(cmd);

        if(isAudio){
          const audioUrl = dl?.result?.download?.url || dl?.result?.url || dl?.download?.url;
          if(audioUrl){
            const buf = await fetchBuffer(audioUrl);
            if(buf){ await sock.sendMessage(jid, { audio: buf, mimetype:'audio/mp4', fileName: `${title}.mp3` }, { quoted: m }); await sock.sendMessage(jid, { text: `🎵 *${title}*\n👤 ${channel}\n🔗 ${ytUrl}` }, { quoted: m }); return true; }
          }
          // Fallback: send link
          await sock.sendMessage(jid, { text: `🎵 *${title}*\n\nAudio download failed - server busy.\nListen here: ${ytUrl}\n\nTry again in 1 min` }, { quoted: m });
          return true;
        } else {
          const videoUrl = dl2?.result?.download?.url || dl2?.result?.url || dl2?.download?.url;
          if(videoUrl){
            const buf = await fetchBuffer(videoUrl);
            if(buf && buf.length < 60*1024*1024){ await sock.sendMessage(jid, { video: buf, caption: `🎬 *${title}*\n👤 ${channel}\n🔗 ${ytUrl}` }, { quoted: m }); return true; }
          }
          await sock.sendMessage(jid, { text: `🎬 *${title}*\n\nVideo download failed / too large.\nWatch here: ${ytUrl}` }, { quoted: m });
          return true;
        }
      }catch(e){ await sock.sendMessage(jid, { text: `❌ Download failed: ${e.message}\nTry .song with different name` }, { quoted: m }); return true; }
    }

    // --- TIKTOK ---
    if(cmd==='tiktok' || cmd==='tiktokdl'){
      await sock.sendMessage(jid, { text: '⏳ Downloading TikTok...' }, { quoted: m });
      try{
        const d = await fetchJson(`https://www.tikwm.com/api/?url=${encodeURIComponent(text)}&hd=1`);
        const data = d?.data;
        if(!data){ await sock.sendMessage(jid, { text: '❌ TikTok failed. Send valid TikTok link' }, { quoted: m }); return true; }
        const caption = `🎵 *TikTok - @${data.author?.unique_id||''}*\n\n📝 ${data.title?.slice(0,300)||''}\n❤️ ${data.digg_count} | 💬 ${data.comment_count} | 🔁 ${data.share_count}`;
        // Video no watermark
        const videoUrl = data.play || data.wmplay;
        if(videoUrl){
          const buf = await fetchBuffer(videoUrl);
          if(buf) await sock.sendMessage(jid, { video: buf, caption }, { quoted: m });
          else await sock.sendMessage(jid, { text: caption + `\n\n🔗 ${videoUrl}` }, { quoted: m });
        }
        // Music
        if(data.music){ await sock.sendMessage(jid, { text: `🎵 Music: ${data.music}` }, { quoted: m }); }
        return true;
      }catch(e){ await sock.sendMessage(jid, { text: `❌ TikTok failed: ${e.message}` }, { quoted: m }); return true; }
    }

    // --- INSTAGRAM ---
    if(cmd==='igdl' || cmd==='instagram'){
      await sock.sendMessage(jid, { text: '⏳ Downloading Instagram...' }, { quoted: m });
      try{
        const d = await fetchJson(`https://api.vreden.my.id/api/igdl?url=${encodeURIComponent(text)}`);
        const items = d?.result || d?.data || [];
        const url = Array.isArray(items) ? items[0]?.url : items?.url;
        if(!url){ await sock.sendMessage(jid, { text: '❌ Instagram failed. Link must be public Reel/Post.\nPrivate accounts cannot be downloaded.' }, { quoted: m }); return true; }
        const buf = await fetchBuffer(url);
        if(buf){
          if(url.includes('.mp4')) await sock.sendMessage(jid, { video: buf, caption: '📸 Instagram Downloaded' }, { quoted: m });
          else await sock.sendMessage(jid, { image: buf, caption: '📸 Instagram Downloaded' }, { quoted: m });
        } else await sock.sendMessage(jid, { text: `📸 Link: ${url}` }, { quoted: m });
        return true;
      }catch(e){ await sock.sendMessage(jid, { text: `❌ IG failed: ${e.message}` }, { quoted: m }); return true; }
    }

    // --- FACEBOOK ---
    if(cmd==='fbdl' || cmd==='facebook'){
      await sock.sendMessage(jid, { text: '⏳ Downloading Facebook...' }, { quoted: m });
      try{
        const d = await fetchJson(`https://api.vreden.my.id/api/fbdl?url=${encodeURIComponent(text)}`);
        const url = d?.result?.url || d?.result?.[0]?.url || d?.url;
        if(!url){ await sock.sendMessage(jid, { text: '❌ FB failed. Send public video link.' }, { quoted: m }); return true; }
        const buf = await fetchBuffer(url);
        if(buf) await sock.sendMessage(jid, { video: buf, caption: '📘 Facebook Downloaded' }, { quoted: m });
        else await sock.sendMessage(jid, { text: `📘 Link: ${url}` }, { quoted: m });
        return true;
      }catch(e){ await sock.sendMessage(jid, { text: `❌ FB failed: ${e.message}` }, { quoted: m }); return true; }
    }

    // --- TWITTER / X ---
    if(cmd==='twitter' || cmd==='xdl'){
      await sock.sendMessage(jid, { text: '⏳ Downloading X/Twitter...' }, { quoted: m });
      try{
        const d = await fetchJson(`https://api.vreden.my.id/api/twitter?url=${encodeURIComponent(text)}`);
        const url = d?.result?.url || d?.result?.[0]?.url;
        if(!url){ await sock.sendMessage(jid, { text: '❌ X failed. Send public tweet link.' }, { quoted: m }); return true; }
        const buf = await fetchBuffer(url);
        if(buf) await sock.sendMessage(jid, { video: buf, caption: '🐦 X Downloaded' }, { quoted: m });
        else await sock.sendMessage(jid, { text: `🐦 Link: ${url}` }, { quoted: m });
        return true;
      }catch(e){ await sock.sendMessage(jid, { text: `❌ X failed: ${e.message}` }, { quoted: m }); return true; }
    }

    // --- PINTEREST ---
    if(cmd==='pinterest' || cmd==='pindl'){
      await sock.sendMessage(jid, { text: '⏳ Downloading Pinterest...' }, { quoted: m });
      try{
        const d = await fetchJson(`https://api.vreden.my.id/api/pinterest?url=${encodeURIComponent(text)}`);
        const url = d?.result?.url || d?.result;
        if(!url){ await sock.sendMessage(jid, { text: '❌ Pinterest failed.' }, { quoted: m }); return true; }
        const buf = await fetchBuffer(url);
        if(buf) await sock.sendMessage(jid, { image: buf, caption: '📌 Pinterest Downloaded' }, { quoted: m });
        else await sock.sendMessage(jid, { text: `📌 Link: ${url}` }, { quoted: m });
        return true;
      }catch(e){ await sock.sendMessage(jid, { text: `❌ Pinterest failed: ${e.message}` }, { quoted: m }); return true; }
    }

    // --- SPOTIFY ---
    if(cmd==='spotify'){
      await sock.sendMessage(jid, { text: '⏳ Downloading Spotify...' }, { quoted: m });
      try{
        const d = await fetchJson(`https://api.vreden.my.id/api/spotify?url=${encodeURIComponent(text)}`);
        const url = d?.result?.download || d?.result?.url;
        if(!url){ await sock.sendMessage(jid, { text: '❌ Spotify failed. Send Spotify track link.' }, { quoted: m }); return true; }
        const buf = await fetchBuffer(url);
        if(buf) await sock.sendMessage(jid, { audio: buf, mimetype:'audio/mp4', fileName: `${d.result.title||'spotify'}.mp3` }, { quoted: m });
        else await sock.sendMessage(jid, { text: `🎧 Link: ${url}` }, { quoted: m });
        return true;
      }catch(e){ await sock.sendMessage(jid, { text: `❌ Spotify failed: ${e.message}` }, { quoted: m }); return true; }
    }

    // --- MEDIAFIRE / GDRIVE / TERABOX / CAPCUT / THREADS / SOUNDCLOUD / APK ---
    if(['mediafire','gdrive','terabox','capcut','threads','soundcloud','apk'].includes(cmd)){
      await sock.sendMessage(jid, { text: '⏳ Downloading...' }, { quoted: m });
      try{
        const apiMap = {
          mediafire: `https://api.vreden.my.id/api/mediafire?url=${encodeURIComponent(text)}`,
          gdrive: `https://api.vreden.my.id/api/gdrive?url=${encodeURIComponent(text)}`,
          terabox: `https://api.vreden.my.id/api/terabox?url=${encodeURIComponent(text)}`,
          capcut: `https://api.vreden.my.id/api/capcut?url=${encodeURIComponent(text)}`,
          threads: `https://api.vreden.my.id/api/threads?url=${encodeURIComponent(text)}`,
          soundcloud: `https://api.vreden.my.id/api/soundcloud?url=${encodeURIComponent(text)}`,
          apk: `https://api.vreden.my.id/api/apk?url=${encodeURIComponent(text)}`,
        };
        const d = await fetchJson(apiMap[cmd]);
        const url = d?.result?.download || d?.result?.url || d?.result?.[0]?.url;
        if(!url){ await sock.sendMessage(jid, { text: `❌ ${cmd} failed. Send valid link.` }, { quoted: m }); return true; }
        await sock.sendMessage(jid, { text: `✅ *${cmd.toUpperCase()}*\n\nTitle: ${d.result?.title||d.result?.name||'File'}\nSize: ${d.result?.size||'Unknown'}\n\n🔗 Download: ${url}` }, { quoted: m });
        return true;
      }catch(e){ await sock.sendMessage(jid, { text: `❌ Failed: ${e.message}` }, { quoted: m }); return true; }
    }

    // --- SNAPCHAT ---
    if(cmd==='snapchat'){
      await sock.sendMessage(jid, { text: '❌ Snapchat download not supported - Snapchat blocks downloads.\nAsk sender to save and send directly.' }, { quoted: m });
      return true;
    }

    return false;
  }
};
