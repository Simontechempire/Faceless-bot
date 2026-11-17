// 🔍 FACELESS - SEARCH PLUGIN - REAL HANDLER
// Uses free public APIs - no API key needed

async function fetchJson(url, headers={}){
  try{
    const res = await fetch(url, { headers: { 'User-Agent':'Mozilla/5.0', ...headers } });
    if(!res.ok) return null;
    return await res.json();
  }catch{ return null; }
}
function cleanHtml(s){ return (s||'').replace(/<[^>]*>/g,'').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&'); }

const COMMANDS = ['google','youtube','wikipedia','wiki','image','images','pinterest','lyrics','song','movie','anime','weather','news','definition','meaning','translate','currency','crypto','stock','github','npm','playstore','tiktoksearch','igsearch','recipe','jokeapi','cat','dog'];

module.exports = {
  name: 'search',
  commands: COMMANDS,
  run: async (sock, m, jid, cmd, args, text, isOwner, isGroup, sender) => {
    if(!COMMANDS.includes(cmd)) return false;
    if(!text && !['cat','dog','jokeapi'].includes(cmd)){
      await sock.sendMessage(jid, { text: `Usage: .${cmd} <search query>\nExample: .${cmd} ${cmd==='weather'?'Lagos':cmd==='crypto'?'bitcoin':cmd==='translate'?'hello':cmd==='movie'?'Avatar':'Nigeria'}` }, { quoted: m });
      return true;
    }
    const q = encodeURIComponent(text);

    // --- WIKIPEDIA / WIKI ---
    if(cmd==='wikipedia' || cmd==='wiki'){
      const d = await fetchJson(`https://en.wikipedia.org/api/rest_v1/page/summary/${q}`);
      if(!d || d.type==='disambiguation'){ await sock.sendMessage(jid, { text: `❌ No Wikipedia result for: ${text}` }, { quoted: m }); return true; }
      let msg = `📚 *WIKIPEDIA - ${d.title}*\n\n${d.extract?.slice(0,1000)||'No description'}\n\n🔗 ${d.content_urls?.desktop?.page||''}`;
      await sock.sendMessage(jid, { text: msg }, { quoted: m });
      if(d.thumbnail?.source) await sock.sendMessage(jid, { image: { url: d.thumbnail.source }, caption: d.title }, { quoted: m });
      return true;
    }

    // --- WEATHER - Open-Meteo (free, no key) ---
    if(cmd==='weather'){
      const geo = await fetchJson(`https://geocoding-api.open-meteo.com/v1/search?name=${q}&count=1`);
      if(!geo?.results?.length){ await sock.sendMessage(jid, { text: `❌ City not found: ${text}` }, { quoted: m }); return true; }
      const c = geo.results[0];
      const w = await fetchJson(`https://api.open-meteo.com/v1/forecast?latitude=${c.latitude}&longitude=${c.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m&timezone=auto`);
      const cur = w?.current;
      await sock.sendMessage(jid, { text: `🌤️ *WEATHER - ${c.name}, ${c.country}*\n\n🌡️ Temp: ${cur.temperature_2m}°C (Feels: ${cur.apparent_temperature}°C)\n💧 Humidity: ${cur.relative_humidity_2m}%\n🌧️ Rain: ${cur.precipitation} mm\n💨 Wind: ${cur.wind_speed_10m} km/h\n🕐 Time: ${cur.time}` }, { quoted: m });
      return true;
    }

    // --- CRYPTO - CoinGecko ---
    if(cmd==='crypto'){
      const d = await fetchJson(`https://api.coingecko.com/api/v3/simple/price?ids=${q.toLowerCase()}&vs_currencies=usd,ngn&include_24hr_change=true`);
      const coin = d?.[text.toLowerCase()];
      if(!coin){ await sock.sendMessage(jid, { text: `❌ Crypto not found. Try: bitcoin, ethereum, solana, dogecoin` }, { quoted: m }); return true; }
      await sock.sendMessage(jid, { text: `🪙 *CRYPTO - ${text.toUpperCase()}*\n\n💵 USD: $${coin.usd?.toLocaleString()}\n🇳🇬 NGN: ₦${coin.ngn?.toLocaleString()}\n📈 24h Change: ${coin.usd_24h_change?.toFixed(2)}%` }, { quoted: m });
      return true;
    }

    // --- CURRENCY - exchangerate.host ---
    if(cmd==='currency'){
      // .currency 100 USD to NGN  OR  .currency USD NGN
      const parts = text.toUpperCase().split(/\s+/);
      let amount = 1, from='USD', to='NGN';
      if(parts.length>=3){ amount = parseFloat(parts[0])||1; from = parts[1]; to = parts[3]||parts[2]; }
      else if(parts.length===2){ from=parts[0]; to=parts[1]; }
      const d = await fetchJson(`https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`);
      if(!d?.result){ await sock.sendMessage(jid, { text: `❌ Currency failed. Usage: .currency 100 USD to NGN` }, { quoted: m }); return true; }
      await sock.sendMessage(jid, { text: `💱 *CURRENCY*\n\n${amount} ${from} = ${d.result.toFixed(2)} ${to}\nRate: 1 ${from} = ${d.info?.rate?.toFixed(2)} ${to}` }, { quoted: m });
      return true;
    }

    // --- DEFINITION / MEANING - dictionaryapi ---
    if(cmd==='definition' || cmd==='meaning'){
      const word = text.split(' ')[0].toLowerCase();
      const d = await fetchJson(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if(!d || !Array.isArray(d)){ await sock.sendMessage(jid, { text: `❌ No definition for: ${word}` }, { quoted: m }); return true; }
      const e = d[0];
      const def = e.meanings?.[0]?.definitions?.[0];
      await sock.sendMessage(jid, { text: `📖 *DEFINITION - ${word.toUpperCase()}*\n\nPronunciation: ${e.phonetic||''}\nPart of speech: ${e.meanings?.[0]?.partOfSpeech||''}\n\nMeaning: ${def?.definition||''}\nExample: ${def?.example||'No example'}\nSynonyms: ${e.meanings?.[0]?.synonyms?.slice(0,3).join(', ')||'None'}` }, { quoted: m });
      return true;
    }

    // --- TRANSLATE - MyMemory free ---
    if(cmd==='translate'){
      // .translate en|fr hello  OR .translate fr hello (to French)
      let to='en', query=text;
      const m1 = text.match(/^([a-z]{2})\|(.+)/i);
      if(m1){ to=m1[1]; query=m1[2].trim(); }
      else {
        const parts = text.split(' ');
        if(parts.length>1 && /^[a-z]{2}$/.test(parts[0])){ to=parts[0]; query=parts.slice(1).join(' '); }
      }
      const d = await fetchJson(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(query)}&langpair=auto|${to}`);
      const trans = d?.responseData?.translatedText;
      if(!trans){ await sock.sendMessage(jid, { text: `❌ Translate failed` }, { quoted: m }); return true; }
      await sock.sendMessage(jid, { text: `🌍 *TRANSLATE to ${to.toUpperCase()}*\n\nOriginal: ${query}\nTranslated: ${trans}` }, { quoted: m });
      return true;
    }

    // --- GITHUB ---
    if(cmd==='github'){
      const user = text.split(' ')[0];
      const d = await fetchJson(`https://api.github.com/users/${user}`);
      if(!d || d.message==='Not Found'){ await sock.sendMessage(jid, { text: `❌ GitHub user not found: ${user}` }, { quoted: m }); return true; }
      await sock.sendMessage(jid, { text: `🐙 *GITHUB - ${d.login}*\n\n👤 Name: ${d.name||'N/A'}\n📝 Bio: ${d.bio||'N/A'}\n📍 Location: ${d.location||'N/A'}\n👥 Followers: ${d.followers} | Following: ${d.following}\n📦 Repos: ${d.public_repos}\n🔗 ${d.html_url}` }, { quoted: m });
      if(d.avatar_url) await sock.sendMessage(jid, { image: { url: d.avatar_url }, caption: d.login }, { quoted: m });
      return true;
    }

    // --- NPM ---
    if(cmd==='npm'){
      const pkg = text.split(' ')[0].toLowerCase();
      const d = await fetchJson(`https://registry.npmjs.org/${pkg}/latest`);
      if(!d || d.error){ await sock.sendMessage(jid, { text: `❌ NPM package not found: ${pkg}` }, { quoted: m }); return true; }
      await sock.sendMessage(jid, { text: `📦 *NPM - ${d.name}*\n\nVersion: ${d.version}\nDesc: ${d.description||'No description'}\nAuthor: ${d.author?.name||'N/A'}\nLicense: ${d.license||'N/A'}\nHomepage: ${d.homepage||''}\n\nInstall: npm i ${d.name}` }, { quoted: m });
      return true;
    }

    // --- MOVIE - OMDB needs key, use TMDB search via Wikipedia fallback + iTunes ---
    if(cmd==='movie'){
      const d = await fetchJson(`https://itunes.apple.com/search?term=${q}&media=movie&limit=1`);
      const r = d?.results?.[0];
      if(!r){ await sock.sendMessage(jid, { text: `❌ Movie not found: ${text}` }, { quoted: m }); return true; }
      await sock.sendMessage(jid, { text: `🎬 *MOVIE - ${r.trackName}*\n\n🎭 Genre: ${r.primaryGenreName}\n📅 Release: ${r.releaseDate?.slice(0,10)}\n💰 Price: $${r.trackPrice}\n📝 ${cleanHtml(r.longDescription||r.shortDescription||'').slice(0,800)}\n\n▶️ Preview: ${r.previewUrl||''}` }, { quoted: m });
      if(r.artworkUrl100) await sock.sendMessage(jid, { image: { url: r.artworkUrl100.replace('100x100','600x600') }, caption: r.trackName }, { quoted: m });
      return true;
    }

    // --- SONG / LYRICS - iTunes + LRCLIB ---
    if(cmd==='song'){
      const d = await fetchJson(`https://itunes.apple.com/search?term=${q}&media=music&limit=1`);
      const r = d?.results?.[0];
      if(!r){ await sock.sendMessage(jid, { text: `❌ Song not found: ${text}` }, { quoted: m }); return true; }
      await sock.sendMessage(jid, { text: `🎵 *SONG - ${r.trackName}*\n\n👤 Artist: ${r.artistName}\n💿 Album: ${r.collectionName}\n🎭 Genre: ${r.primaryGenreName}\n⏱️ Duration: ${Math.floor(r.trackTimeMillis/60000)}:${String(Math.floor((r.trackTimeMillis%60000)/1000)).padStart(2,'0')}\n💰 Price: $${r.trackPrice}\n\n▶️ Preview: ${r.previewUrl}` }, { quoted: m });
      if(r.artworkUrl100) await sock.sendMessage(jid, { image: { url: r.artworkUrl100.replace('100x100','600x600') }, caption: r.trackName }, { quoted: m });
      return true;
    }
    if(cmd==='lyrics'){
      const d = await fetchJson(`https://lrclib.net/api/get?track_name=${q}&artist_name=`);
      // lrclib needs track+artist, try search API
      const s = await fetchJson(`https://lrclib.net/api/search?track_name=${q}`);
      const r = s?.[0];
      if(!r?.plainLyrics){ await sock.sendMessage(jid, { text: `❌ Lyrics not found for: ${text}\nTry: .lyrics Song Name - Artist` }, { quoted: m }); return true; }
      await sock.sendMessage(jid, { text: `🎤 *LYRICS - ${r.trackName} - ${r.artistName}*\n\n${r.plainLyrics.slice(0,3000)}` }, { quoted: m });
      return true;
    }

    // --- ANIME - Jikan ---
    if(cmd==='anime'){
      const d = await fetchJson(`https://api.jikan.moe/v4/anime?q=${q}&limit=1`);
      const a = d?.data?.[0];
      if(!a){ await sock.sendMessage(jid, { text: `❌ Anime not found: ${text}` }, { quoted: m }); return true; }
      await sock.sendMessage(jid, { text: `🎌 *ANIME - ${a.title}*\n\n⭐ Score: ${a.score||'N/A'} | Episodes: ${a.episodes||'?'}\n📅 ${a.aired?.string||''}\n🎭 ${a.genres?.map(g=>g.name).join(', ')}\n\n📝 ${cleanHtml(a.synopsis||'').slice(0,800)}` }, { quoted: m });
      if(a.images?.jpg?.image_url) await sock.sendMessage(jid, { image: { url: a.images.jpg.image_url }, caption: a.title }, { quoted: m });
      return true;
    }

    // --- CAT / DOG - random images ---
    if(cmd==='cat'){ await sock.sendMessage(jid, { image: { url: `https://cataas.com/cat?${Date.now()}` }, caption: '🐱 Random Cat' }, { quoted: m }); return true; }
    if(cmd==='dog'){
      const d = await fetchJson(`https://dog.ceo/api/breeds/image/random`);
      if(d?.message) await sock.sendMessage(jid, { image: { url: d.message }, caption: '🐶 Random Dog' }, { quoted: m });
      return true;
    }
    if(cmd==='jokeapi'){
      const d = await fetchJson(`https://official-joke-api.appspot.com/random_joke`);
      await sock.sendMessage(jid, { text: `😂 *JOKE*\n\n${d?.setup}\n${d?.punchline}` }, { quoted: m });
      return true;
    }

    // --- RECIPE - TheMealDB ---
    if(cmd==='recipe'){
      const d = await fetchJson(`https://www.themealdb.com/api/json/v1/1/search.php?s=${q}`);
      const meal = d?.meals?.[0];
      if(!meal){ await sock.sendMessage(jid, { text: `❌ Recipe not found: ${text}` }, { quoted: m }); return true; }
      const ingredients = [];
      for(let i=1;i<=20;i++){ const ing=meal[`strIngredient${i}`], meas=meal[`strMeasure${i}`]; if(ing) ingredients.push(`${meas} ${ing}`); }
      await sock.sendMessage(jid, { text: `🍲 *RECIPE - ${meal.strMeal}*\n\n🌍 ${meal.strArea} | ${meal.strCategory}\n\n🧂 Ingredients:\n${ingredients.slice(0,10).join('\n')}\n\n📝 ${meal.strInstructions.slice(0,800)}\n\n▶️ ${meal.strYoutube||''}` }, { quoted: m });
      if(meal.strMealThumb) await sock.sendMessage(jid, { image: { url: meal.strMealThumb }, caption: meal.strMeal }, { quoted: m });
      return true;
    }

    // --- GOOGLE / YOUTUBE / IMAGE / PINTEREST / NEWS / PLAYSTORE / TIKTOK / IGSEARCH / STOCK ---
    if(['google','youtube','image','images','pinterest','news','playstore','tiktoksearch','igsearch','stock'].includes(cmd)){
      // No API key - give real search links + DuckDuckGo instant answer
      const ddg = await fetchJson(`https://api.duckduckgo.com/?q=${q}&format=json&no_html=1&skip_disambig=1`);
      const abstract = ddg?.AbstractText || ddg?.Answer || '';
      const links = {
        google: `https://www.google.com/search?q=${q}`,
        youtube: `https://www.youtube.com/results?search_query=${q}`,
        image: `https://www.google.com/search?tbm=isch&q=${q}`,
        images: `https://www.google.com/search?tbm=isch&q=${q}`,
        pinterest: `https://www.pinterest.com/search/pins/?q=${q}`,
        news: `https://news.google.com/search?q=${q}`,
        playstore: `https://play.google.com/store/search?q=${q}`,
        tiktoksearch: `https://www.tiktok.com/search?q=${q}`,
        igsearch: `https://www.instagram.com/explore/search/keyword/?q=${q}`,
        stock: `https://www.google.com/finance/quote/${text.toUpperCase()}:NASDAQ`,
      };
      let msg = `🔍 *${cmd.toUpperCase()} - ${text}*\n\n`;
      if(abstract) msg += `${abstract.slice(0,500)}\n\n`;
      msg += `🔗 Open: ${links[cmd]}\n\n_Use the link above - bot cannot scrape Google without API key_\n_Tip: Use .wikipedia for full info_`;
      await sock.sendMessage(jid, { text: msg }, { quoted: m });
      return true;
    }

    return false;
  }
};
