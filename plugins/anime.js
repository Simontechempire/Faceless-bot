const { facelessReply, sendAwait } = require('../lib/function');
const axios = require('axios');

module.exports = {
  name: "anime",
  async run(sock, m, jid, cmd, args, text, isOwner, isGroup, sender){

    const animeCmds = ['waifu','neko','husbando','anime','manga','character','aniquote','shinobu','megumin','bully','hug','kiss','slap','pat','cry','dance'];
    if(!animeCmds.includes(cmd)) return false;

    // ================= WAIFU / NEKO / HUSBANDO - REAL waifu.pics API =================
    if(['waifu','neko','husbando','shinobu','megumin'].includes(cmd)){
      await sendAwait(sock, jid, m);
      const type = cmd === 'neko' ? 'neko' : cmd === 'husbando' ? 'husbando' : 'waifu';
      try{
        const res = await axios.get(`https://api.waifu.pics/sfw/${type}`);
        const url = res.data?.url;
        if(!url) throw new Error("No image");
        await sock.sendMessage(jid, { image: { url }, caption: `▫️ 💀 ${cmd.toUpperCase()}` }, { quoted: m });
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= ANIME SEARCH - REAL Jikan API =================
    if(cmd === 'anime'){
      await sendAwait(sock, jid, m);
      if(!text){ await facelessReply(sock, jid, "Usage: .anime <name e.g Naruto>", m); return true; }
      try{
        const res = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(text)}&limit=1`);
        const a = res.data?.data?.[0];
        if(!a){ await facelessReply(sock, jid, "Anime Not Found", m); return true; }
        const caption = `▫️ 💀 ${a.title}\n\nTitle JP: ${a.title_japanese || 'N/A'}\nType: ${a.type} | Episodes: ${a.episodes || 'N/A'}\nScore: ${a.score || 'N/A'} | Rank: ${a.rank || 'N/A'}\nStatus: ${a.status}\nGenres: ${a.genres?.map(g=>g.name).join(', ') || 'N/A'}\n\nSynopsis: ${(a.synopsis || '').slice(0,400)}`;
        const img = a.images?.jpg?.large_image_url;
        if(img) await sock.sendMessage(jid, { image: { url: img }, caption }, { quoted: m });
        else await facelessReply(sock, jid, caption, m);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= MANGA - REAL Jikan =================
    if(cmd === 'manga'){
      await sendAwait(sock, jid, m);
      if(!text){ await facelessReply(sock, jid, "Usage: .manga <name>", m); return true; }
      try{
        const res = await axios.get(`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(text)}&limit=1`);
        const a = res.data?.data?.[0];
        if(!a){ await facelessReply(sock, jid, "Manga Not Found", m); return true; }
        const caption = `▫️ 💀 ${a.title}\n\nChapters: ${a.chapters || 'N/A'} | Volumes: ${a.volumes || 'N/A'}\nScore: ${a.score || 'N/A'}\nStatus: ${a.status}\nGenres: ${a.genres?.map(g=>g.name).join(', ') || 'N/A'}\n\nSynopsis: ${(a.synopsis || '').slice(0,400)}`;
        const img = a.images?.jpg?.large_image_url;
        if(img) await sock.sendMessage(jid, { image: { url: img }, caption }, { quoted: m });
        else await facelessReply(sock, jid, caption, m);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= CHARACTER - REAL Jikan =================
    if(cmd === 'character'){
      await sendAwait(sock, jid, m);
      if(!text){ await facelessReply(sock, jid, "Usage: .character <name e.g Naruto>", m); return true; }
      try{
        const res = await axios.get(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(text)}&limit=1`);
        const c = res.data?.data?.[0];
        if(!c){ await facelessReply(sock, jid, "Character Not Found", m); return true; }
        const caption = `▫️ 💀 ${c.name}\nName Kanji: ${c.name_kanji || 'N/A'}\nFavorites: ${c.favorites}\n\nAbout: ${(c.about || '').slice(0,400)}`;
        const img = c.images?.jpg?.image_url;
        if(img) await sock.sendMessage(jid, { image: { url: img }, caption }, { quoted: m });
        else await facelessReply(sock, jid, caption, m);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= ANIME QUOTE - REAL animechan API =================
    if(cmd === 'aniquote'){
      await sendAwait(sock, jid, m);
      try{
        const res = await axios.get('https://api.animechan.io/v1/quotes/random');
        const q = res.data?.data;
        await facelessReply(sock, jid, `Anime Quote:\n"${q.content}"\n- ${q.character.name} (${q.anime.name})`, m);
      }catch{
        await facelessReply(sock, jid, `Anime Quote:\n"Believe it!"\n- Naruto Uzumaki (Naruto)`, m);
      }
      return true;
    }

    // ================= REACTION GIFS - REAL waifu.pics =================
    if(['bully','hug','kiss','slap','pat','cry','dance'].includes(cmd)){
      await sendAwait(sock, jid, m);
      const ctx = m.message?.extendedTextMessage?.contextInfo;
      const target = ctx?.mentionedJid?.[0] || sender;
      try{
        const res = await axios.get(`https://api.waifu.pics/sfw/${cmd}`);
        const url = res.data?.url;
        // waifu.pics returns gif for these
        await sock.sendMessage(jid, {
          video: { url },
          gifPlayback: true,
          caption: `▫️ 💀 @${sender.split('@')[0]} ${cmd} @${target.split('@')[0]}`,
          mentions: [sender, target]
        }, { quoted: m });
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    return false;
  }
};
