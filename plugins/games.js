const { facelessReply, sendAwait } = require('../lib/function');

// Real game state - in memory per chat
const games = new Map(); // jid -> { type, answer, ... }
const tttGames = new Map(); // jid -> { board, p1, p2, turn }

const quizData = [
  { q: "What is the capital of Nigeria?", a: "abuja", opts: ["Lagos", "Abuja", "Kano"] },
  { q: "What is 2 + 2 x 3?", a: "8", opts: ["8", "12", "10"] },
  { q: "Which planet is known as Red Planet?", a: "mars", opts: ["Venus", "Mars", "Jupiter"] },
  { q: "Who is the president of Nigeria in 2026?", a: "tinubu", opts: ["Buhari", "Tinubu", "Obi"] },
  { q: "What is the largest ocean?", a: "pacific", opts: ["Atlantic", "Pacific", "Indian"] },
  { q: "How many days in a leap year?", a: "366", opts: ["365", "366", "364"] },
  { q: "What is H2O?", a: "water", opts: ["Water", "Fire", "Air"] },
  { q: "Which animal is man's best friend?", a: "dog", opts: ["Cat", "Dog", "Goat"] }
];
const riddleData = [
  { q: "I speak without a mouth and hear without ears. What am I?", a: "echo" },
  { q: "What has keys but can't open locks?", a: "piano" },
  { q: "The more you take, the more you leave behind. What am I?", a: "footsteps" },
  { q: "What has a face and two hands but no arms or legs?", a: "clock" },
  { q: "What comes once in a minute, twice in a moment, but never in a thousand years?", a: "m" }
];

function formatTTT(board){
  const e = (i) => board[i] || `${i+1}️⃣`;
  return `${e(0)} ${e(1)} ${e(2)}\n${e(3)} ${e(4)} ${e(5)}\n${e(6)} ${e(7)} ${e(8)}`;
}
function checkWin(b){
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for(const [a,c,d] of lines) if(b[a] && b[a]===b[c] && b[a]===b[d]) return b[a];
  if(b.every(x => x)) return 'draw';
  return null;
}

