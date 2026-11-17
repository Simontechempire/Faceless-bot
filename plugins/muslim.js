// ☪️ FACELESS - MUSLIM PLUGIN - REAL HANDLER
// Quran via AlQuran Cloud, Prayer via AlAdhan, Hadith via Gading, Dua, 99 Names

async function fetchJson(url){
  try{ const r = await fetch(url, {headers:{'User-Agent':'Mozilla/5.0'}}); if(!r.ok) return null; return await r.json(); }catch{ return null; }
}
function pick(a){ return a[Math.floor(Math.random()*a.length)]; }

const NAMES99 = [
  "1. Ar-Rahman - The Most Merciful","2. Ar-Rahim - The Most Compassionate","3. Al-Malik - The King",
  "4. Al-Quddus - The Most Holy","5. As-Salam - The Source of Peace","6. Al-Mu'min - The Giver of Faith",
  "7. Al-Muhaymin - The Guardian","8. Al-Aziz - The Almighty","9. Al-Jabbar - The Compeller",
  "10. Al-Mutakabbir - The Supreme","11. Al-Khaliq - The Creator","12. Al-Bari - The Originator",
  "13. Al-Musawwir - The Fashioner","14. Al-Ghaffar - The Great Forgiver","15. Al-Qahhar - The Irresistible",
  "16. Al-Wahhab - The Supreme Bestower","17. Ar-Razzaq - The Provider","18. Al-Fattah - The Opener",
  "19. Al-Alim - The All-Knowing","20. Al-Qabid - The Withholder","21. Al-Basit - The Extender",
  "22. Al-Khafid - The Reducer","23. Ar-Rafi - The Exalter","24. Al-Mu'izz - The Honourer",
  "25. Al-Mudhill - The Humiliator","26. As-Sami - The All-Hearing","27. Al-Basir - The All-Seeing",
  "28. Al-Hakam - The Impartial Judge","29. Al-Adl - The Utterly Just","30. Al-Latif - The Subtle One",
  "31. Al-Khabir - The All-Aware","32. Al-Halim - The Most Forbearing","33. Al-Azim - The Magnificent",
  "34. Al-Ghafoor - The All-Forgiving","35. Ash-Shakur - The Most Appreciative","36. Al-Ali - The Most High",
  "37. Al-Kabir - The Most Great","38. Al-Hafiz - The Preserver","39. Al-Muqit - The Sustainer",
  "40. Al-Hasib - The Reckoner","41. Al-Jalil - The Majestic","42. Al-Karim - The Most Generous",
  "43. Ar-Raqib - The Watchful","44. Al-Mujib - The Responsive","45. Al-Wasi - The All-Encompassing",
  "46. Al-Hakim - The All-Wise","47. Al-Wadud - The Most Loving","48. Al-Majid - The Most Glorious",
  "49. Al-Ba'ith - The Resurrector","50. Ash-Shahid - The Witness","51. Al-Haqq - The Absolute Truth",
  "52. Al-Wakil - The Trustee","53. Al-Qawiyy - The All-Strong","54. Al-Matin - The Firm",
  "55. Al-Waliyy - The Protecting Friend","56. Al-Hamid - The Praiseworthy","57. Al-Muhsi - The Counter",
  "58. Al-Mubdi - The Originator","59. Al-Mu'id - The Restorer","60. Al-Muhyi - The Giver of Life",
  "61. Al-Mumit - The Bringer of Death","62. Al-Hayy - The Ever-Living","63. Al-Qayyum - The Self-Subsisting",
  "64. Al-Wajid - The Perceiver","65. Al-Majid - The Illustrious","66. Al-Wahid - The One",
  "67. As-Samad - The Eternal","68. Al-Qadir - The Capable","69. Al-Muqtadir - The Powerful",
  "70. Al-Muqaddim - The Expediter","71. Al-Mu'akhkhir - The Delayer","72. Al-Awwal - The First",
  "73. Al-Akhir - The Last","74. Az-Zahir - The Manifest","75. Al-Batin - The Hidden",
  "76. Al-Wali - The Governor","77. Al-Muta'ali - The Most Exalted","78. Al-Barr - The Source of Goodness",
  "79. At-Tawwab - The Acceptor of Repentance","80. Al-Muntaqim - The Avenger","81. Al-Afuww - The Pardoner",
  "82. Ar-Ra'uf - The Most Kind","83. Malik-ul-Mulk - Master of Kingdom","84. Dhul-Jalali-wal-Ikram - Lord of Majesty",
  "85. Al-Muqsit - The Equitable","86. Al-Jami - The Gatherer","87. Al-Ghaniyy - The Self-Sufficient",
  "88. Al-Mughni - The Enricher","89. Al-Mani - The Preventer","90. Ad-Darr - The Distresser",
  "91. An-Nafi - The Benefactor","92. An-Nur - The Light","93. Al-Hadi - The Guide",
  "94. Al-Badi - The Incomparable","95. Al-Baqi - The Everlasting","96. Al-Warith - The Inheritor",
  "97. Ar-Rashid - The Guide to Right Path","98. As-Sabur - The Most Patient","99. Allah - The God",
];

