// 😂 FACELESS - FUN PLUGIN - REAL HANDLER

const JOKES = [
  "Why did the chicken cross the road? To get to the other side 😂",
  "My phone battery lasts longer than my relationships 💀",
  "Why did the scarecrow win an award? He was outstanding in his field 🌾",
  "I told my wife she was drawing her eyebrows too high. She looked surprised 😳",
  "Why don't skeletons fight each other? They don't have the guts 💀",
  "What do you call a fish without eyes? A fsh 🐟",
  "Why did the math book look sad? It had too many problems 📚",
  "I used to be a banker but I lost interest 💸",
  "Why did the Nigerian boy bring ladder to school? Because he wanted to go to high school 😂",
  "NEPA took light, my girlfriend said 'at least we have each other' - I said I need light more 😭",
];
const FACTS = [
  "Honey never expires. Archaeologists found 3000 year old honey still edible 🍯",
  "Bananas are berries, but strawberries are not 🍌",
  "Nigeria has over 500 languages 🇳🇬",
  "Your brain uses 20% of your body's energy 🧠",
  "Octopus has 3 hearts 🐙",
  "Lagos is the largest city in Africa 🌍",
  "Water makes up 60% of your body 💧",
  "The first WhatsApp message was sent in 2009 📱",
];
const QUOTES = [
  "Success is not final, failure is not fatal. - Winston Churchill",
  "Your only limit is you. Push harder.",
  "Don't watch the clock, do what it does. Keep going.",
  "Hustle in silence, let success make noise.",
  "No risk, no reward. No story, no glory.",
  "If you want to be rich, help others get rich first.",
  "Discipline beats motivation every time.",
];
const ROASTS = [
  "Your WiFi is faster than your brain 🧠💀",
  "You look like a 'loading...' screen that never finishes ⏳",
  "Your face is the reason why NEPA takes light 😭",
  "You are so broke, your shadow left you for someone richer 💸",
  "If laziness was a job, you'd be CEO 😂",
  "Your jokes are like MTN network - nobody wants them 📶",
];
const COMPLIMENTS = [
  "You are amazing! Keep shining ✨",
  "Your smile can fix NEPA light 😍",
  "You are smarter than you think 🧠",
  "You have main character energy 👑",
  "You are the reason the group is fun 🎉",
];
const PICKUPS = [
  "Are you WiFi? Because I'm really feeling the connection 📶❤️",
  "Are you NEPA? Because you light up my world 💡",
  "Are you jollof rice? Because I want you every day 🍚❤️",
  "Do you have a map? I keep getting lost in your eyes 🗺️",
  "Are you a bank loan? Because you have my interest 💰",
];
const TRUTHS = ['What is your biggest secret?','Who is your crush?','Have you ever lied to your best friend?','What is your most embarrassing moment?','Have you ever cheated in exam?','Who do you stalk on WhatsApp?'];
const DARES = ['Send a voice note singing','Change your DP for 1 hour','Text your crush hi','Do 10 pushups','Call your best friend and say I love you','Send your last screenshot'];
const FORTUNES = ['Good news is coming this week 🍀','Someone is thinking about you right now ❤️','Money is coming your way 💰','Be careful with who you trust this week 👀','Your hustle will pay off soon 🔥','Love is near, open your eyes 👀❤️'];
const RIZZ = ['You are so fine, even Google cannot find someone like you 🔍','Your smile should be illegal, it is too dangerous 😍','Are you made of copper? Because I Cu in my future ❤️','If beauty was time, you would be eternity ✨'];
const WOULDYOU = ['Would you rather be rich or famous?','Would you rather have 10M naira or true love?','Would you rather never use WhatsApp or never eat jollof?','Would you rather be invisible or fly?','Would you rather live in Lagos or Abuja?'];
const NEVERHAVE = ['Never have I ever cheated in exam','Never have I ever stalked my ex','Never have I ever lied to my parents','Never have I ever cried over a movie','Never have I ever pretended to be asleep'];

function pick(a){ return a[Math.floor(Math.random()*a.length)]; }
function getTarget(m, args){
  const q = m.message?.extendedTextMessage?.contextInfo?.participant;
  if(q) return q;
  const men = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  if(men?.length) return men[0];
  return null;
}