module.exports = {
  name: "games",
  games, tttGames,

  // ===== REAL ANSWER CHECKER - Called from index.js before commands =====
  async handleAnswer(sock, m, jid, text, sender){
    const g = games.get(jid);
    if(!g) return false;
    const ans = text.trim().toLowerCase();

    // Skip if it's a command
    if(ans.startsWith('.')) return false;

    if(g.type === 'quiz' || g.type === 'riddle' || g.type === 'math' || g.type === 'guess'){
      if(ans === g.answer.toString().toLowerCase()){
        games.delete(jid);
        await facelessReply(sock, jid, `Correct! @${sender.split('@')[0]} You Win! Answer: ${g.answer}`, m);
        // Give economy reward if economy plugin exists
        try{
          const econ = require('./economy');
          econ.addCoins(sender, 50);
        }catch{}
        return true;
      } else {
        // Don't spam for every message, only if game is active and user tried
        return false;
      }
    }
    return false;
  },

  // ===== REAL TTT MOVE HANDLER =====
  async handleTTT(sock, m, jid, text, sender){
    const g = tttGames.get(jid);
    if(!g) return false;
    if(!text.match(/^[1-9]$/)) return false;
    if(sender !== g.turn){
      return false;
    }
    const pos = parseInt(text) - 1;
    if(g.board[pos]){
      await facelessReply(sock, jid, "That Position Is Taken, Choose Another", m);
      return true;
    }
    const mark = sender === g.p1 ? '❌' : '⭕';
    g.board[pos] = mark;
    const win = checkWin(g.board);
    if(win === 'draw'){
      tttGames.delete(jid);
      await facelessReply(sock, jid, `Draw!\n\n${formatTTT(g.board)}`, m);
      return true;
    }
    if(win){
      tttGames.delete(jid);
      await facelessReply(sock, jid, `Winner: @${sender.split('@')[0]} (${win})\n\n${formatTTT(g.board)}`, m);
      return true;
    }
    g.turn = g.turn === g.p1 ? g.p2 : g.p1;
    await sock.sendMessage(jid, { text: `▫️ 💀 TicTacToe\n\n${formatTTT(g.board)}\n\nTurn: @${g.turn.split('@')[0]} - Send 1-9`, mentions: [g.turn] }, { quoted: m });
    return true;
  },

  async run(sock, m, jid, cmd, args, text, isOwner, isGroup, sender){

    const gameCmds = ['quiz','riddle','math','guess','slot','dice','coinflip','flip','rps','tictactoe','ttt','stopgame'];
    if(!gameCmds.includes(cmd)) return false;

    // ================= QUIZ =================
    if(cmd === 'quiz'){
      await sendAwait(sock, jid, m);
      const q = quizData[Math.floor(Math.random()*quizData.length)];
      games.set(jid, { type:'quiz', answer: q.a, timeout: setTimeout(()=>games.delete(jid), 60000) });
      await facelessReply(sock, jid, `Quiz:\n${q.q}\nOptions: ${q.opts.join(' | ')}\nReply With Answer - 60s`, m);
      return true;
    }

    // ================= RIDDLE =================
    if(cmd === 'riddle'){
      await sendAwait(sock, jid, m);
      const r = riddleData[Math.floor(Math.random()*riddleData.length)];
      games.set(jid, { type:'riddle', answer: r.a });
      await facelessReply(sock, jid, `Riddle:\n${r.q}\nReply With Answer`, m);
      return true;
    }

    // ================= MATH =================
    if(cmd === 'math'){
      await sendAwait(sock, jid, m);
      const a = Math.floor(Math.random()*20)+1;
      const b = Math.floor(Math.random()*20)+1;
      const ops = ['+','-','*'];
      const op = ops[Math.floor(Math.random()*ops.length)];
      let ans = op==='+' ? a+b : op==='-' ? a-b : a*b;
      games.set(jid, { type:'math', answer: ans });
      await facelessReply(sock, jid, `Math:\nWhat is ${a} ${op} ${b} ?\nReply With Answer`, m);
      return true;
    }

    // ================= GUESS =================
    if(cmd === 'guess'){
      await sendAwait(sock, jid, m);
      const num = Math.floor(Math.random()*100)+1;
      games.set(jid, { type:'guess', answer: num });
      await facelessReply(sock, jid, `Guess:\nI Have A Number Between 1-100\nReply With Your Guess`, m);
      return true;
    }

    // ================= SLOT - REAL RANDOM =================
    if(cmd === 'slot'){
      await sendAwait(sock, jid, m);
      const emojis = ['🍒','🍋','🔔','💎','7️⃣','🍇','⭐'];
      const s1 = emojis[Math.floor(Math.random()*emojis.length)];
      const s2 = emojis[Math.floor(Math.random()*emojis.length)];
      const s3 = emojis[Math.floor(Math.random()*emojis.length)];
      let result = "You Lose!";
      let winCoins = 0;
      if(s1===s2 && s2===s3){ result = "JACKPOT! You Win 500 Coins"; winCoins = 500; }
      else if(s1===s2 || s2===s3 || s1===s3){ result = "You Win 100 Coins"; winCoins = 100; }
      if(winCoins>0){
        try{ require('./economy').addCoins(sender, winCoins); }catch{}
      }
      await facelessReply(sock, jid, `Slot Machine:\n[ ${s1} | ${s2} | ${s3} ]\n${result}`, m);
      return true;
    }

    // ================= DICE =================
    if(cmd === 'dice'){
      await sendAwait(sock, jid, m);
      const d = Math.floor(Math.random()*6)+1;
      await facelessReply(sock, jid, `Dice Rolled: ${d} 🎲`, m);
      return true;
    }

    // ================= COINFLIP =================
    if(cmd === 'coinflip' || cmd === 'flip'){
      await sendAwait(sock, jid, m);
      const choice = (args[0]||"").toLowerCase();
      const flip = Math.random() < 0.5 ? 'heads' : 'tails';
      if(choice && (choice==='heads' || choice==='tails')){
        const win = choice === flip;
        await facelessReply(sock, jid, `Coin: ${flip}\nYou Chose: ${choice}\n${win ? 'You Win!' : 'You Lose!'}`, m);
      } else {
        await facelessReply(sock, jid, `Coin: ${flip}\nUsage: .coinflip heads / tails`, m);
      }
      return true;
    }

    // ================= RPS =================
    if(cmd === 'rps'){
      await sendAwait(sock, jid, m);
      const choice = (args[0]||"").toLowerCase();
      const valid = ['rock','paper','scissors'];
      if(!valid.includes(choice)){
        await facelessReply(sock, jid, "Usage: .rps rock / paper / scissors", m);
        return true;
      }
      const bot = valid[Math.floor(Math.random()*3)];
      let res = "Draw!";
      if((choice==='rock' && bot==='scissors') || (choice==='paper' && bot==='rock') || (choice==='scissors' && bot==='paper')) res = "You Win!";
      else if(choice !== bot) res = "Bot Wins!";
      await facelessReply(sock, jid, `RPS:\nYou: ${choice}\nBot: ${bot}\n${res}`, m);
      return true;
    }

    // ================= TICTACTOE =================
    if(cmd === 'tictactoe' || cmd === 'ttt'){
      await sendAwait(sock, jid, m);
      const ctx = m.message?.extendedTextMessage?.contextInfo;
      const opponent = ctx?.mentionedJid?.[0];
      if(!opponent){
        await facelessReply(sock, jid, "Usage: .tictactoe @opponent", m);
        return true;
      }
      if(tttGames.has(jid)){
        await facelessReply(sock, jid, "A Game Is Already Running In This Chat", m);
        return true;
      }
      tttGames.set(jid, { board: Array(9).fill(null), p1: sender, p2: opponent, turn: sender });
      await sock.sendMessage(jid, {
        text: `▫️ 💀 TicTacToe Started\n\n${formatTTT(Array(9).fill(null))}\n\n@${sender.split('@')[0]} (❌) vs @${opponent.split('@')[0]} (⭕)\nTurn: @${sender.split('@')[0]} - Send 1-9`,
        mentions: [sender, opponent]
      }, { quoted: m });
      return true;
    }

    // ================= STOPGAME =================
    if(cmd === 'stopgame'){
      await sendAwait(sock, jid, m);
      games.delete(jid);
      tttGames.delete(jid);
      await facelessReply(sock, jid, "Game Stopped", m);
      return true;
    }

    return false;
  }
};
