// 🌸 FACELESS - ANIME PLUGIN - SFW ONLY
// Uses waifu.pics SFW API - safe for groups

async function getWaifu(category){
  try{
    const res = await fetch(`https://api.waifu.pics/sfw/${category}`);
    const d = await res.json();
    return d?.url || null;
  }catch{ return null; }
}
async function getNeko(){
  try{
    const res = await fetch(`https://nekos.life/api/v2/img/neko`);
    const d = await res.json();
    return d?.url || null;
  }catch{ return null; }
}

const SFW_CATS = ['waifu','neko','shinobu','megumin','bully','cuddle','cry','hug','awoo','kiss','lick','pat','smug','bonk','yeet','blush','smile','wave','highfive','handhold','nom','bite','glomp','slap','kill','kick','happy','wink','poke','dance','cringe'];
const COMMANDS = ['anime','waifu','neko','husbando','shinobu','megumin','hug','kiss','pat','slap','cuddle','blush','smile','wave','dance','poke','wink','happy','cry','kill','kick','bite','nom','bonk','yeet','highfive','handhold','glomp','smug','awoo','animequote','animesearch','character','manga','animenews','cosplay','wallpaper','animepic','neko2'];

module.exports = {
  name: 'anime',
  commands: COMMANDS,
  run: async (sock, m, jid, cmd, args, text, isOwner, isGroup, sender) => {
    if(!COMMANDS.includes(cmd)) return false;

    // --- ANIME QUOTE ---
    if(cmd==='animequote'){
      try{
        const res = await fetch('https://animechan.xyz/api/random');
        const d = await res.json();
        await sock.sendMessage(jid, { text: `💬 *ANIME QUOTE*\n\n"${d.quote}"\n\n- ${d.character} (${d.anime})` }, { quoted: m });
      }catch{ await sock.sendMessage(jid, { text: `💬 *ANIME QUOTE*\n\n"Believe it!" - Naruto Uzumaki (Naruto)` }, { quoted: m }); }
      return true;
    }

    // --- ANIME SEARCH ---
    if(cmd==='animesearch' || cmd==='anime'){
      if(!text && cmd==='animesearch'){ await sock.sendMessage(jid, { text: 'Usage: .animesearch Naruto' }, { quoted: m }); return true; }
      if(!text){
        // Random waifu if just .anime
        const url = await getWaifu('waifu');
        if(url) await sock.sendMessage(jid, { image: { url }, caption: '🌸 Random Waifu' }, { quoted: m });
        return true;
      }
      try{
        const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(text)}&limit=1`);
        const d = await res.json();
        const a = d?.data?.[0];
        if(!a){ await sock.sendMessage(jid, { text: `❌ Anime not found: ${text}` }, { quoted: m }); return true; }
        const caption = `🌸 *${a.title}*\n\n⭐ Score: ${a.score||'N/A'} | 📺 Episodes: ${a.episodes||'?'}\n📅 Year: ${a.year||'?'}\n🎭 Genres: ${a.genres?.map(g=>g.name).join(', ')||'N/A'}\n🏢 Studio: ${a.studios?.[0]?.name||'N/A'}\n\n📖 ${a.synopsis?.slice(0,400)||'No synopsis'}...`;
        if(a.images?.jpg?.image_url) await sock.sendMessage(jid, { image: { url: a.images.jpg.image_url }, caption }, { quoted: m });
        else await sock.sendMessage(jid, { text: caption }, { quoted: m });
      }catch(e){ await sock.sendMessage(jid, { text: `❌ Search failed: ${e.message}` }, { quoted: m }); }
      return true;
    }

    // --- CHARACTER ---
    if(cmd==='character'){
      if(!text){ await sock.sendMessage(jid, { text: 'Usage: .character Naruto' }, { quoted: m }); return true; }
      try{
        const res = await fetch(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(text)}&limit=1`);
        const d = await res.json();
        const c = d?.data?.[0];
        if(!c){ await sock.sendMessage(jid, { text: `❌ Character not found: ${text}` }, { quoted: m }); return true; }
        const caption = `👤 *${c.name}*\n\n❤️ Favorites: ${c.favorites||0}\n📖 ${c.about?.slice(0,400)||'No info'}...`;
        if(c.images?.jpg?.image_url) await sock.sendMessage(jid, { image: { url: c.images.jpg.image_url }, caption }, { quoted: m });
        else await sock.sendMessage(jid, { text: caption }, { quoted: m });
      }catch(e){ await sock.sendMessage(jid, { text: `❌ Failed` }, { quoted: m }); }
      return true;
    }

    // --- MANGA ---
    if(cmd==='manga'){
      if(!text){ await sock.sendMessage(jid, { text: 'Usage: .manga One Piece' }, { quoted: m }); return true; }
      try{
        const res = await fetch(`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(text)}&limit=1`);
        const d = await res.json();
        const a = d?.data?.[0];
        if(!a){ await sock.sendMessage(jid, { text: `❌ Manga not found` }, { quoted: m }); return true; }
        await sock.sendMessage(jid, { text: `📚 *${a.title}*\n\n⭐ Score: ${a.score}\n📖 Chapters: ${a.chapters||'?'}\n📅 ${a.published?.string||''}\n\n${a.synopsis?.slice(0,400)||''}` }, { quoted: m });
      }catch{ await sock.sendMessage(jid, { text: '❌ Manga search failed' }, { quoted: m }); }
      return true;
    }

    // --- WALLPAPER / COSPLAY / ANIMEPIC ---
    if(['wallpaper','cosplay','animepic'].includes(cmd)){
      const url = await getWaifu('waifu');
      if(url) await sock.sendMessage(jid, { image: { url }, caption: `🌸 *${cmd.toUpperCase()}*\nUse as wallpaper!` }, { quoted: m });
      else await sock.sendMessage(jid, { text: '❌ Failed, try again' }, { quoted: m });
      return true;
    }

    // --- WAIFU / NEKO / HUSBANDO ---
    if(cmd==='waifu'){
      const url = await getWaifu('waifu');
      if(url) await sock.sendMessage(jid, { image: { url }, caption: '🌸 Your Waifu 💖' }, { quoted: m });
      return true;
    }
    if(cmd==='neko' || cmd==='neko2'){
      const url = await getNeko();
      if(url) await sock.sendMessage(jid, { image: { url }, caption: '🐱 Neko!' }, { quoted: m });
      return true;
    }
    if(cmd==='husbando'){
      // Use waifu API - husbando not in waifu.pics, use random male anime via Jikan
      await sock.sendMessage(jid, { text: '😍 Husbando feature: Try .waifu for now, or .character Levi' }, { quoted: m });
      return true;
    }
    if(cmd==='shinobu' || cmd==='megumin'){
      const url = await getWaifu(cmd);
      if(url) await sock.sendMessage(jid, { image: { url }, caption: `🌸 ${cmd}` }, { quoted: m });
      return true;
    }

    // --- REACTION GIFS - hug, kiss, pat, etc - needs target ---
    if(SFW_CATS.includes(cmd)){
      const target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || m.message?.extendedTextMessage?.contextInfo?.participant;
      const url = await getWaifu(SFW_CATS.includes(cmd) ? cmd : 'hug');
      const mentionText = target ? `@${sender.split('@')[0]} ${cmd}s @${target.split('@')[0]}` : `@${sender.split('@')[0]} ${cmd}s`;
      const mentions = target ? [sender, target] : [sender];
      if(url){
        // waifu.pics returns image, send as image (not sticker to keep quality)
        await sock.sendMessage(jid, { image: { url }, caption: `💖 ${mentionText}`, mentions }, { quoted: m });
      } else {
        await sock.sendMessage(jid, { text: `💖 ${mentionText}`, mentions }, { quoted: m });
      }
      return true;
    }

    if(cmd==='animenews'){
      await sock.sendMessage(jid, { text: `📰 *ANIME NEWS*\n\nUse .animesearch <name> to get latest info\nTop Anime 2026:\n1. Solo Leveling\n2. Jujutsu Kaisen\n3. Demon Slayer\n4. One Piece\n5. Frieren` }, { quoted: m });
      return true;
    }

    return false;
  }
};