const COMMANDS = ['joke','meme','quote','fact','roast','compliment','pickup','truth','dare','ship','rate','howgay','howcool','simprate','darkjoke','tongue','8ball','fortune','love','kiss','hug','slap','pat','dance','happy','sad','angry','bored','flirt','rizz','cap','wouldyou','neverhave','complimentme','insult'];

module.exports = {
  name: 'fun',
  commands: COMMANDS,
  run: async (sock, m, jid, cmd, args, text, isOwner, isGroup, sender) => {
    if(!COMMANDS.includes(cmd)) return false;

    if(cmd==='joke' || cmd==='darkjoke') { await sock.sendMessage(jid, { text: `😂 *JOKE*\n\n${pick(JOKES)}` }, { quoted: m }); return true; }
    if(cmd==='meme') { await sock.sendMessage(jid, { text: `😂 *MEME*\n\n${pick(JOKES)}\n\n_Meme of the day - send .meme again for another_` }, { quoted: m }); return true; }
    if(cmd==='quote') { await sock.sendMessage(jid, { text: `💭 *QUOTE*\n\n"${pick(QUOTES)}"` }, { quoted: m }); return true; }
    if(cmd==='fact') { await sock.sendMessage(jid, { text: `🧠 *DID YOU KNOW?*\n\n${pick(FACTS)}` }, { quoted: m }); return true; }
    if(cmd==='tongue') { await sock.sendMessage(jid, { text: `👅 *TONGUE TWISTER*\n\nTry saying 5x fast:\n${pick(['She sells seashells by the seashore','Peter Piper picked a peck of pickled peppers','How much wood would a woodchuck chuck','Red lorry yellow lorry'])}` }, { quoted: m }); return true; }
    if(cmd==='fortune') { await sock.sendMessage(jid, { text: `🔮 *FORTUNE*\n\n${pick(FORTUNES)}` }, { quoted: m }); return true; }
    if(cmd==='truth') { await sock.sendMessage(jid, { text: `😏 *TRUTH*\n\n${pick(TRUTHS)}` }, { quoted: m }); return true; }
    if(cmd==='dare') { await sock.sendMessage(jid, { text: `😈 *DARE*\n\n${pick(DARES)}` }, { quoted: m }); return true; }
    if(cmd==='wouldyou') { await sock.sendMessage(jid, { text: `🤔 *WOULD YOU RATHER*\n\n${pick(WOULDYOU)}` }, { quoted: m }); return true; }
    if(cmd==='neverhave') { await sock.sendMessage(jid, { text: `🙈 *NEVER HAVE I EVER*\n\n${pick(NEVERHAVE)}` }, { quoted: m }); return true; }
    if(cmd==='rizz' || cmd==='flirt') { await sock.sendMessage(jid, { text: `😍 *RIZZ*\n\n${pick(RIZZ)}` }, { quoted: m }); return true; }
    if(cmd==='pickup') { await sock.sendMessage(jid, { text: `❤️ *PICKUP LINE*\n\n${pick(PICKUPS)}` }, { quoted: m }); return true; }

    if(cmd==='roast' || cmd==='insult'){
      const t = getTarget(m, args);
      if(!t){ await sock.sendMessage(jid, { text: 'Usage: .roast @user' }, { quoted: m }); return true; }
      await sock.sendMessage(jid, { text: `🔥 *ROAST for @${t.split('@')[0]}*\n\n${pick(ROASTS)}`, mentions:[t] }, { quoted: m });
      return true;
    }
    if(cmd==='compliment' || cmd==='complimentme'){
      const t = getTarget(m, args) || sender;
      await sock.sendMessage(jid, { text: `💖 *COMPLIMENT for @${t.split('@')[0]}*\n\n${pick(COMPLIMENTS)}`, mentions:[t] }, { quoted: m });
      return true;
    }

    if(cmd==='ship'){
      const men = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      if(men.length < 2){ await sock.sendMessage(jid, { text: 'Usage: .ship @user1 @user2' }, { quoted: m }); return true; }
      const pct = Math.floor(Math.random()*101);
      const bar = '❤️'.repeat(Math.floor(pct/20)) + '🤍'.repeat(5-Math.floor(pct/20));
      const verdict = pct>80?'Perfect match! 💍' : pct>50?'Good match! ❤️' : pct>30?'Maybe... 🤔' : 'No match 💔';
      await sock.sendMessage(jid, { text: `💘 *SHIP*\n\n@${men[0].split('@')[0]} ❤️ @${men[1].split('@')[0]}\n\nCompatibility: ${pct}%\n${bar}\n${verdict}`, mentions: men }, { quoted: m });
      return true;
    }

    if(cmd==='love'){
      const t = getTarget(m, args);
      if(!t){ await sock.sendMessage(jid, { text: 'Usage: .love @user' }, { quoted: m }); return true; }
      const pct = Math.floor(Math.random()*101);
      await sock.sendMessage(jid, { text: `❤️ *LOVE CALCULATOR*\n\nYou ❤️ @${t.split('@')[0]}\nLove: ${pct}%\n${pct>70?'True love! 💍':pct>40?'There is chemistry 👀':'Just friends 😅'}`, mentions:[t] }, { quoted: m });
      return true;
    }

    if(['rate','howgay','howcool','simprate'].includes(cmd)){
      const t = getTarget(m, args) || sender;
      const pct = Math.floor(Math.random()*101);
      const label = cmd==='rate'?'Rate' : cmd==='howgay'?'Gay Meter 🌈' : cmd==='howcool'?'Cool Meter 😎' : 'Simp Meter 🥺';
      await sock.sendMessage(jid, { text: `📊 *${label}*\n\n@${t.split('@')[0]} is ${pct}% ${label}\n${'⭐'.repeat(Math.ceil(pct/20))}`, mentions:[t] }, { quoted: m });
      return true;
    }

    if(cmd==='8ball'){
      if(!text){ await sock.sendMessage(jid, { text: 'Usage: .8ball Will I be rich?' }, { quoted: m }); return true; }
      const answers = ['Yes definitely ✅','No, never ❌','Maybe 🤔','Ask again later 🔮','100% YES! 🎉','My reply is no 💀','Signs point to yes ✨','Don\'t count on it 😅'];
      await sock.sendMessage(jid, { text: `🎱 *8BALL*\n\nQ: ${text}\nA: ${pick(answers)}` }, { quoted: m });
      return true;
    }

    if(cmd==='cap'){
      const t = getTarget(m, args) || sender;
      const cap = Math.random()<0.5;
      await sock.sendMessage(jid, { text: `${cap?'🧢 CAP! That is a lie!' : '✅ NO CAP! That is true!'}\nFor @${t.split('@')[0]}`, mentions:[t] }, { quoted: m });
      return true;
    }

    if(['kiss','hug','slap','pat'].includes(cmd)){
      const t = getTarget(m, args);
      if(!t){ await sock.sendMessage(jid, { text: `Usage: .${cmd} @user` }, { quoted: m }); return true; }
      const emojis = { kiss:'💋 Kissed', hug:'🤗 Hugged', slap:'👋 Slapped', pat:'🐾 Patted' };
      await sock.sendMessage(jid, { text: `${emojis[cmd]} @${t.split('@')[0]}\nFrom @${sender.split('@')[0]} ❤️`, mentions:[t,sender] }, { quoted: m });
      return true;
    }

    if(['dance','happy','sad','angry','bored'].includes(cmd)){
      const map = {
        dance:'🕺💃 *DANCE!*\n\nEveryone dance!\n💃🕺💃🕺',
        happy:'😊 *HAPPY!*\n\nYou deserve to be happy today! ✨',
        sad:'😔 *SAD?*\n\nIt will get better. Hug from bot 🤗\nYou are not alone ❤️',
        angry:'😡 *ANGRY?*\n\nTake a deep breath...\nCount 1...2...3... Calm down 🧘',
        bored:'🥱 *BORED?*\n\nTry .joke .quiz .meme .truth\nOr play .tictactoe'
      };
      await sock.sendMessage(jid, { text: map[cmd] }, { quoted: m });
      return true;
    }

    return false;
  }
};
