// 🙏 FACELESS - RELIGION PLUGIN - REAL HANDLER
// Bible + Quran + Prayer Times - respects both faiths

const COMMANDS = ['bible','verse','dailyverse','bibleverse','quran','surah','ayah','prayer','prayertime','salah','hadith','god','jesus','allah','church','mosque','devotion','psalm','proverb','gospel','jesusquote','islam','christian','muslim','dua','pray','amen','blessing','faith','churchservice','biblequiz'];

module.exports = {
  name: 'religion',
  commands: COMMANDS,
  run: async (sock, m, jid, cmd, args, text, isOwner, isGroup, sender) => {
    if(!COMMANDS.includes(cmd)) return false;

    // --- BIBLE / VERSE / DAILYVERSE ---
    if(['bible','verse','dailyverse','bibleverse','psalm','proverb','gospel'].includes(cmd)){
      let query = text;
      if(cmd==='dailyverse' || !query){
        // Random popular verses
        const verses = ['John 3:16','Psalm 23:1','Jeremiah 29:11','Philippians 4:13','Romans 8:28','Psalm 46:1','Isaiah 41:10','Matthew 6:33','Proverbs 3:5','Joshua 1:9'];
        query = verses[Math.floor(Math.random()*verses.length)];
      }
      if(cmd==='psalm' && !text) query = `Psalm ${Math.floor(Math.random()*150)+1}`;
      if(cmd==='proverb' && !text) query = `Proverbs ${Math.floor(Math.random()*31)+1}`;
      try{
        const res = await fetch(`https://bible-api.com/${encodeURIComponent(query)}?translation=kjv`);
        const d = await res.json();
        if(d.error || !d.text){ await sock.sendMessage(jid, { text: `❌ Verse not found: ${query}\nTry: .bible John 3:16` }, { quoted: m }); return true; }
        await sock.sendMessage(jid, { text: `📖 *BIBLE - ${d.reference} (KJV)*\n\n"${d.text.trim()}"\n\n_Translation: ${d.translation_name||'KJV'}_` }, { quoted: m });
      }catch(e){ await sock.sendMessage(jid, { text: `❌ Bible failed: ${e.message}` }, { quoted: m }); }
      return true;
    }

    // --- QURAN / SURAH / AYAH ---
    if(['quran','surah','ayah'].includes(cmd)){
      // .quran 2:255  OR .quran 2  OR .surah 1
      if(!text && cmd!=='quran'){
        await sock.sendMessage(jid, { text: `Usage: .${cmd} <surah:ayah>\nExample: .quran 2:255\nOr .surah 1` }, { quoted: m });
        return true;
      }
      let ref = text || '2:255'; // Ayat al-Kursi default
      try{
        if(ref.includes(':')){
          const [surah, ayah] = ref.split(':');
          const res = await fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/en.asad`);
          const d = await res.json();
          const arabicRes = await fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}`);
          const arabic = await arabicRes.json();
          if(d.code!==200){ await sock.sendMessage(jid, { text: `❌ Ayah not found: ${ref}` }, { quoted: m }); return true; }
          await sock.sendMessage(jid, { text: `📖 *QURAN - Surah ${d.data.surah.englishName} (${d.data.surah.name}) - Ayah ${d.data.numberInSurah}*\n\n${arabic.data.text}\n\n"${d.data.text}"\n\n_Surah ${surah} : Ayah ${ayah}_` }, { quoted: m });
        } else {
          // Surah only
          const num = parseInt(ref);
          const res = await fetch(`https://api.alquran.cloud/v1/surah/${num}/en.asad`);
          const d = await res.json();
          if(d.code!==200){ await sock.sendMessage(jid, { text: `❌ Surah not found: ${ref}` }, { quoted: m }); return true; }
          const ayahs = d.data.ayahs.slice(0,5).map(a=>`${a.numberInSurah}. ${a.text}`).join('\n\n');
          await sock.sendMessage(jid, { text: `📖 *QURAN - Surah ${d.data.englishName} (${d.data.name})*\nRevelation: ${d.data.revelationType} | Ayahs: ${d.data.numberOfAyahs}\n\n${ayahs}\n\n... Use .quran ${num}:1 for full` }, { quoted: m });
        }
      }catch(e){ await sock.sendMessage(jid, { text: `❌ Quran failed: ${e.message}` }, { quoted: m }); }
      return true;
    }

    // --- PRAYER / PRAYERTIME / SALAH ---
    if(['prayer','prayertime','salah'].includes(cmd)){
      const city = text || 'Lagos';
      try{
        const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=Nigeria&method=5`);
        const d = await res.json();
        if(d.code!==200){ await sock.sendMessage(jid, { text: `❌ Prayer times not found for: ${city}` }, { quoted: m }); return true; }
        const t = d.data.timings;
        await sock.sendMessage(jid, { text: `🕌 *PRAYER TIMES - ${city}, Nigeria*\n📅 ${d.data.date.readable} (${d.data.date.hijri.day} ${d.data.date.hijri.month.en} ${d.data.date.hijri.year} AH)\n\n🌅 Fajr: ${t.Fajr}\n🌞 Sunrise: ${t.Sunrise}\n☀️ Dhuhr: ${t.Dhuhr}\n🌤️ Asr: ${t.Asr}\n🌇 Maghrib: ${t.Maghrib}\n🌙 Isha: ${t.Isha}\n\n_Usage: .prayer Warri / .prayer Abuja_` }, { quoted: m });
      }catch(e){ await sock.sendMessage(jid, { text: `❌ Prayer times failed: ${e.message}` }, { quoted: m }); }
      return true;
    }

    // --- HADITH ---
    if(cmd==='hadith'){
      try{
        const collections = ['bukhari','muslim','abudawud','tirmidhi'];
        const col = collections[Math.floor(Math.random()*collections.length)];
        const num = Math.floor(Math.random()*100)+1;
        const res = await fetch(`https://api.hadith.gading.dev/books/${col}/${num}`);
        const d = await res.json();
        if(d?.data?.contents?.arab){
          await sock.sendMessage(jid, { text: `📜 *HADITH - ${d.data.name} #${num}*\n\n${d.data.contents.arab}\n\n"${d.data.contents.id}"` }, { quoted: m });
        } else {
          await sock.sendMessage(jid, { text: `📜 *HADITH*\n\n"The best among you are those who learn the Quran and teach it."\n- Sahih al-Bukhari` }, { quoted: m });
        }
      }catch{
        await sock.sendMessage(jid, { text: `📜 *HADITH*\n\n"Actions are judged by intentions."\n- Sahih al-Bukhari` }, { quoted: m });
      }
      return true;
    }

    // --- DUA / PRAY / AMEN / BLESSING / FAITH / DEVOTION ---
    if(cmd==='dua'){
      const duas = [
        'Allahumma inni as-aluka al-afiyah - O Allah, I ask You for well-being',
        'Rabbana atina fid-dunya hasanah - Our Lord, give us good in this world',
        'Allahumma barik lana - O Allah, bless us',
      ];
      await sock.sendMessage(jid, { text: `🤲 *DUA*\n\n${duas[Math.floor(Math.random()*duas.length)]}` }, { quoted: m });
      return true;
    }
    if(cmd==='pray' || cmd==='amen' || cmd==='blessing'){
      const prayers = [
        '🙏 May God bless you and your family today. May your hustle prosper. Amen!',
        '🙏 I pray for open doors, good health, and favour for you this week. Amen!',
        '🙏 May God protect you from evil eyes and bless your work. Amen!',
      ];
      await sock.sendMessage(jid, { text: prayers[Math.floor(Math.random()*prayers.length)] }, { quoted: m });
      return true;
    }
    if(cmd==='devotion' || cmd==='faith'){
      await sock.sendMessage(jid, { text: `✨ *DAILY DEVOTION*\n\nStart your day with God.\nRead: Psalm 23\nPray: Thank God for life\nDeclare: Today will be good!\n\n_Use .bible for verse, .quran for Quran_` }, { quoted: m });
      return true;
    }
    if(cmd==='jesus' || cmd==='jesusquote'){
      const quotes = ['"I am the way, the truth, and the life." - John 14:6','"Love your neighbor as yourself." - Mark 12:31','"Come to me, all who are weary." - Matthew 11:28'];
      await sock.sendMessage(jid, { text: `✝️ *JESUS SAYS*\n\n${quotes[Math.floor(Math.random()*quotes.length)]}` }, { quoted: m });
      return true;
    }
    if(cmd==='allah'){
      await sock.sendMessage(jid, { text: `☪️ *ALLAH*\n\n"And your Lord says: Call upon Me, I will answer you."\n- Quran 40:60\n\n99 Names: Ar-Rahman (The Most Merciful), Ar-Rahim (The Most Compassionate)` }, { quoted: m });
      return true;
    }
    if(cmd==='god'){
      await sock.sendMessage(jid, { text: `🙏 *GOD*\n\nGod loves you.\nWhatever you are going through, keep faith.\n\nChristian? Try .bible\nMuslim? Try .quran` }, { quoted: m });
      return true;
    }
    if(cmd==='church' || cmd==='mosque' || cmd==='churchservice'){
      await sock.sendMessage(jid, { text: `⛪🕌 *WORSHIP*\n\nFind a church/mosque near you in Port Harcourt / Warri / Lagos.\n\nSunday Service: 8am & 10am\nJumu'ah Prayer: Friday 1pm\n\nUse .prayer Lagos for prayer times` }, { quoted: m });
      return true;
    }
    if(cmd==='islam' || cmd==='muslim' || cmd==='christian'){
      await sock.sendMessage(jid, { text: cmd==='islam'||cmd==='muslim' ? `☪️ *ISLAM*\n\n5 Pillars: Shahada, Salah, Zakat, Sawm, Hajj\n\nUse: .quran 2:255 | .prayer Lagos | .hadith | .dua` : `✝️ *CHRISTIANITY*\n\nFaith in Jesus Christ.\n\nUse: .bible John 3:16 | .dailyverse | .pray | .jesus` }, { quoted: m });
      return true;
    }
    if(cmd==='biblequiz'){
      const qs = [
        { q:'Who built the ark?', a:'Noah' },
        { q:'Who was swallowed by a big fish?', a:'Jonah' },
        { q:'Who killed Goliath?', a:'David' },
      ];
      const qq = qs[Math.floor(Math.random()*qs.length)];
      await sock.sendMessage(jid, { text: `🧠 *BIBLE QUIZ*\n\n${qq.q}\n\n_Answer is hidden..._\n\nAnswer: ${qq.a}` }, { quoted: m });
      return true;
    }

    return false;
  }
};
