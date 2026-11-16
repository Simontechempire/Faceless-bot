const { facelessReply, sendAwait } = require('../lib/function');
const axios = require('axios');

module.exports = {
  name: "tools",
  async run(sock, m, jid, cmd, args, text, isOwner, isGroup, sender){

    const toolCmds = ['weather','translate','tr','qr','qrcode','shorten','short','screenshot','ss','currency','convert','time','calc','calculator','define','wikipedia','wiki','ip','phone','binary','base64'];
    if(!toolCmds.includes(cmd)) return false;

    // ================= WEATHER - REAL Open-Meteo (no key) =================
    if(cmd === 'weather'){
      await sendAwait(sock, jid, m);
      if(!text){ await facelessReply(sock, jid, "Usage: .weather <city e.g Lagos>", m); return true; }
      try{
        const geo = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(text)}&count=1`);
        const loc = geo.data?.results?.[0];
        if(!loc){ await facelessReply(sock, jid, "City Not Found", m); return true; }
        const w = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m&timezone=auto`);
        const c = w.data?.current;
        await facelessReply(sock, jid, `Weather in ${loc.name}, ${loc.country}:\nTemp: ${c.temperature_2m}°C\nFeels Like: ${c.apparent_temperature}°C\nHumidity: ${c.relative_humidity_2m}%\nWind: ${c.wind_speed_10m} km/h\nPrecipitation: ${c.precipitation} mm`, m);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= TRANSLATE - REAL MyMemory =================
    if(cmd === 'translate' || cmd === 'tr'){
      await sendAwait(sock, jid, m);
      // .tr en | hello OR .tr en hello
      let lang = args[0];
      let query = args.slice(1).join(' ');
      if(text.includes('|')){ const parts = text.split('|'); lang = parts[0].trim(); query = parts[1].trim(); }
      if(!lang || !query){ await facelessReply(sock, jid, "Usage: .tr <lang code e.g fr> <text>\nExample: .tr fr Hello", m); return true; }
      try{
        const res = await axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(query)}&langpair=en|${lang}`);
        const trans = res.data?.responseData?.translatedText;
        await facelessReply(sock, jid, `Translate to ${lang}:\nOriginal: ${query}\nTranslated: ${trans}`, m);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= QR - REAL api.qrserver =================
    if(cmd === 'qr' || cmd === 'qrcode'){
      await sendAwait(sock, jid, m);
      if(!text){ await facelessReply(sock, jid, "Usage: .qr <text or link>", m); return true; }
      try{
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(text)}`;
        await sock.sendMessage(jid, { image: { url }, caption: `QR For: ${text}` }, { quoted: m });
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= SHORTEN - REAL is.gd =================
    if(cmd === 'shorten' || cmd === 'short'){
      await sendAwait(sock, jid, m);
      if(!text || !text.startsWith('http')){ await facelessReply(sock, jid, "Usage: .shorten <link>", m); return true; }
      try{
        const res = await axios.get(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(text)}`);
        await facelessReply(sock, jid, `Shortened:\nOriginal: ${text}\nShort: ${res.data}`, m);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= SCREENSHOT - REAL Microlink =================
    if(cmd === 'screenshot' || cmd === 'ss'){
      await sendAwait(sock, jid, m);
      if(!text || !text.startsWith('http')){ await facelessReply(sock, jid, "Usage: .ss <website link>", m); return true; }
      try{
        const res = await axios.get(`https://api.microlink.io?url=${encodeURIComponent(text)}&meta=false&screenshot=true`);
        const shot = res.data?.data?.screenshot?.url;
        if(!shot) throw new Error("No screenshot");
        await sock.sendMessage(jid, { image: { url: shot }, caption: `Screenshot: ${text}` }, { quoted: m });
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= CURRENCY - REAL exchangerate.host =================
    if(cmd === 'currency' || cmd === 'convert'){
      await sendAwait(sock, jid, m);
      // .convert 100 USD NGN
      const amount = parseFloat(args[0]);
      const from = (args[1]||'').toUpperCase();
      const to = (args[2]||'').toUpperCase();
      if(!amount || !from || !to){ await facelessReply(sock, jid, "Usage: .convert <amount> <from> <to>\nExample: .convert 100 USD NGN", m); return true; }
      try{
        const res = await axios.get(`https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`);
        const result = res.data?.result;
        await facelessReply(sock, jid, `Currency:\n${amount} ${from} = ${result?.toFixed(2)} ${to}`, m);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= TIME - REAL WorldTimeAPI =================
    if(cmd === 'time'){
      await sendAwait(sock, jid, m);
      const zone = args[0] || 'Africa/Lagos';
      try{
        const res = await axios.get(`https://worldtimeapi.org/api/timezone/${zone}`);
        await facelessReply(sock, jid, `Time in ${zone}:\n${res.data.datetime}\nDay: ${res.data.day_of_week} | Week: ${res.data.week_number}`, m);
      }catch{
        await facelessReply(sock, jid, `Current Time (Lagos):\n${new Date().toLocaleString('en-NG',{timeZone:'Africa/Lagos'})}`, m);
      }
      return true;
    }

    // ================= CALC - REAL SAFE EVAL =================
    if(cmd === 'calc' || cmd === 'calculator'){
      await sendAwait(sock, jid, m);
      if(!text){ await facelessReply(sock, jid, "Usage: .calc 2+2*3", m); return true; }
      try{
        const clean = text.replace(/[^0-9+\-*/(). ]/g,'');
        if(!clean) throw new Error("Invalid");
        const result = Function(`"use strict"; return (${clean})`)();
        await facelessReply(sock, jid, `Calc:\n${clean} = ${result}`, m);
      }catch(e){ await facelessReply(sock, jid, `Invalid Calculation`, m); }
      return true;
    }

    // ================= DEFINE - REAL Dictionary API =================
    if(cmd === 'define'){
      await sendAwait(sock, jid, m);
      if(!text){ await facelessReply(sock, jid, "Usage: .define <word>", m); return true; }
      try{
        const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(text)}`);
        const entry = res.data?.[0];
        const def = entry?.meanings?.[0]?.definitions?.[0];
        await facelessReply(sock, jid, `Define: ${entry.word}\nPronunciation: ${entry.phonetic || 'N/A'}\nPart: ${entry.meanings[0].partOfSpeech}\nMeaning: ${def.definition}\nExample: ${def.example || 'N/A'}`, m);
      }catch(e){ await facelessReply(sock, jid, `Word Not Found`, m); }
      return true;
    }

    // ================= WIKIPEDIA - REAL =================
    if(cmd === 'wikipedia' || cmd === 'wiki'){
      await sendAwait(sock, jid, m);
      if(!text){ await facelessReply(sock, jid, "Usage: .wiki <search>", m); return true; }
      try{
        const res = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(text)}`);
        await facelessReply(sock, jid, `Wikipedia: ${res.data.title}\n\n${res.data.extract?.slice(0,800)}\n\nRead More: ${res.data.content_urls?.desktop?.page}`, m);
      }catch(e){ await facelessReply(sock, jid, `Not Found On Wikipedia`, m); }
      return true;
    }

    // ================= IP LOOKUP - REAL ip-api =================
    if(cmd === 'ip'){
      await sendAwait(sock, jid, m);
      if(!text){ await facelessReply(sock, jid, "Usage: .ip <ip address>", m); return true; }
      try{
        const res = await axios.get(`http://ip-api.com/json/${text}`);
        const d = res.data;
        if(d.status !== 'success') throw new Error("Invalid IP");
        await facelessReply(sock, jid, `IP Info: ${text}\nCountry: ${d.country} (${d.countryCode})\nRegion: ${d.regionName}\nCity: ${d.city}\nISP: ${d.isp}\nTimezone: ${d.timezone}`, m);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= PHONE - REAL: country from prefix =================
    if(cmd === 'phone'){
      await sendAwait(sock, jid, m);
      const num = text.replace(/[^0-9+]/g,'');
      if(!num){ await facelessReply(sock, jid, "Usage: .phone +234...", m); return true; }
      const codes = { '234': 'Nigeria', '233': 'Ghana', '254': 'Kenya', '1': 'USA/Canada', '44': 'UK', '91': 'India', '27': 'South Africa', '256': 'Uganda', '255': 'Tanzania' };
      const clean = num.replace('+','');
      let country = 'Unknown';
      for(const code in codes) if(clean.startsWith(code)) country = codes[code];
      await facelessReply(sock, jid, `Phone: ${num}\nCountry Guess: ${country}\nLength: ${clean.length} digits`, m);
      return true;
    }

    // ================= BINARY / BASE64 =================
    if(cmd === 'binary'){
      await sendAwait(sock, jid, m);
      if(!text){ await facelessReply(sock, jid, "Usage: .binary <text>", m); return true; }
      const bin = text.split('').map(c => c.charCodeAt(0).toString(2).padStart(8,'0')).join(' ');
      await facelessReply(sock, jid, `Binary:\n${bin}`, m);
      return true;
    }
    if(cmd === 'base64'){
      await sendAwait(sock, jid, m);
      if(!text){ await facelessReply(sock, jid, "Usage: .base64 <text>", m); return true; }
      const enc = Buffer.from(text).toString('base64');
      await facelessReply(sock, jid, `Base64:\n${enc}`, m);
      return true;
    }

    return false;
  }
};
