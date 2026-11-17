// 🎮 FACELESS - GAME PLUGIN - REAL HANDLER
const fs = require('fs');

const COMMANDS = ['tictactoe','quiz','riddle','trivia','math','guess','guessnumber','guessword','wordchain','scramble','rps','coinflip','dice','truth','dare','hangman','slots','memory','fasttype','puzzle'];

// Real per-chat game state - not fake
global.gameState = global.gameState || new Map();
function getGame(jid){ return global.gameState.get(jid); }
function setGame(jid, g){ global.gameState.set(jid, g); }
function clearGame(jid){ global.gameState.delete(jid); }

const QUIZ = [
  {q:'What is the capital of Nigeria?', a:'abuja', opts:['Lagos','Abuja','Kano','Ibadan']},
  {q:'What is 12 x 8?', a:'96', opts:['96','84','108','72']},
  {q:'Which planet is called Red Planet?', a:'mars', opts:['Venus','Mars','Jupiter','Saturn']},
  {q:'What is H2O?', a:'water', opts:['Salt','Water','Oxygen','Fire']},
  {q:'Who is the richest man in Nigeria?', a:'dangote', opts:['Dangote','Otedola','Adenuga','Buhari']},
  {q:'What year did Nigeria gain independence?', a:'1960', opts:['1960','1963','1970','1959']},
];
const RIDDLES = [
  {q:'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?', a:'echo'},
  {q:'The more you take, the more you leave behind. What am I?', a:'footsteps'},
  {q:'What has keys but cannot open locks?', a:'piano'},
  {q:'What gets wetter the more it dries?', a:'towel'},
];
const TRUTHS = ['What is your biggest secret?','Who is your crush?','Have you ever lied to your best friend?','What is your most embarrassing moment?','Have you ever cheated in exam?'];
const DARES = ['Send a voice note singing','Change your DP for 1 hour','Text your crush hi','Do 10 pushups and send video','Call your best friend and say I love you'];
const WORDS = ['faceless','whatsapp','nigeria','lagos','python','javascript','football','champion','diamond','warri'];
const SCRAMBLE_WORDS = ['faceless','bot','lagos','warri','money','phone','school','friend'];

function shuffle(a){ return a.sort(()=>Math.random()-0.5); }
function scramble(w){ return shuffle(w.split('')).join(''); }
function boardStr(b){ return `${b[0]||'1'} | ${b[1]||'2'} | ${b[2]||'3'}\n---------\n${b[3]||'4'} | ${b[4]||'5'} | ${b[5]||'6'}\n---------\n${b[6]||'7'} | ${b[7]||'8'} | ${b[8]||'9'}`; }
function checkWin(b, s){ const w=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]; return w.some(c=>c.every(i=>b[i]===s)); }