const DUAS = [
  { title: "Dua for Forgiveness", arabic: "اللهم إنك عفو تحب العفو فاعف عني", text: "Allahumma innaka 'afuwwun tuhibbul 'afwa fa'fu 'anni - O Allah, You are Pardoning and You love pardon, so pardon me" },
  { title: "Dua for Parents", arabic: "رب ارحمهما كما ربياني صغيرا", text: "Rabbir hamhuma kama rabbayani saghira - My Lord, have mercy upon my parents as they raised me when I was small" },
  { title: "Dua for Success", arabic: "ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار", text: "Rabbana atina fid-dunya hasanah wa fil-akhirati hasanah wa qina 'adhab an-nar - Our Lord, give us good in this world and good in Hereafter" },
  { title: "Dua for Knowledge", arabic: "رب زدني علما", text: "Rabbi zidni 'ilma - My Lord, increase me in knowledge" },
  { title: "Dua for Rizq / Money", arabic: "اللهم ارزقني رزقا واسعا", text: "Allahummar zuqni rizqan wasi'an - O Allah, grant me abundant provision" },
  { title: "Dua for Protection", arabic: "أعوذ بكلمات الله التامات من شر ما خلق", text: "A'udhu bi kalimatillahit-tammati min sharri ma khalaq - I seek refuge in Allah's perfect words from evil of what He created" },
  { title: "Dua for Anxiety", arabic: "اللهم إني أعوذ بك من الهم والحزن", text: "Allahumma inni a'udhu bika minal-hammi wal-hazan - O Allah, I seek refuge in You from anxiety and grief" },
  { title: "Dua Before Eating", arabic: "بسم الله وعلى بركة الله", text: "Bismillah wa 'ala barakatillah - In the name of Allah and with the blessing of Allah" },
  { title: "Dua Before Sleeping", arabic: "باسمك اللهم أموت وأحيا", text: "Bismika Allahumma amutu wa ahya - In Your name, O Allah, I die and I live" },
  { title: "Dua for Travelling", arabic: "سبحان الذي سخر لنا هذا وما كنا له مقرنين", text: "Subhanalladhi sakhkhara lana hadha - Glory to Him who has subjected this to us" },
];

