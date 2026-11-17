// 💰 FACELESS - ECONOMY PLUGIN - REAL HANDLER
const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '..', 'database');
const DB = path.join(DB_DIR, 'economy.json');

function load(){
  try{
    if(!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR,{recursive:true});
    if(!fs.existsSync(DB)) fs.writeFileSync(DB, JSON.stringify({},null,2));
    return JSON.parse(fs.readFileSync(DB,'utf8')||'{}');
  }catch{ return {}; }
}
function save(d){ try{ fs.writeFileSync(DB, JSON.stringify(d,null,2)); }catch{} }
function getUser(id){
  const db = load();
  if(!db[id]) db[id] = { wallet:1000, bank:0, inventory:[], lastDaily:0, lastWeekly:0, lastMonthly:0, lastWork:0, lastCrime:0, lastBeg:0, lastFish:0, lastHunt:0, lastMine:0, lastBonus:0, xp:0, level:1 };
  save(db);
  return db[id];
}
function setUser(id, data){ const db=load(); db[id]=data; save(db); }
function fmt(n){ return Number(n).toLocaleString(); }
function cooldown(last, ms){ const left = last + ms - Date.now(); return left > 0 ? left : 0; }
function timeLeft(ms){ const m=Math.floor(ms/60000), s=Math.floor((ms%60000)/1000), h=Math.floor(m/60); return h>0?`${h}h ${m%60}m` : m>0?`${m}m ${s}s` : `${s}s`; }
function getTarget(m, args){
  const q = m.message?.extendedTextMessage?.contextInfo?.participant;
  if(q) return q;
  const men = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  if(men?.length) return men[0];
  let num = (args[0]||'').replace(/[^0-9]/g,'');
  if(num && num.length>=10) return num+'@s.whatsapp.net';
  return null;
}
function rand(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }

const SHOP = [
  { id:'phone', name:'📱 Phone', price:5000 },
  { id:'car', name:'🚗 Car', price:50000 },
  { id:'house', name:'🏠 House', price:200000 },
  { id:'laptop', name:'💻 Laptop', price:15000 },
  { id:'sword', name:'⚔️ Sword', price:8000 },
  { id:'fishing', name:'🎣 Fishing Rod', price:3000 },
  { id:'pickaxe', name:'⛏️ Pickaxe', price:4000 },
  { id:'gun', name:'🔫 Gun', price:12000 },
];

const COMMANDS = ['balance','daily','weekly','monthly','work','crime','rob','deposit','withdraw','transfer','pay','shop','buy','sell','inventory','leaderboard','coin','bank','gamble','beg','fish','hunt','mine','dailybonus','profile'];

