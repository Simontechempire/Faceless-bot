// 📰 FACELESS - NEWS PLUGIN - REAL HANDLER
// Crypto via CoinGecko, FX via ExchangeRate, News via Google News RSS, Football via TheSportsDB

async function fetchText(url){
  try{ const r = await fetch(url, { headers:{'User-Agent':'Mozilla/5.0'} }); if(!r.ok) return null; return await r.text(); }catch{ return null; }
}
async function fetchJson(url){
  try{ const r = await fetch(url, { headers:{'User-Agent':'Mozilla/5.0'} }); if(!r.ok) return null; return await r.json(); }catch{ return null; }
}
function parseRSS(xml, limit=5){
  if(!xml) return [];
  const items = [];
  const matches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
  for(const m of matches.slice(0,limit)){
    const block = m[1];
    const title = (block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)||block.match(/<title>(.*?)<\/title>/)||[])[1]||'No title';
    const link = (block.match(/<link>(.*?)<\/link>/)||[])[1]||'';
    const date = (block.match(/<pubDate>(.*?)<\/pubDate>/)||[])[1]||'';
    items.push({ title: title.replace(/<[^>]*>/g,''), link, date });
  }
  return items;
}

const COMMANDS = ['news','headlines','naijanews','worldnews','technews','sportnews','football','soccer','livescore','score','naira','exchange','fx','dollar','crypto','btc','bitcoin','eth','ethereum','gold','silver','oil','lotteryresult','weather2','breaking'];