const SURAHS = {
  1:"Al-Fatiha",2:"Al-Baqarah",3:"Aal-e-Imran",4:"An-Nisa",5:"Al-Ma'idah",6:"Al-An'am",7:"Al-A'raf",8:"Al-Anfal",9:"At-Tawbah",10:"Yunus",
  11:"Hud",12:"Yusuf",13:"Ar-Ra'd",14:"Ibrahim",15:"Al-Hijr",16:"An-Nahl",17:"Al-Isra",18:"Al-Kahf",19:"Maryam",20:"Taha",
  21:"Al-Anbiya",22:"Al-Hajj",23:"Al-Mu'minun",24:"An-Nur",25:"Al-Furqan",26:"Ash-Shu'ara",27:"An-Naml",28:"Al-Qasas",29:"Al-Ankabut",30:"Ar-Rum",
  31:"Luqman",32:"As-Sajdah",33:"Al-Ahzab",34:"Saba",35:"Fatir",36:"Ya-Sin",37:"As-Saffat",38:"Sad",39:"Az-Zumar",40:"Ghafir",
  41:"Fussilat",42:"Ash-Shura",43:"Az-Zukhruf",44:"Ad-Dukhan",45:"Al-Jathiyah",46:"Al-Ahqaf",47:"Muhammad",48:"Al-Fath",49:"Al-Hujurat",50:"Qaf",
  51:"Adh-Dhariyat",52:"At-Tur",53:"An-Najm",54:"Al-Qamar",55:"Ar-Rahman",56:"Al-Waqi'ah",57:"Al-Hadid",58:"Al-Mujadila",59:"Al-Hashr",60:"Al-Mumtahanah",
  61:"As-Saff",62:"Al-Jumu'ah",63:"Al-Munafiqun",64:"At-Taghabun",65:"At-Talaq",66:"At-Tahrim",67:"Al-Mulk",68:"Al-Qalam",69:"Al-Haqqah",70:"Al-Ma'arij",
  71:"Nuh",72:"Al-Jinn",73:"Al-Muzzammil",74:"Al-Muddaththir",75:"Al-Qiyamah",76:"Al-Insan",77:"Al-Mursalat",78:"An-Naba",79:"An-Nazi'at",80:"Abasa",
  81:"At-Takwir",82:"Al-Infitar",83:"Al-Mutaffifin",84:"Al-Inshiqaq",85:"Al-Buruj",86:"At-Tariq",87:"Al-A'la",88:"Al-Ghashiyah",89:"Al-Fajr",90:"Al-Balad",
  91:"Ash-Shams",92:"Al-Layl",93:"Ad-Duha",94:"Ash-Sharh",95:"At-Tin",96:"Al-Alaq",97:"Al-Qadr",98:"Al-Bayyinah",99:"Az-Zalzalah",100:"Al-Adiyat",
  101:"Al-Qari'ah",102:"At-Takathur",103:"Al-Asr",104:"Al-Humazah",105:"Al-Fil",106:"Quraysh",107:"Al-Ma'un",108:"Al-Kawthar",109:"Al-Kafirun",110:"An-Nasr",
  111:"Al-Masad",112:"Al-Ikhlas",113:"Al-Falaq",114:"An-Nas"
};

const COMMANDS = ['quran','surah','ayah','prayer','prayertime','salah','adhan','hadith','dua','names','99names','allah','islam','muslim','jumuah','ramadan','eid','hijri','islamicdate','qibla','tasbih','dhikr','istighfar','sunnah','prophet','muhammad','seerah','islamicquiz','muslimquiz','wudu','fasting','salah2','taraweeh','laylatulqadr','bismillah','alhamdulillah','subhanallah','astaghfirullah'];