module.exports = {
  name: 'economy',
  commands: COMMANDS,
  run: async (sock, m, jid, cmd, args, text, isOwner, isGroup, sender) => {
    if(!COMMANDS.includes(cmd)) return false;
    const user = getUser(sender);
    const targetId = getTarget(m, args);
    const amount = parseInt(args.find(a=>/^\d+$/.test(a)) || args[1] || '0');

    // --- BALANCE / PROFILE / BANK ---
    if(cmd === 'balance' || cmd === 'bank'){
      const u = targetId ? getUser(targetId) : user;
      const name = targetId ? targetId.split('@')[0] : 'You';
      await sock.sendMessage(jid, { text: `💰 *BALANCE - @${name}*\n\n👛 Wallet: $${fmt(u.wallet)}\n🏦 Bank: $${fmt(u.bank)}\n💎 Total: $${fmt(u.wallet+u.bank)}\n⭐ Level: ${u.level} | XP: ${u.xp}`, mentions: targetId?[targetId]:[] }, { quoted: m });
      return true;
    }
    if(cmd === 'profile'){
      const u = targetId ? getUser(targetId) : user;
      const name = targetId ? targetId.split('@')[0] : 'You';
      await sock.sendMessage(jid, { text: `👤 *PROFILE - @${name}*\n\n💰 Wallet: $${fmt(u.wallet)}\n🏦 Bank: $${fmt(u.bank)}\n⭐ Level: ${u.level}\n✨ XP: ${u.xp}\n🎒 Items: ${u.inventory.length ? u.inventory.map(i=>i.name).join(', ') : 'None'}\n📦 Inventory: ${u.inventory.length} items`, mentions: targetId?[targetId]:[] }, { quoted: m });
      return true;
    }

    // --- DAILY / WEEKLY / MONTHLY / DAILYBONUS ---
    if(['daily','weekly','monthly','dailybonus'].includes(cmd)){
      const map = { daily:['lastDaily', 24*3600*1000, 500], weekly:['lastWeekly', 7*24*3600*1000, 3000], monthly:['lastMonthly', 30*24*3600*1000, 10000], dailybonus:['lastBonus', 24*3600*1000, 1000] };
      const [key, ms, reward] = map[cmd];
      const left = cooldown(user[key], ms);
      if(left>0){ await sock.sendMessage(jid, { text: `⏳ You already claimed ${cmd}!\nCome back in ${timeLeft(left)}` }, { quoted: m }); return true; }
      const gain = rand(reward, reward*2);
      user[key]=Date.now(); user.wallet+=gain; user.xp+=20;
      setUser(sender, user);
      await sock.sendMessage(jid, { text: `🎁 *${cmd.toUpperCase()} CLAIMED!*\n\n+$${fmt(gain)}\n👛 Wallet: $${fmt(user.wallet)}` }, { quoted: m });
      return true;
    }

    // --- WORK ---
    if(cmd === 'work'){
      const left = cooldown(user.lastWork, 5*60*1000);
      if(left>0){ await sock.sendMessage(jid, { text: `⏳ You are tired! Rest for ${timeLeft(left)}` }, { quoted: m }); return true; }
      const jobs = ['Builder','Driver','Teacher','Hacker','Farmer','Trader','Chef','Cleaner'];
      const job = jobs[Math.floor(Math.random()*jobs.length)];
      const gain = rand(100,500);
      user.lastWork=Date.now(); user.wallet+=gain; user.xp+=10;
      setUser(sender, user);
      await sock.sendMessage(jid, { text: `💼 *WORK*\nJob: ${job}\nYou earned $${fmt(gain)}\n👛 Wallet: $${fmt(user.wallet)}` }, { quoted: m });
      return true;
    }

    // --- CRIME ---
    if(cmd === 'crime'){
      const left = cooldown(user.lastCrime, 10*60*1000);
      if(left>0){ await sock.sendMessage(jid, { text: `⏳ Police is watching! Wait ${timeLeft(left)}` }, { quoted: m }); return true; }
      user.lastCrime=Date.now();
      if(Math.random()<0.6){
        const gain = rand(200,800);
        user.wallet+=gain; user.xp+=15; setUser(sender,user);
        await sock.sendMessage(jid, { text: `😈 *CRIME SUCCESS!*\nYou stole $${fmt(gain)}\n👛 Wallet: $${fmt(user.wallet)}` }, { quoted: m });
      } else {
        const loss = rand(100,300);
        user.wallet=Math.max(0,user.wallet-loss); setUser(sender,user);
        await sock.sendMessage(jid, { text: `🚔 *CAUGHT!*\nYou paid $${fmt(loss)} fine\n👛 Wallet: $${fmt(user.wallet)}` }, { quoted: m });
      }
      return true;
    }

    // --- ROB ---
    if(cmd === 'rob'){
      if(!targetId){ await sock.sendMessage(jid, { text: 'Usage: .rob @user' }, { quoted: m }); return true; }
      if(targetId===sender){ await sock.sendMessage(jid, { text: 'You cannot rob yourself' }, { quoted: m }); return true; }
      const victim = getUser(targetId);
      if(victim.wallet < 100){ await sock.sendMessage(jid, { text: 'Victim is broke!' }, { quoted: m }); return true; }
      if(Math.random()<0.5){
        const steal = rand(50, Math.min(300, victim.wallet));
        victim.wallet-=steal; user.wallet+=steal; setUser(targetId,victim); setUser(sender,user);
        await sock.sendMessage(jid, { text: `😈 You robbed @${targetId.split('@')[0]} $${fmt(steal)}!`, mentions:[targetId] }, { quoted: m });
      } else {
        const fine = rand(50,150);
        user.wallet=Math.max(0,user.wallet-fine); setUser(sender,user);
        await sock.sendMessage(jid, { text: `🚔 You got caught robbing! Paid $${fmt(fine)} fine` }, { quoted: m });
      }
      return true;
    }

    // --- DEPOSIT / WITHDRAW ---
    if(cmd === 'deposit' || cmd === 'withdraw'){
      const amt = args[0]==='all' ? (cmd==='deposit'?user.wallet:user.bank) : parseInt(args[0]||'0');
      if(!amt || amt<=0){ await sock.sendMessage(jid, { text: `Usage: .${cmd} <amount> / .${cmd} all` }, { quoted: m }); return true; }
      if(cmd==='deposit'){
        if(user.wallet<amt){ await sock.sendMessage(jid, { text: 'Not enough in wallet' }, { quoted: m }); return true; }
        user.wallet-=amt; user.bank+=amt; setUser(sender,user);
        await sock.sendMessage(jid, { text: `🏦 Deposited $${fmt(amt)}\nBank: $${fmt(user.bank)} | Wallet: $${fmt(user.wallet)}` }, { quoted: m });
      } else {
        if(user.bank<amt){ await sock.sendMessage(jid, { text: 'Not enough in bank' }, { quoted: m }); return true; }
        user.bank-=amt; user.wallet+=amt; setUser(sender,user);
        await sock.sendMessage(jid, { text: `💵 Withdrew $${fmt(amt)}\nWallet: $${fmt(user.wallet)} | Bank: $${fmt(user.bank)}` }, { quoted: m });
      }
      return true;
    }

    // --- TRANSFER / PAY ---
    if(cmd === 'transfer' || cmd === 'pay'){
      if(!targetId || !amount){ await sock.sendMessage(jid, { text: 'Usage: .pay @user 500' }, { quoted: m }); return true; }
      if(user.wallet<amount){ await sock.sendMessage(jid, { text: 'Not enough money' }, { quoted: m }); return true; }
      const recv = getUser(targetId);
      user.wallet-=amount; recv.wallet+=amount; setUser(sender,user); setUser(targetId,recv);
      await sock.sendMessage(jid, { text: `💸 Sent $${fmt(amount)} to @${targetId.split('@')[0]}\nYour wallet: $${fmt(user.wallet)}`, mentions:[targetId] }, { quoted: m });
      return true;
    }

    // --- SHOP / BUY / SELL / INVENTORY ---
    if(cmd === 'shop'){
      await sock.sendMessage(jid, { text: `🛒 *SHOP*\n\n${SHOP.map((s,i)=>`${i+1}. ${s.name} - $${fmt(s.price)}\n   Buy: .buy ${s.id}`).join('\n\n')}\n\nYour wallet: $${fmt(user.wallet)}` }, { quoted: m });
      return true;
    }
    if(cmd === 'buy'){
      const id = (args[0]||'').toLowerCase();
      const item = SHOP.find(s=>s.id===id);
      if(!item){ await sock.sendMessage(jid, { text: 'Usage: .buy phone / car / house etc\nSee .shop' }, { quoted: m }); return true; }
      if(user.wallet<item.price){ await sock.sendMessage(jid, { text: `Not enough! Need $${fmt(item.price)}` }, { quoted: m }); return true; }
      user.wallet-=item.price; user.inventory.push(item); setUser(sender,user);
      await sock.sendMessage(jid, { text: `✅ Bought ${item.name} for $${fmt(item.price)}\nWallet: $${fmt(user.wallet)}` }, { quoted: m });
      return true;
    }
    if(cmd === 'sell'){
      const id = (args[0]||'').toLowerCase();
      const idx = user.inventory.findIndex(i=>i.id===id);
      if(idx<0){ await sock.sendMessage(jid, { text: 'You do not own that item\nSee .inventory' }, { quoted: m }); return true; }
      const item = user.inventory[idx];
      const sellPrice = Math.floor(item.price*0.7);
      user.inventory.splice(idx,1); user.wallet+=sellPrice; setUser(sender,user);
      await sock.sendMessage(jid, { text: `💰 Sold ${item.name} for $${fmt(sellPrice)}\nWallet: $${fmt(user.wallet)}` }, { quoted: m });
      return true;
    }
    if(cmd === 'inventory'){
      if(!user.inventory.length){ await sock.sendMessage(jid, { text: '🎒 Inventory empty\nUse .shop to buy' }, { quoted: m }); return true; }
      await sock.sendMessage(jid, { text: `🎒 *INVENTORY*\n\n${user.inventory.map((i,idx)=>`${idx+1}. ${i.name} - $${fmt(i.price)}`).join('\n')}\n\nTotal value: $${fmt(user.inventory.reduce((a,i)=>a+i.price,0))}` }, { quoted: m });
      return true;
    }

    // --- LEADERBOARD ---
    if(cmd === 'leaderboard'){
      const db = load();
      const top = Object.entries(db).sort((a,b)=>(b[1].wallet+b[1].bank)-(a[1].wallet+a[1].bank)).slice(0,10);
      await sock.sendMessage(jid, { text: `🏆 *LEADERBOARD*\n\n${top.map(([id,u],i)=>`${i+1}. @${id.split('@')[0]} - $${fmt(u.wallet+u.bank)}`).join('\n')||'No users yet'}`, mentions: top.map(([id])=>id) }, { quoted: m });
      return true;
    }

    // --- COIN / GAMBLE ---
    if(cmd === 'coin'){
      const bet = parseInt(args[1]||args[0]||'0');
      const choice = (args[0]||'').toLowerCase();
      if(['heads','tails'].includes(choice) && bet){
        if(user.wallet<bet){ await sock.sendMessage(jid, { text: 'Not enough' }, { quoted: m }); return true; }
        const res = Math.random()<0.5?'heads':'tails';
        if(res===choice){ user.wallet+=bet; await sock.sendMessage(jid, { text: `🪙 ${res}! You won $${fmt(bet)}` }, { quoted: m }); }
        else { user.wallet-=bet; await sock.sendMessage(jid, { text: `🪙 ${res}! You lost $${fmt(bet)}` }, { quoted: m }); }
        setUser(sender,user); return true;
      }
      await sock.sendMessage(jid, { text: 'Usage: .coin heads 100 / .coin tails 100' }, { quoted: m });
      return true;
    }
    if(cmd === 'gamble'){
      const bet = parseInt(args[0]||'0');
      if(!bet || user.wallet<bet){ await sock.sendMessage(jid, { text: 'Usage: .gamble 100' }, { quoted: m }); return true; }
      if(Math.random()<0.45){ const win = bet*2; user.wallet+=win; await sock.sendMessage(jid, { text: `🎰 You won $${fmt(win)}!` }, { quoted: m }); }
      else { user.wallet-=bet; await sock.sendMessage(jid, { text: `🎰 You lost $${fmt(bet)}!` }, { quoted: m }); }
      setUser(sender,user); return true;
    }

    // --- BEG / FISH / HUNT / MINE ---
    if(['beg','fish','hunt','mine'].includes(cmd)){
      const map = { beg:['lastBeg', 2*60*1000, 10, 100, 'Someone gave you'], fish:['lastFish', 5*60*1000, 50, 300, 'You caught fish'], hunt:['lastHunt', 5*60*1000, 50, 300, 'You hunted'], mine:['lastMine', 5*60*1000, 50, 400, 'You mined'] };
      const [key, ms, min, max, label] = map[cmd];
      const left = cooldown(user[key], ms);
      if(left>0){ await sock.sendMessage(jid, { text: `⏳ Wait ${timeLeft(left)} for .${cmd}` }, { quoted: m }); return true; }
      if(cmd==='fish' && !user.inventory.some(i=>i.id==='fishing')){ await sock.sendMessage(jid, { text: 'You need Fishing Rod! Buy with .buy fishing' }, { quoted: m }); return true; }
      if(cmd==='mine' && !user.inventory.some(i=>i.id==='pickaxe')){ await sock.sendMessage(jid, { text: 'You need Pickaxe! Buy with .buy pickaxe' }, { quoted: m }); return true; }
      const gain = rand(min,max);
      user[key]=Date.now(); user.wallet+=gain; user.xp+=5; setUser(sender,user);
      await sock.sendMessage(jid, { text: `${cmd==='beg'?'🙏':cmd==='fish'?'🎣':cmd==='hunt'?'🏹':'⛏️'} ${label} $${fmt(gain)}\nWallet: $${fmt(user.wallet)}` }, { quoted: m });
      return true;
    }

    return false;
  }
};
