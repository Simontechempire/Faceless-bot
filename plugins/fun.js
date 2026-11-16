const { facelessReply, sendAwait } = require('../lib/function');
const axios = require('axios');

// Real lists - no API needed for these
const truths = [
  "What is your biggest secret no one knows?",
  "Who is your current crush?",
  "Have you ever lied to your best friend?",
  "What is the most embarrassing thing you have done?",
  "Have you ever cheated in an exam?",
  "Who do you stalk on WhatsApp?",
  "What is your biggest fear?",
  "Have you ever cried because of love?",
  "What is the last lie you told?",
  "Who is the last person you thought about before sleeping?"
];
const dares = [
  "Send a voice note singing any song",
  "Change your DP to a funny face for 1 hour",
  "Text your crush 'Hi' right now",
  "Send your last screenshot to the group",
  "Do 10 pushups and send video",
  "Call the last person you chatted and say I love you",
  "Send a voice note in a funny accent",
  "Write your name with your leg in the air and send pic",
  "Text your ex 'I miss you'",
  "Dance and send video in group"
];
const roasts = [
  "Your brain is like WiFi, weak signal and always disconnecting",
  "You are proof that evolution can go backwards",
  "If ugliness was a job, you would be CEO",
  "Your face makes onions cry",
  "You are like a cloud, when you disappear the day gets brighter",
  "You have the personality of a broken charger",
  "Even Google cannot find your sense",
  "You are the reason shampoo has instructions"
];
const compliments = [
  "You are genuinely one of the smartest people in this group",
  "Your smile can fix a bad day",
  "You have a heart of gold, keep shining",
  "You are more beautiful than you think",
  "Your energy is contagious, in a good way",
  "You are a rare gem, don't let anyone dim your light",
  "You make this group fun",
  "You are talented and you don't even know it"
];

// Deterministic % based on JID so same person gets same rate (real, not fake random each time)
function stablePercent(seed){
  let h = 0;
  for(let i=0;i<seed.length;i++) h = (h*31 + seed.charCodeAt(i)) % 100;
  return (h % 101);
}

module.exports = {
  name: "fun",
  async run(sock, m, jid, cmd, args, text, isOwner, isGroup, sender){

    const funCmds = ['joke','quote','fact','roast','compliment','truth','dare','ship','gayrate','beautiful','ugly','smart','handsome','dumb','luck'];
    if(!funCmds.includes(cmd)) return false;

    const getTarget = () => {
      const ctx = m.message?.extendedTextMessage?.contextInfo;
      if(ctx?.mentionedJid?.length) return ctx.mentionedJid[0];
      if(ctx?.participant) return ctx.participant;
      if(args[0]) return args[0].replace(/[^0-9]/g,'') + '@s.whatsapp.net';
      return sender;
    };
    const target = getTarget();
    const targetName = `@${target.split('@')[0]}`;

    // ================= JOKE - REAL API =================
    if(cmd === 'joke'){
      await sendAwait(sock, jid, m);
      try{
        const res = await axios.get('https://official-joke-api.appspot.com/random_joke');
        await facelessReply(sock, jid, `Joke:\n${res.data.setup}\n\n${res.data.punchline}`, m);
      }catch{
        await facelessReply(sock, jid, `Joke:\nWhy did the chicken cross the road?\nTo get to the other side!`, m);
      }
      return true;
    }

    // ================= QUOTE - REAL API =================
    if(cmd === 'quote'){
      await sendAwait(sock, jid, m);
      try{
        const res = await axios.get('https://api.quotable.io/random');
        await facelessReply(sock, jid, `Quote:\n"${res.data.content}"\n- ${res.data.author}`, m);
      }catch{
        await facelessReply(sock, jid, `Quote:\n"Success is not final, failure is not fatal"\n- Winston Churchill`, m);
      }
      return true;
    }

    // ================= FACT - REAL API =================
    if(cmd === 'fact'){
      await sendAwait(sock, jid, m);
      try{
        const res = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
        await facelessReply(sock, jid, `Fact:\n${res.data.text}`, m);
      }catch{
        await facelessReply(sock, jid, `Fact:\nHoney never spoils, archaeologists found 3000 year old honey still edible`, m);
      }
      return true;
    }

    // ================= ROAST =================
    if(cmd === 'roast'){
      await sendAwait(sock, jid, m);
      const r = roasts[Math.floor(Math.random()*roasts.length)];
      await sock.sendMessage(jid, { text: `▫️ 💀 Roast For ${targetName}\n\n${r}`, mentions: [target] }, { quoted: m });
      return true;
    }

    // ================= COMPLIMENT =================
    if(cmd === 'compliment'){
      await sendAwait(sock, jid, m);
      const c = compliments[Math.floor(Math.random()*compliments.length)];
      await sock.sendMessage(jid, { text: `▫️ 💀 Compliment For ${targetName}\n\n${c}`, mentions: [target] }, { quoted: m });
      return true;
    }

    // ================= TRUTH =================
    if(cmd === 'truth'){
      await sendAwait(sock, jid, m);
      const t = truths[Math.floor(Math.random()*truths.length)];
      await sock.sendMessage(jid, { text: `▫️ 💀 Truth For ${targetName}\n\n${t}`, mentions: [target] }, { quoted: m });
      return true;
    }

    // ================= DARE =================
    if(cmd === 'dare'){
      await sendAwait(sock, jid, m);
      const d = dares[Math.floor(Math.random()*dares.length)];
      await sock.sendMessage(jid, { text: `▫️ 💀 Dare For ${targetName}\n\n${d}`, mentions: [target] }, { quoted: m });
      return true;
    }

    // ================= SHIP - REAL: two users =================
    if(cmd === 'ship'){
      await sendAwait(sock, jid, m);
      const ctx = m.message?.extendedTextMessage?.contextInfo;
      const mentions = ctx?.mentionedJid || [];
      const user1 = mentions[0] || sender;
      const user2 = mentions[1] || (mentions[0] ? sender : null);
      if(!user2){
        await facelessReply(sock, jid, "Usage: .ship @user1 @user2", m);
        return true;
      }
      const pct = stablePercent(user1 + user2);
      let msg = pct > 80 ? "Perfect Match! Marry Now" : pct > 60 ? "Good Match, Try Dating" : pct > 40 ? "Manageable, Work On It" : "No Match, Just Friends";
      await sock.sendMessage(jid, {
        text: `▫️ 💀 Ship\n\n@${user1.split('@')[0]} ❤️ @${user2.split('@')[0]}\nLove: ${pct}%\n${msg}`,
        mentions: [user1, user2]
      }, { quoted: m });
      return true;
    }

    // ================= RATE COMMANDS - REAL STABLE % =================
    if(['gayrate','beautiful','ugly','smart','handsome','dumb','luck'].includes(cmd)){
      await sendAwait(sock, jid, m);
      const pct = stablePercent(target + cmd);
      const labels = {
        gayrate: 'Gay Rate',
        beautiful: 'Beauty Rate',
        ugly: 'Ugly Rate',
        smart: 'Smart Rate',
        handsome: 'Handsome Rate',
        dumb: 'Dumb Rate',
        luck: 'Luck Rate'
      };
      const bar = '█'.repeat(Math.floor(pct/10)) + '░'.repeat(10 - Math.floor(pct/10));
      await sock.sendMessage(jid, {
        text: `▫️ 💀 ${labels[cmd]} For ${targetName}\n\n${bar} ${pct}%`,
        mentions: [target]
      }, { quoted: m });
      return true;
    }

    return false;
  }
};