module.exports = {
  name: 'muslim',
  commands: COMMANDS,
  run: async (sock, m, jid, cmd, args, text, isOwner, isGroup, sender) => {
    if(!COMMANDS.includes(cmd)) return false;

    // --- QURAN / SURAH / AYAH ---
    if(['quran','surah','ayah'].includes(cmd)){
      let ref = text || '2:255';
      if(cmd==='surah' && !text){ await sock.sendMessage(jid, { text: 'Usage: .surah <1-114>\nExample: .surah 36\nList: .surah list' }, { quoted: m }); return true; }
      if(text?.toLowerCase()==='list'){
        let list='📖 *114 SURAHS*\n\n';
        for(let i=1;i<=114;i++) list+=`${i}. ${SURAHS[i]}\n`;
        await sock.sendMessage(jid, { text: list }, { quoted: m });
        return true;
      }
      if(cmd==='quran' && text && !text.includes(':') && !isNaN(parseInt(text))){
        // Surah number
        const num = parseInt(text);
        const d = await fetchJson(`https://api.alquran.cloud/v1/surah/${num}/en.asad`);
        if(!d || d.code!==200){ await sock.sendMessage(jid, { text: `❌ Surah not found: ${text}` }, { quoted: m }); return true; }
        const first5 = d.data.ayahs.slice(0,5).map(a=>`${a.numberInSurah}. ${a.text}`).join('\n\n');
        await sock.sendMessage(jid, { text: `📖 *SURAH ${d.data.englishName} (${d.data.name})*\nRevelation: ${d.data.revelationType} | Ayahs: ${d.data.numberOfAyahs}\n\n${first5}\n\n_Use .quran ${num}:1 to read full_` }, { quoted: m });
        return true;
      }
      try{
        const [surah, ayah] = ref.split(':');
        const d = await fetchJson(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/en.asad`);
        const ar = await fetchJson(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}`);
        if(!d || d.code!==200){ await sock.sendMessage(jid, { text: `❌ Ayah not found: ${ref}\nTry: .quran 2:255` }, { quoted: m }); return true; }
        await sock.sendMessage(jid, { text: `📖 *QURAN - Surah ${d.data.surah.englishName} (${d.data.surah.name}) - Ayah ${d.data.numberInSurah}*\n\n${ar?.data?.text||''}\n\n"${d.data.text}"\n\n_Surah ${surah} : Ayah ${ayah} | Juz ${d.data.juz}_` }, { quoted: m });
      }catch(e){ await sock.sendMessage(jid, { text: `❌ Quran failed: ${e.message}` }, { quoted: m }); }
      return true;
    }

    // --- PRAYER / SALAH / ADHAN ---
    if(['prayer','prayertime','salah','adhan','salah2'].includes(cmd)){
      const city = text || 'Lagos';
      const d = await fetchJson(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=Nigeria&method=5`);
      if(!d || d.code!==200){ await sock.sendMessage(jid, { text: `❌ Prayer times not found for: ${city}` }, { quoted: m }); return true; }
      const t = d.data.timings;
      await sock.sendMessage(jid, { text: `🕌 *PRAYER TIMES - ${city}, Nigeria*\n📅 ${d.data.date.readable}\n☪️ Hijri: ${d.data.date.hijri.day} ${d.data.date.hijri.month.en} ${d.data.date.hijri.year} AH\n\n🌅 Fajr: ${t.Fajr}\n🌞 Sunrise: ${t.Sunrise}\n☀️ Dhuhr: ${t.Dhuhr}\n🌤️ Asr: ${t.Asr}\n🌇 Maghrib: ${t.Maghrib}\n🌙 Isha: ${t.Isha}\n🕐 First Third: ${t.Firstthird}\n🌌 Last Third: ${t.Lastthird}\n\n_Usage: .prayer Warri / .prayer Abuja / .prayer Kano_` }, { quoted: m });
      return true;
    }

    // --- HIJRI / ISLAMIC DATE ---
    if(cmd==='hijri' || cmd==='islamicdate'){
      const d = await fetchJson(`https://api.aladhan.com/v1/gToH?date=${new Date().toISOString().slice(0,10)}`);
      if(d?.data?.hijri) await sock.sendMessage(jid, { text: `☪️ *ISLAMIC DATE*\n\nGregorian: ${d.data.gregorian.day} ${d.data.gregorian.month.en} ${d.data.gregorian.year}\nHijri: ${d.data.hijri.day} ${d.data.hijri.month.en} ${d.data.hijri.year} AH\n\nHoliday: ${d.data.hijri.holidays?.join(', ')||'None'}` }, { quoted: m });
      else await sock.sendMessage(jid, { text: '❌ Hijri date failed' }, { quoted: m });
      return true;
    }

    // --- HADITH ---
    if(cmd==='hadith'){
      const cols = ['bukhari','muslim','abudawud','tirmidhi','nasai','ibnmajah'];
      const col = pick(cols);
      const num = Math.floor(Math.random()*200)+1;
      const d = await fetchJson(`https://api.hadith.gading.dev/books/${col}/${num}`);
      if(d?.data?.contents?.arab) await sock.sendMessage(jid, { text: `📜 *HADITH - ${d.data.name} #${num}*\n\n${d.data.contents.arab}\n\n"${d.data.contents.id}"` }, { quoted: m });
      else await sock.sendMessage(jid, { text: `📜 *HADITH*\n\n"Actions are judged by intentions."\n- Sahih al-Bukhari #1` }, { quoted: m });
      return true;
    }

    // --- DUA ---
    if(cmd==='dua'){
      if(!text){ const dua = pick(DUAS); await sock.sendMessage(jid, { text: `🤲 *${dua.title}*\n\n${dua.arabic}\n\n${dua.text}` }, { quoted: m }); return true; }
      const found = DUAS.find(d=>d.title.toLowerCase().includes(text.toLowerCase()));
      if(found) await sock.sendMessage(jid, { text: `🤲 *${found.title}*\n\n${found.arabic}\n\n${found.text}` }, { quoted: m });
      else await sock.sendMessage(jid, { text: `🤲 *DUA LIST*\n\n${DUAS.map(d=>`- ${d.title}`).join('\n')}\n\nUsage: .dua forgiveness / .dua parents / .dua success` }, { quoted: m });
      return true;
    }

    // --- 99 NAMES ---
    if(cmd==='names' || cmd==='99names'){
      if(text && !isNaN(parseInt(text))){
        const n = parseInt(text);
        if(n>=1 && n<=99){ await sock.sendMessage(jid, { text: `☪️ *99 NAMES OF ALLAH*\n\n${NAMES99[n-1]}` }, { quoted: m }); return true; }
      }
      // Show 10 random + how to get more
      const shuffled = [...NAMES99].sort(()=>Math.random()-0.5).slice(0,10);
      await sock.sendMessage(jid, { text: `☪️ *99 NAMES OF ALLAH - Sample*\n\n${shuffled.join('\n')}\n\n_Usage: .99names 1  (1-99)_\n_All 99 names available_` }, { quoted: m });
      return true;
    }

    // --- TASBIH / DHIKR / ISTIGHFAR ---
    if(['tasbih','dhikr','istighfar','bismillah','alhamdulillah','subhanallah','astaghfirullah'].includes(cmd)){
      const dhikrs = {
        tasbih: 'SubhanAllah - Glory be to Allah (33x)',
        dhikr: 'La ilaha illallah - There is no god but Allah',
        istighfar: 'Astaghfirullah - I seek forgiveness from Allah',
        bismillah: 'Bismillah - In the name of Allah',
        alhamdulillah: 'Alhamdulillah - All praise is due to Allah',
        subhanallah: 'SubhanAllah - Glory be to Allah',
        astaghfirullah: 'Astaghfirullah - I seek forgiveness from Allah'
      };
      await sock.sendMessage(jid, { text: `📿 *DHIKR*\n\n${dhikrs[cmd]}\n\n_Repeat 33x / 100x_\n\nSend .tasbih for another dhikr` }, { quoted: m });
      return true;
    }

    // --- QIBLA ---
    if(cmd==='qibla'){
      await sock.sendMessage(jid, { text: `🧭 *QIBLA*\n\nFrom Nigeria (Lagos): Face North-East (~44°)\nFrom Port Harcourt: Face North-East (~45°)\nFrom Kano: Face East (~67°)\n\nKaaba is in Makkah, Saudi Arabia\n\n_Use compass app for exact direction_` }, { quoted: m });
      return true;
    }

    // --- WUDU / FASTING / SUNNAH ---
    if(cmd==='wudu'){
      await sock.sendMessage(jid, { text: `💧 *HOW TO DO WUDU*\n\n1. Niyyah (intention)\n2. Say Bismillah\n3. Wash hands 3x\n4. Rinse mouth 3x\n5. Rinse nose 3x\n6. Wash face 3x\n7. Wash arms to elbows 3x\n8. Wipe head 1x\n9. Wipe ears 1x\n10. Wash feet to ankles 3x\n\n_Then pray 2 rakats_` }, { quoted: m });
      return true;
    }
    if(cmd==='fasting'){
      await sock.sendMessage(jid, { text: `🌙 *FASTING*\n\nRamadan: Fast from Fajr to Maghrib\nSuhoor: Eat before Fajr\nIftar: Break fast at Maghrib with dates + water\n\nDua for Iftar: Allahumma inni laka sumtu wa bika aamantu` }, { quoted: m });
      return true;
    }
    if(cmd==='sunnah'){
      const sunnahs = ['Use Miswak','Smile - it is Sunnah 😊','Eat with right hand','Say Bismillah before eating','Sleep on right side','Visit the sick','Give charity','Forgive others'];
      await sock.sendMessage(jid, { text: `☪️ *SUNNAH OF THE DAY*\n\n${pick(sunnahs)}` }, { quoted: m });
      return true;
    }
    if(cmd==='prophet' || cmd==='muhammad' || cmd==='seerah'){
      await sock.sendMessage(jid, { text: `☪️ *PROPHET MUHAMMAD (SAW)*\n\nBorn: 570 CE in Makkah\nDied: 632 CE in Madinah\n\nFirst Revelation: Surah Al-Alaq in Cave Hira at age 40\n\n"And We have not sent you except as a mercy to the worlds."\n- Quran 21:107` }, { quoted: m });
      return true;
    }
    if(cmd==='ramadan'){
      await sock.sendMessage(jid, { text: `🌙 *RAMADAN*\n\nMonth of fasting, prayer, and Quran\n\nTaraweeh: Night prayer after Isha\nLaylatul Qadr: Night better than 1000 months (last 10 nights)\n\nUse .prayer Lagos for Iftar time` }, { quoted: m });
      return true;
    }
    if(cmd==='eid'){
      await sock.sendMessage(jid, { text: `🎉 *EID*\n\nEid al-Fitr: After Ramadan\nEid al-Adha: Festival of Sacrifice\n\nEid Mubarak! Taqabbalallahu minna wa minkum` }, { quoted: m });
      return true;
    }
    if(cmd==='jumuah'){
      await sock.sendMessage(jid, { text: `🕌 *JUMU'AH*\n\nFriday Prayer - Obligatory for men\n\nArrive early, listen to Khutbah, pray 2 rakats\n\n"The best day the sun rises is Friday"\n- Sahih Muslim` }, { quoted: m });
      return true;
    }
    if(['taraweeh','laylatulqadr'].includes(cmd)){
      await sock.sendMessage(jid, { text: `🌙 *${cmd.toUpperCase()}*\n\nLaylatul Qadr is better than 1000 months.\nSeek it in last 10 nights of Ramadan.\n\nDua: Allahumma innaka 'afuwwun tuhibbul 'afwa fa'fu 'anni` }, { quoted: m });
      return true;
    }
    if(cmd==='allah'){
      await sock.sendMessage(jid, { text: `☪️ *ALLAH*\n\n"And your Lord says: Call upon Me, I will answer you."\n- Quran 40:60\n\n99 Names: Try .99names 1\nDua: Try .dua` }, { quoted: m });
      return true;
    }
    if(cmd==='islam' || cmd==='muslim'){
      await sock.sendMessage(jid, { text: `☪️ *ISLAM*\n\n5 Pillars:\n1. Shahada - There is no god but Allah, Muhammad is His Messenger\n2. Salah - 5 daily prayers\n3. Zakat - Charity\n4. Sawm - Fasting in Ramadan\n5. Hajj - Pilgrimage to Makkah\n\nUse: .quran 2:255 | .prayer Lagos | .hadith | .dua | .99names` }, { quoted: m });
      return true;
    }
    if(cmd==='islamicquiz' || cmd==='muslimquiz'){
      const qs = [
        { q:'How many Surahs in Quran?', a:'114' },
        { q:'Who was the first Prophet?', a:'Adam (AS)' },
        { q:'In which month was Quran revealed?', a:'Ramadan' },
        { q:'How many daily prayers?', a:'5' },
        { q:'Where is Kaaba?', a:'Makkah' },
        { q:'Who was the last Prophet?', a:'Muhammad (SAW)' },
      ];
      const qq = pick(qs);
      await sock.sendMessage(jid, { text: `🧠 *ISLAMIC QUIZ*\n\n${qq.q}\n\nAnswer: ${qq.a}` }, { quoted: m });
      return true;
    }

    return false;
  }
};
