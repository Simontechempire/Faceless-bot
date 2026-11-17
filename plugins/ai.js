// 🤖 FACELESS - AI PLUGIN - REAL HANDLER
// Uses Pollinations free AI (no API key) for text + image

async function aiText(prompt, system='You are FACELESS, a helpful WhatsApp bot. Reply short, fun, in Nigerian style when user is Nigerian.'){
  try{
    const res = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify([
        { role:'system', content: system },
        { role:'user', content: prompt }
      ])
    });
    if(!res.ok) return null;
    const txt = await res.text();
    return txt?.trim() || null;
  }catch{ return null; }
}
async function aiImage(prompt){
  // Pollinations image - returns URL, we fetch buffer
  try{
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random()*99999)}`;
    const res = await fetch(url);
    if(!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  }catch{ return null; }
}

const COMMANDS = ['ai','gpt','chat','ask','imagine','image','draw','dalle','gemini','claude','llama','copilot','code','explain','translateai','summarize','story','poem','roastai','advice','motivate','business','essay','caption','bio','name','jokeai','whatif','debate','dream','horoscope'];

module.exports = {
  name: 'ai',
  commands: COMMANDS,
  run: async (sock, m, jid, cmd, args, text, isOwner, isGroup, sender) => {
    if(!COMMANDS.includes(cmd)) return false;
    if(!text && !['advice','motivate','horoscope'].includes(cmd)){
      await sock.sendMessage(jid, { text: `Usage: .${cmd} <your question>\nExample: .${cmd} ${cmd.includes('imagine')||cmd==='image'||cmd==='draw'||cmd==='dalle'?'A lion in Lagos':'How to make money?'}` }, { quoted: m });
      return true;
    }

    // --- IMAGE GENERATION ---
    if(['imagine','image','draw','dalle'].includes(cmd)){
      await sock.sendMessage(jid, { text: '🎨 Generating image...' }, { quoted: m });
      const buf = await aiImage(text);
      if(!buf){ await sock.sendMessage(jid, { text: '❌ Image generation failed. Try again.' }, { quoted: m }); return true; }
      await sock.sendMessage(jid, { image: buf, caption: `🎨 *AI Image*\nPrompt: ${text}` }, { quoted: m });
      return true;
    }

    // --- CODE ---
    if(cmd==='code'){
      await sock.sendMessage(jid, { text: '💻 Writing code...' }, { quoted: m });
      const ans = await aiText(`Write code for: ${text}. Give only code with brief explanation. Use JavaScript unless user asks other language.`, 'You are a senior programmer. Write clean working code.');
      await sock.sendMessage(jid, { text: ans || '❌ AI failed, try again' }, { quoted: m });
      return true;
    }

    // --- EXPLAIN ---
    if(cmd==='explain'){
      await sock.sendMessage(jid, { text: '🧠 Explaining...' }, { quoted: m });
      const ans = await aiText(`Explain this simply like I am 15 years old: ${text}`, 'You explain things simply with examples.');
      await sock.sendMessage(jid, { text: ans || '❌ AI failed' }, { quoted: m });
      return true;
    }

    // --- SUMMARIZE ---
    if(cmd==='summarize'){
      await sock.sendMessage(jid, { text: '📝 Summarizing...' }, { quoted: m });
      const ans = await aiText(`Summarize this in short bullet points: ${text}`);
      await sock.sendMessage(jid, { text: ans || '❌ AI failed' }, { quoted: m });
      return true;
    }

    // --- STORY / POEM / ESSAY ---
    if(cmd==='story'){ const ans = await aiText(`Write a short interesting story about: ${text}. Make it fun, Nigerian style if possible.`); await sock.sendMessage(jid, { text: `📖 *STORY*\n\n${ans||'❌ AI failed'}` }, { quoted: m }); return true; }
    if(cmd==='poem'){ const ans = await aiText(`Write a beautiful poem about: ${text}`); await sock.sendMessage(jid, { text: `✍️ *POEM*\n\n${ans||'❌ AI failed'}` }, { quoted: m }); return true; }
    if(cmd==='essay'){ const ans = await aiText(`Write a short essay about: ${text}. 300 words.`); await sock.sendMessage(jid, { text: `📝 *ESSAY*\n\n${ans||'❌ AI failed'}` }, { quoted: m }); return true; }
    if(cmd==='caption'){ const ans = await aiText(`Write 5 catchy Instagram captions for: ${text}. With emojis and hashtags.`); await sock.sendMessage(jid, { text: `📸 *CAPTIONS*\n\n${ans||'❌ AI failed'}` }, { quoted: m }); return true; }
    if(cmd==='bio'){ const ans = await aiText(`Write 5 cool WhatsApp / Instagram bio for: ${text}. Short, with emojis.`); await sock.sendMessage(jid, { text: `👤 *BIO IDEAS*\n\n${ans||'❌ AI failed'}` }, { quoted: m }); return true; }
    if(cmd==='name'){ const ans = await aiText(`Suggest 10 cool business / baby / brand names for: ${text}. Explain why each is good.`); await sock.sendMessage(jid, { text: `💡 *NAME IDEAS*\n\n${ans||'❌ AI failed'}` }, { quoted: m }); return true; }
    if(cmd==='business'){ const ans = await aiText(`Give a business plan / idea for: ${text}. Include cost in Naira, how to start, how to make profit in Nigeria.`); await sock.sendMessage(jid, { text: `💼 *BUSINESS IDEA*\n\n${ans||'❌ AI failed'}` }, { quoted: m }); return true; }
    if(cmd==='roastai'){ const ans = await aiText(`Roast this person / thing in a funny, not mean way: ${text}. Nigerian humor.`); await sock.sendMessage(jid, { text: `🔥 *AI ROAST*\n\n${ans||'❌ AI failed'}` }, { quoted: m }); return true; }
    if(cmd==='dream'){ const ans = await aiText(`Interpret this dream: ${text}. Spiritual + psychological meaning, Nigerian context.`); await sock.sendMessage(jid, { text: `💭 *DREAM MEANING*\n\n${ans||'❌ AI failed'}` }, { quoted: m }); return true; }
    if(cmd==='debate'){ const ans = await aiText(`Give strong arguments for BOTH sides of: ${text}. Balanced, then give your verdict.`); await sock.sendMessage(jid, { text: `⚖️ *DEBATE*\n\n${ans||'❌ AI failed'}` }, { quoted: m }); return true; }
    if(cmd==='whatif'){ const ans = await aiText(`What if: ${text} ? Write a fun creative scenario.`); await sock.sendMessage(jid, { text: `🤔 *WHAT IF*\n\n${ans||'❌ AI failed'}` }, { quoted: m }); return true; }
    if(cmd==='horoscope'){ const ans = await aiText(`Give today's horoscope for ${text||'everyone'}. Positive, fun.`); await sock.sendMessage(jid, { text: `🔮 *HOROSCOPE*\n\n${ans||'❌ AI failed'}` }, { quoted: m }); return true; }

    // --- ADVICE / MOTIVATE / JOKEAI ---
    if(cmd==='advice'){ const ans = await aiText(`Give practical advice about: ${text||'life'}`); await sock.sendMessage(jid, { text: `💡 *ADVICE*\n\n${ans||'❌ AI failed'}` }, { quoted: m }); return true; }
    if(cmd==='motivate'){ const ans = await aiText(`Motivate me about: ${text||'hustling and not giving up'}. Short, powerful.`); await sock.sendMessage(jid, { text: `🔥 *MOTIVATION*\n\n${ans||'❌ AI failed'}` }, { quoted: m }); return true; }
    if(cmd==='jokeai'){ const ans = await aiText(`Tell a funny joke about: ${text||'Nigeria'}. Very funny.`); await sock.sendMessage(jid, { text: `😂 *AI JOKE*\n\n${ans||'❌ AI failed'}` }, { quoted: m }); return true; }

    // --- TRANSLATE AI ---
    if(cmd==='translateai'){
      // .translateai fr Hello  OR .translateai Hello to French
      const ans = await aiText(`Translate this to the language user asked, if no language, translate to French: ${text}`);
      await sock.sendMessage(jid, { text: `🌍 *AI TRANSLATE*\n\n${ans||'❌ AI failed'}` }, { quoted: m });
      return true;
    }

    // --- MAIN AI / GPT / GEMINI / CLAUDE / LLAMA / COPILOT / CHAT / ASK ---
    const modelName = cmd==='gemini'?'Gemini' : cmd==='claude'?'Claude' : cmd==='llama'?'Llama' : cmd==='copilot'?'Copilot' : cmd==='gpt'?'GPT' : 'FACELESS AI';
    await sock.sendMessage(jid, { text: `🤖 ${modelName} thinking...` }, { quoted: m });
    // Check if replying to image - user wants AI to describe image? Tell them
    const ans = await aiText(text);
    if(!ans){ await sock.sendMessage(jid, { text: '❌ AI is busy. Try again in 30 seconds.' }, { quoted: m }); return true; }
    await sock.sendMessage(jid, { text: ans.slice(0, 4000) }, { quoted: m });
    return true;
  }
};