module.exports = {
  name: 'news',
  commands: COMMANDS,
  run: async (sock, m, jid, cmd, args, text, isOwner, isGroup, sender) => {
    if(!COMMANDS.includes(cmd)) return false;

    // --- NEWS / HEADLINES ---
    if(['news','headlines','naijanews','worldnews','technews','sportnews','breaking'].includes(cmd)){
      const topicMap = {
        news: 'Nigeria', headlines: 'Nigeria', naijanews: 'Nigeria',
        worldnews: 'World', technews: 'Technology', sportnews: 'Sports', breaking: 'Breaking News Nigeria'
      };
      const topic = topicMap[cmd] || text || 'Nigeria';
      const query = text || topic;
      await sock.sendMessage(jid, { text: `📰 Fetching ${query} news...` }, { quoted: m });
      // Google News RSS - no key needed
      const xml = await fetchText(`https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-NG&gl=NG&ceid=NG:en`);
      const items = parseRSS(xml, 7);
      if(!items.length){
        // Fallback to BBC
        const xml2 = await fetchText(`https://feeds.bbci.co.uk/news/world/rss.xml`);
        const items2 = parseRSS(xml2, 5);
        if(!items2.length){ await sock.sendMessage(jid, { text: '❌ News failed. Try again later.' }, { quoted: m }); return true; }
        let msg = `📰 *BBC WORLD NEWS*\n\n`;
        items2.forEach((it,i)=>{ msg += `${i+1}. ${it.title}\n🔗 ${it.link}\n\n`; });
        await sock.sendMessage(jid, { text: msg }, { quoted: m });
        return true;
      }
      let msg = `📰 *${query.toUpperCase()} NEWS*\n\n`;
      items.forEach((it,i)=>{ msg += `${i+1}. ${it.title}\n🔗 ${it.link}\n\n`; });
      msg += `_Source: Google News_`;
      await sock.sendMessage(jid, { text: msg.slice(0,4000) }, { quoted: m });
      return true;
    }

    // --- FOOTBALL / SOCCER / LIVESCORE / SCORE ---
    if(['football','soccer','livescore','score'].includes(cmd)){
      const team = text || 'Chelsea';
      await sock.sendMessage(jid, { text: `⚽ Searching ${team}...` }, { quoted: m });
      try{
        // TheSportsDB - free, no key (key 3 is demo)
        const search = await fetchJson(`https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(team)}`);
        const t = search?.teams?.[0];
        if(!t){ await sock.sendMessage(jid, { text: `❌ Team not found: ${team}\nTry: .football Chelsea / Arsenal / Man City / Barcelona` }, { quoted: m }); return true; }
        // Last 5 results
        const last = await fetchJson(`https://www.thesportsdb.com/api/v1/json/3/eventslast.php?id=${t.idTeam}`);
        const next = await fetchJson(`https://www.thesportsdb.com/api/v1/json/3/eventsnext.php?id=${t.idTeam}`);
        let msg = `⚽ *${t.strTeam}*\n\n🏟️ Stadium: ${t.strStadium||'N/A'}\n🌍 League: ${t.strLeague||'N/A'}\n📍 Location: ${t.strStadiumLocation||''}\n\n📊 *LAST RESULTS:*\n`;
        (last?.results||[]).slice(0,3).forEach(e=>{ msg += `${e.strHomeTeam} ${e.intHomeScore} - ${e.intAwayScore} ${e.strAwayTeam} (${e.dateEvent})\n`; });
        msg += `\n📅 *NEXT MATCH:*\n`;
        (next?.events||[]).slice(0,2).forEach(e=>{ msg += `${e.strHomeTeam} vs ${e.strAwayTeam} - ${e.dateEvent} ${e.strTime||''}\n`; });
        if(t.strTeamBadge) await sock.sendMessage(jid, { image: { url: t.strTeamBadge }, caption: msg }, { quoted: m });
        else await sock.sendMessage(jid, { text: msg }, { quoted: m });
      }catch(e){ await sock.sendMessage(jid, { text: `❌ Football failed: ${e.message}` }, { quoted: m }); }
      return true;
    }

    // --- NAIRA / EXCHANGE / FX / DOLLAR ---
    if(['naira','exchange','fx','dollar'].includes(cmd)){
      const amount = parseFloat(args[0])||1;
      const from = (args[1]||'USD').toUpperCase();
      const to = (args[2]||'NGN').toUpperCase();
      await sock.sendMessage(jid, { text: '💱 Fetching exchange rates...' }, { quoted: m });
      try{
        const d = await fetchJson(`https://open.er-api.com/v6/latest/${from}`);
        if(!d || d.result!=='success'){ await sock.sendMessage(jid, { text: '❌ FX failed, try again' }, { quoted: m }); return true; }
        const rate = d.rates[to];
        if(!rate){ await sock.sendMessage(jid, { text: `❌ Currency not found: ${to}` }, { quoted: m }); return true; }
        await sock.sendMessage(jid, { text: `💱 *EXCHANGE RATE*\n\n${amount} ${from} = ${(amount*rate).toLocaleString()} ${to}\n\n1 ${from} = ${rate.toLocaleString()} ${to}\n1 ${to} = ${(1/rate).toFixed(6)} ${from}\n\n📅 Updated: ${d.time_last_update_utc}\n\n_Usage: .naira 100 USD NGN / .exchange 50 USD EUR_` }, { quoted: m });
      }catch(e){ await sock.sendMessage(jid, { text: `❌ FX failed: ${e.message}` }, { quoted: m }); }
      return true;
    }

    // --- CRYPTO / BTC / ETH ---
    if(['crypto','btc','bitcoin','eth','ethereum'].includes(cmd)){
      const coin = cmd==='btc'||cmd==='bitcoin' ? 'bitcoin' : cmd==='eth'||cmd==='ethereum' ? 'ethereum' : (text.toLowerCase()||'bitcoin');
      const coinMap = { btc:'bitcoin', bitcoin:'bitcoin', eth:'ethereum', ethereum:'ethereum', sol:'solana', solana:'solana', doge:'dogecoin', dogecoin:'dogecoin', usdt:'tether', tether:'tether', bnb:'binancecoin' };
      const id = coinMap[coin]||coin;
      await sock.sendMessage(jid, { text: `🪙 Fetching ${id} price...` }, { quoted: m });
      try{
        const d = await fetchJson(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd,ngn&include_24hr_change=true`);
        const c = d?.[id];
        if(!c){ await sock.sendMessage(jid, { text: `❌ Crypto not found: ${coin}\nTry: .crypto btc / .btc / .eth / .crypto sol` }, { quoted: m }); return true; }
        const name = id.charAt(0).toUpperCase()+id.slice(1);
        await sock.sendMessage(jid, { text: `🪙 *${name} (${id.toUpperCase()})*\n\n💵 USD: $${c.usd?.toLocaleString()}\n🇳🇬 NGN: ₦${c.ngn?.toLocaleString()}\n📈 24h Change: ${c.usd_24h_change?.toFixed(2)}%\n\n_Usage: .crypto btc / .crypto eth / .crypto sol_` }, { quoted: m });
      }catch(e){ await sock.sendMessage(jid, { text: `❌ Crypto failed: ${e.message}` }, { quoted: m }); }
      return true;
    }

    // --- GOLD / SILVER / OIL ---
    if(['gold','silver','oil'].includes(cmd)){
      // Use metals API via goldprice.org free
      try{
        const d = await fetchJson(`https://data-asg.goldprice.org/dbXRates/USD`);
        if(d?.items?.[0]){
          const g = d.items[0];
          await sock.sendMessage(jid, { text: `🥇 *GOLD / SILVER / OIL*\n\n🥇 Gold: $${g.curr} per oz (Change: ${g.chg}%)\n📅 ${g.date}\n\n_For live oil, check .news oil price_` }, { quoted: m });
          return true;
        }
        await sock.sendMessage(jid, { text: `🥇 *${cmd.toUpperCase()}*\n\nLive price temporarily unavailable.\nTry .crypto btc for crypto prices` }, { quoted: m });
      }catch{ await sock.sendMessage(jid, { text: '❌ Gold price failed' }, { quoted: m }); }
      return true;
    }

    // --- LOTTERY RESULT ---
    if(cmd==='lotteryresult'){
      await sock.sendMessage(jid, { text: `🎰 *LOTTERY*\n\nToday's lucky numbers: ${Array(6).fill(0).map(()=>Math.floor(Math.random()*49)+1).join(' - ')}\n\n_This is for fun, not real lottery result_` }, { quoted: m });
      return true;
    }

    if(cmd==='weather2'){
      await sock.sendMessage(jid, { text: 'Use .weather Lagos for weather' }, { quoted: m });
      return true;
    }

    return false;
  }
};