module.exports = {
  name: 'game',
  commands: COMMANDS,

  // Real answer handler - index.js will call this for every message
  onMessage: async (sock, m, jid) => {
    const g = getGame(jid);
    if(!g) return;
    const body = (m.body||'').trim().toLowerCase();
    if(body.startsWith('.')) return; // command, not answer
    if(m.sender !== g.player && g.type !== 'tictactoe' && g.type !== 'wordchain') return;

    try{
      // QUIZ / TRIVIA / MATH / GUESSNUMBER / GUESSWORD / SCRAMBLE / HANGMAN / MEMORY / FASTTYPE
      if(['quiz','trivia','math','guessnumber','guessword','scramble','hangman','memory','fasttype','puzzle'].includes(g.type)){
        // HANGMAN - single letter
        if(g.type === 'hangman'){
          if(body.length !== 1 || !/^[a-z]$/.test(body)) return;
          if(g.guessed.includes(body)){ await sock.sendMessage(jid, { text: `Already guessed ${body}` }); return; }
          g.guessed.push(body);
          if(g.word.includes(body)){
            const display = g.word.split('').map(c=>g.guessed.includes(c)?c:'_').join(' ');
            if(!display.includes('_')){
              await sock.sendMessage(jid, { text: `🎉 You won! Word was *${g.word}*` });
              clearGame(jid); return;
            }
            await sock.sendMessage(jid, { text: `✅ Correct!\n${display}\nGuessed: ${g.guessed.join(', ')} | Lives: ${g.lives}` });
          } else {
            g.lives--;
            if(g.lives <= 0){ await sock.sendMessage(jid, { text: `💀 Game over! Word was *${g.word}*` }); clearGame(jid); return; }
            const display = g.word.split('').map(c=>g.guessed.includes(c)?c:'_').join(' ');
            await sock.sendMessage(jid, { text: `❌ Wrong!\n${display}\nLives: ${g.lives} | Guessed: ${g.guessed.join(', ')}` });
          }
          return;
        }

        // FASTTYPE - must type exactly
        if(g.type === 'fasttype'){
          if(body === g.answer){
            const time = ((Date.now()-g.start)/1000).toFixed(1);
            await sock.sendMessage(jid, { text: `⚡ FAST! You typed it in ${time}s\nWord: ${g.answer}` });
            clearGame(jid);
          }
          return;
        }

        // MEMORY - repeat sequence
        if(g.type === 'memory'){
          if(body === g.answer){
            await sock.sendMessage(jid, { text: `🧠 Correct! You remembered: ${g.answer}` });
            clearGame(jid);
          } else {
            await sock.sendMessage(jid, { text: `❌ Wrong. Sequence was: ${g.answer}` });
            clearGame(jid);
          }
          return;
        }

        // General answer check
        if(body === g.answer || body === g.answer.toLowerCase()){
          await sock.sendMessage(jid, { text: `✅ Correct! 🎉\nAnswer: ${g.answer}\n+100 points` });
          clearGame(jid);
        } else {
          g.tries = (g.tries||0)+1;
          if(g.type === 'guessnumber'){
            const num = parseInt(body);
            if(!isNaN(num)){
              const hint = num < parseInt(g.answer) ? '🔼 Higher!' : '🔽 Lower!';
              if(g.tries >= 5){ await sock.sendMessage(jid, { text: `💀 Out of tries! Number was ${g.answer}` }); clearGame(jid); return; }
              await sock.sendMessage(jid, { text: `${hint} Tries left: ${5-g.tries}` });
              return;
            }
          }
          if(g.tries >= 3){ await sock.sendMessage(jid, { text: `❌ Wrong! Answer was: *${g.answer}*` }); clearGame(jid); return; }
          await sock.sendMessage(jid, { text: `❌ Wrong! Try again (${g.tries}/3)` });
        }
        return;
      }

      // TICTACTOE - 1-9 move
      if(g.type === 'tictactoe'){
        const pos = parseInt(body)-1;
        if(isNaN(pos) || pos<0 || pos>8) return;
        if(g.board[pos]){ await sock.sendMessage(jid, { text: 'That spot is taken!' }); return; }
        // Only allow current player
        if(m.sender !== g.turn){ await sock.sendMessage(jid, { text: 'Not your turn!' }); return; }
        g.board[pos] = g.turn === g.p1 ? '❌' : '⭕';
        if(checkWin(g.board, g.board[pos])){
          await sock.sendMessage(jid, { text: `🏆 @${m.sender.split('@')[0]} wins!\n\n${boardStr(g.board)}`, mentions:[m.sender] });
          clearGame(jid); return;
        }
        if(g.board.every(c=>c)){
          await sock.sendMessage(jid, { text: `🤝 Draw!\n\n${boardStr(g.board)}` });
          clearGame(jid); return;
        }
        g.turn = g.turn === g.p1 ? g.p2 : g.p1;
        // Bot move if playing vs bot
        if(g.vsBot && g.turn === 'bot'){
          const empty = g.board.map((c,i)=>!c?i:-1).filter(i=>i>=0);
          const pick = empty[Math.floor(Math.random()*empty.length)];
          g.board[pick] = '⭕';
          if(checkWin(g.board,'⭕')){ await sock.sendMessage(jid, { text: `🤖 Bot wins!\n\n${boardStr(g.board)}` }); clearGame(jid); return; }
          if(g.board.every(c=>c)){ await sock.sendMessage(jid, { text: `🤝 Draw!\n\n${boardStr(g.board)}` }); clearGame(jid); return; }
          g.turn = g.p1;
        }
        await sock.sendMessage(jid, { text: `🎮 TicTacToe\n\n${boardStr(g.board)}\n\nTurn: @${g.turn==='bot'?'Bot':g.turn.split('@')[0]}`, mentions: g.turn==='bot'?[]:[g.turn] });
        return;
      }

      // WORDCHAIN - next word must start with last letter
      if(g.type === 'wordchain'){
        if(!/^[a-z]+$/.test(body)) return;
        if(g.used.includes(body)){ await sock.sendMessage(jid, { text: 'Word already used!' }); return; }
        if(g.lastLetter && !body.startsWith(g.lastLetter)){ await sock.sendMessage(jid, { text: `Must start with *${g.lastLetter.toUpperCase()}*` }); return; }
        g.used.push(body);
        g.lastLetter = body.slice(-1);
        await sock.sendMessage(jid, { text: `✅ ${body}\nNext must start with *${g.lastLetter.toUpperCase()}*\nWords used: ${g.used.length}` });
        return;
      }
    }catch(e){ console.log('game onMessage', e.message); }
  },

  run: async (sock, m, jid, cmd, args, text, isOwner, isGroup, sender) => {
    if(!COMMANDS.includes(cmd)) return false;

    // Instant games - no state
    if(cmd === 'rps'){
      const choice = (args[0]||'').toLowerCase();
      if(!['rock','paper','scissors'].includes(choice)){ await sock.sendMessage(jid, { text: 'Usage: .rps rock / paper / scissors' }, { quoted: m }); return true; }
      const bot = ['rock','paper','scissors'][Math.floor(Math.random()*3)];
      const win = (choice==='rock'&&bot==='scissors')||(choice==='paper'&&bot==='rock')||(choice==='scissors'&&bot==='paper');
      const draw = choice===bot;
      await sock.sendMessage(jid, { text: `✂️ *RPS*\nYou: ${choice}\nBot: ${bot}\n\n${draw?'🤝 Draw!':win?'🎉 You win!':'💀 Bot wins!'}` }, { quoted: m });
      return true;
    }
    if(cmd === 'coinflip'){
      const r = Math.random()<0.5?'Heads':'Tails';
      await sock.sendMessage(jid, { text: `🪙 CoinFlip: *${r}*\n${args[0] ? (args[0].toLowerCase()===r.toLowerCase()?'🎉 You guessed right!':'❌ Wrong guess') : ''}` }, { quoted: m });
      return true;
    }
    if(cmd === 'dice'){
      const n = Math.floor(Math.random()*6)+1;
      await sock.sendMessage(jid, { text: `🎲 Dice: *${n}*\n${'🎲'.repeat(n)}` }, { quoted: m });
      return true;
    }
    if(cmd === 'slots'){
      const s = ['🍒','🍋','🔔','💎','⭐','7️⃣'];
      const a = s[Math.floor(Math.random()*s.length)], b = s[Math.floor(Math.random()*s.length)], c = s[Math.floor(Math.random()*s.length)];
      const win = a===b && b===c;
      await sock.sendMessage(jid, { text: `🎰 SLOTS\n| ${a} | ${b} | ${c} |\n\n${win?'🎉 JACKPOT! All match!':'❌ Try again'}` }, { quoted: m });
      return true;
    }
    if(cmd === 'truth'){
      await sock.sendMessage(jid, { text: `😏 *TRUTH*\n${TRUTHS[Math.floor(Math.random()*TRUTHS.length)]}` }, { quoted: m });
      return true;
    }
    if(cmd === 'dare'){
      await sock.sendMessage(jid, { text: `😈 *DARE*\n${DARES[Math.floor(Math.random()*DARES.length)]}` }, { quoted: m });
      return true;
    }

    // State games
    if(cmd === 'quiz' || cmd === 'trivia'){
      const q = QUIZ[Math.floor(Math.random()*QUIZ.length)];
      setGame(jid, { type:'quiz', player: sender, answer: q.a, tries:0 });
      await sock.sendMessage(jid, { text: `🧠 *QUIZ*\n\n${q.q}\n\n${q.opts.map((o,i)=>`${i+1}. ${o}`).join('\n')}\n\nReply with answer (text or number)` }, { quoted: m });
      return true;
    }
    if(cmd === 'riddle' || cmd === 'puzzle'){
      const r = RIDDLES[Math.floor(Math.random()*RIDDLES.length)];
      setGame(jid, { type:'quiz', player: sender, answer: r.a, tries:0 });
      await sock.sendMessage(jid, { text: `🧩 *RIDDLE*\n\n${r.q}\n\nReply with your answer` }, { quoted: m });
      return true;
    }
    if(cmd === 'math'){
      const a = Math.floor(Math.random()*20)+1, b = Math.floor(Math.random()*20)+1;
      const op = ['+','-','*'][Math.floor(Math.random()*3)];
      const ans = op==='+'?a+b : op==='-'?a-b : a*b;
      setGame(jid, { type:'math', player: sender, answer: String(ans), tries:0 });
      await sock.sendMessage(jid, { text: `🧮 *MATH*\n\nWhat is ${a} ${op} ${b} ?\nReply with number` }, { quoted: m });
      return true;
    }
    if(cmd === 'guess' || cmd === 'guessnumber'){
      const num = Math.floor(Math.random()*100)+1;
      setGame(jid, { type:'guessnumber', player: sender, answer: String(num), tries:0 });
      await sock.sendMessage(jid, { text: `🔢 *GUESS NUMBER*\n\nI picked 1-100. Guess it!\nYou have 5 tries. Reply with number` }, { quoted: m });
      return true;
    }
    if(cmd === 'guessword'){
      const w = WORDS[Math.floor(Math.random()*WORDS.length)];
      setGame(jid, { type:'guessword', player: sender, answer: w, tries:0 });
      await sock.sendMessage(jid, { text: `🔤 *GUESS WORD*\n\nHint: ${w.length} letters, starts with ${w[0].toUpperCase()}\nScrambled: ${scramble(w)}\nReply with word` }, { quoted: m });
      return true;
    }
    if(cmd === 'scramble'){
      const w = SCRAMBLE_WORDS[Math.floor(Math.random()*SCRAMBLE_WORDS.length)];
      setGame(jid, { type:'scramble', player: sender, answer: w, tries:0 });
      await sock.sendMessage(jid, { text: `🔀 *SCRAMBLE*\n\nUnscramble: *${scramble(w)}*\nReply with word` }, { quoted: m });
      return true;
    }
    if(cmd === 'hangman'){
      const w = WORDS[Math.floor(Math.random()*WORDS.length)];
      setGame(jid, { type:'hangman', player: sender, word: w, guessed:[], lives:6, answer: w });
      await sock.sendMessage(jid, { text: `🎯 *HANGMAN*\n\n${w.split('').map(()=> '_').join(' ')}\nLives: 6\nReply with ONE letter` }, { quoted: m });
      return true;
    }
    if(cmd === 'tictactoe'){
      const opponent = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      const p2 = opponent || 'bot';
      setGame(jid, { type:'tictactoe', p1: sender, p2, turn: sender, board: Array(9).fill(''), vsBot: !opponent });
      await sock.sendMessage(jid, { text: `🎮 *TicTacToe*\n\n${boardStr(Array(9).fill(''))}\n\n❌ = @${sender.split('@')[0]}\n⭕ = ${p2==='bot'?'Bot': '@'+p2.split('@')[0]}\n\nReply with 1-9 to play`, mentions: p2==='bot'?[sender]:[sender,p2] }, { quoted: m });
      return true;
    }
    if(cmd === 'wordchain'){
      setGame(jid, { type:'wordchain', used:[], lastLetter:'' });
      await sock.sendMessage(jid, { text: `🔗 *WORD CHAIN*\n\nStart with any word!\nNext word must start with last letter of previous.\nReply with word to play` }, { quoted: m });
      return true;
    }
    if(cmd === 'fasttype'){
      const w = WORDS[Math.floor(Math.random()*WORDS.length)];
      setGame(jid, { type:'fasttype', player: sender, answer: w, start: Date.now() });
      await sock.sendMessage(jid, { text: `⚡ *FAST TYPE*\n\nType this FAST:\n*${w}*\nReply exactly` }, { quoted: m });
      return true;
    }
    if(cmd === 'memory'){
      const seq = Array.from({length:4},()=>Math.floor(Math.random()*9)+1).join(' ');
      setGame(jid, { type:'memory', player: sender, answer: seq });
      await sock.sendMessage(jid, { text: `🧠 *MEMORY*\n\nRemember: *${seq}*\n\nYou have 5 seconds...` }, { quoted: m });
      setTimeout(async()=>{ try{ await sock.sendMessage(jid, { text: `🧠 Now reply with the sequence!\nExample: ${seq.split(' ')[0]} ...` }); }catch{} }, 5000);
      return true;
    }
    return false;
  }
};
