const { facelessReply, sendAwait } = require('../lib/function');
const axios = require('axios');

// Real free AI - Pollinations (no API key needed)
const POLLI_TEXT = 'https://text.pollinations.ai/';
// Real image - Pollinations image
const POLLI_IMG = 'https://image.pollinations.ai/prompt/';

module.exports = {
  name: "ai",
  async run(sock, m, jid, cmd, args, text, isOwner, isGroup, sender){

    const aiCmds = ['ai','gpt','gemini','imagine','ask','chat','generate','draw'];
    if(!aiCmds.includes(cmd)) return false;

    // ================= AI / GPT / GEMINI / ASK / CHAT - REAL TEXT AI =================
    if(['ai','gpt','gemini','ask','chat'].includes(cmd)){
      await sendAwait(sock, jid, m);
      if(!text){
        await facelessReply(sock, jid, `Usage: .${cmd} <your question>`, m);
        return true;
      }
      try{
        // Use Pollinations text API - real, free
        const res = await axios.get(POLLI_TEXT + encodeURIComponent(`You are FACELESS BOT, a helpful WhatsApp assistant. Answer clearly and briefly. User: ${text}`), {
          timeout: 30000,
          headers: { 'Accept': 'text/plain' }
        });
        let answer = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
        if(!answer || answer.length < 2) throw new Error("Empty");
        await facelessReply(sock, jid, answer.slice(0, 3500), m);
      }catch(e){
        // Fallback: Use DuckDuckGo AI via pollinations backup
        try{
          const res2 = await axios.post('https://text.pollinations.ai/', {
            messages: [{ role: 'user', content: text }],
            model: 'openai'
          }, { timeout: 30000 });
          const ans = res2.data?.choices?.[0]?.message?.content || res2.data;
          await facelessReply(sock, jid, String(ans).slice(0,3500), m);
        }catch(e2){
          await facelessReply(sock, jid, `AI Failed: ${e.message}\nTry Again`, m);
        }
      }
      return true;
    }

    // ================= IMAGINE / GENERATE / DRAW - REAL IMAGE AI =================
    if(['imagine','generate','draw'].includes(cmd)){
      await sendAwait(sock, jid, m);
      if(!text){
        await facelessReply(sock, jid, "Usage: .imagine <describe image>", m);
        return true;
      }
      try{
        const seed = Math.floor(Math.random()*1000000);
        const imgUrl = `${POLLI_IMG}${encodeURIComponent(text)}?width=1024&height=1024&seed=${seed}&nologo=true`;
        // Verify image exists
        await axios.head(imgUrl, { timeout: 15000 });
        await sock.sendMessage(jid, {
          image: { url: imgUrl },
          caption: `▫️ 💀 Imagine: ${text}`
        }, { quoted: m });
      }catch(e){
        await facelessReply(sock, jid, `Image Generation Failed: ${e.message}\nTry Again`, m);
      }
      return true;
    }

    return false;
  }
};
