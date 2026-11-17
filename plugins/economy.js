// 💰 FACELESS - ECONOMY PLUGIN - REAL HANDLER
const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '..', 'database');
const ECON_DB = path.join(DB_DIR, 'economy.json');

function load(){
  try{
    if(!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR,{recursive:true});
    if(!fs.existsSync(ECON_DB)) fs.writeFileSync(ECON_DB, JSON.stringify({ users:{}, shop:[] },null,2));
    return JSON.parse(fs.readFileSync(ECON_DB,'utf8'));
  }catch{ return { users:{}, shop:[] }; }
}
function save(db){ try{ fs.writeFileSync(ECON_DB, JSON.stringify(db,null,2)); }catch{} }
function getUser(db, id){
  if(!db.users[id]) db.users[id] = { coins: 0, bank: 0, xp: 0, level: 1, lastDaily: 0, lastWork: 0, lastRob: 0, lastSlots: 0, inventory: [], wins: 0, losses: 0 };
  return db.users[id];
}
function fmt(n){ return Number(n||0).toLocaleString(); }
function getTarget(m, args){
  const q = m.message?.extendedTextMessage?.contextInfo?.participant;
  if(q) return q;
  const men = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  if(men?.length) return men[0];
  let num = (args[0]||'').replace(/[^0-9]/g,'');
  if(num.length>=10) return num+'@s.whatsapp.net';
  return null;
}
function cooldown(last, ms){
  const left = last + ms - Date.now();
  if(left>0){
    const min = Math.floor(left/60000), sec = Math.floor((left%60000)/1000);
    return `${min}m ${sec}s`;
  }
  return null;
}

const SHOP = [
  { id:'vip', name:'👑 VIP Badge', price: 5000, desc:'Show off VIP status' },
  { id:'car', name:'🚗 Car', price: 15000, desc:'Flex with a car' },
  { id:'house', name:'🏠 House', price: 50000, desc:'Own a house' },
  { id:'phone', name:'📱 iPhone 16', price: 8000, desc:'Latest iPhone' },
  { id:'laptop', name:'💻 Laptop', price: 12000, desc:'For work' },
  { id:'watch', name:'⌚ Rolex', price: 20000, desc:'Luxury watch' },
  { id:'jet', name:'✈️ Private Jet', price: 200000, desc:'Ultimate flex' },
  { id:'shield', name:'🛡️ Shield', price: 3000, desc:'Protect from rob (1 use)' },
];

const COMMANDS = ['balance','bal','wallet','daily','claim','work','rob','steal','gamble','slots','slot','bet','coinflip','cf','gift','transfer','pay','send','leaderboard','lb','rich','top','bank','deposit','dep','withdraw','with','shop','buy','sell','inventory','inv','profile2','rank','level','beg','crime','fish','hunt','mine','lottery','lotto','spin','daily2'];

module.exports = {
  name: 'economy',
  commands: COMMANDS,
  run: async (sock, m, jid, cmd, args, text, isOwner, isGroup, sender) => {
    if(!COMMANDS.includes(cmd)) return false;
    const db = load();
    const user = getUser(db, sender);
    const target = getTarget(m, args);

    // --- BALANCE / WALLET ---
    if(['balance','bal','wallet'].includes(cmd)){
      const t = target || sender;
      const u = getUser(db, t);
      await sock.sendMessage(jid, { text: `💰 *WALLET - @${t.split('@')[0]}*\n\n🪙 Coins: ${fmt(u.coins)}\n🏦 Bank: ${fmt(u.bank)}\n💎 Total: ${fmt(u.coins+u.bank)}\n⭐ Level: ${u.level} | XP: ${u.xp}\n🎒 Items: ${u.inventory.length}\n🏆 Wins: ${u.wins} | Losses: ${u.losses}`, mentions:[t] }, { quoted: m });
      return true;
    }

    // --- DAILY / CLAIM ---
    if(cmd==='daily' || cmd==='claim' || cmd==='daily2'){
      const left = cooldown(user.lastDaily, 24*60*60*1000);
      if(left){ await sock.sendMessage(jid, { text: `⏳ Daily already claimed!\nCome back in ${left}` }, { quoted: m }); return true; }
      const amount = 500 + Math.floor(Math.random()*500);
      user.coins += amount; user.lastDaily = Date.now(); user.xp += 10;
      save(db);
      await sock.sendMessage(jid, { text: `🎁 *DAILY REWARD*\n\nYou got *${fmt(amount)} coins*!\nBalance: ${fmt(user.coins)} coins\nCome back tomorrow!` }, { quoted: m });
      return true;
    }

    // --- WORK ---
    if(cmd==='work'){
      const left = cooldown(user.lastWork, 5*60*1000);
      if(left){ await sock.sendMessage(jid, { text: `⏳ You are tired! Rest for ${left}\nThen .work again` }, { quoted: m }); return true; }
      const jobs = ['POS Agent','Bolt Driver','Content Creator','Teacher','Trader','Chef','Barber','Photographer','Crypto Trader','Farmer'];
      const job = jobs[Math.floor(Math.random()*jobs.length)];
      const pay = 100 + Math.floor(Math.random()*400);
      user.coins += pay; user.lastWork = Date.now(); user.xp += 5;
      save(db);
      await sock.sendMessage(jid, { text: `💼 *WORK - ${job}*\n\nYou worked as ${job} and earned *${fmt(pay)} coins*!\nBalance: ${fmt(user.coins)}` }, { quoted: m });
      return true;
    }

    // --- BEG / CRIME / FISH / HUNT / MINE ---
    if(cmd==='beg'){
      const amount = Math.floor(Math.random()*100);
      user.coins += amount; save(db);
      await sock.sendMessage(jid, { text: `🥺 Someone gave you *${fmt(amount)} coins*\nBalance: ${fmt(user.coins)}` }, { quoted: m });
      return true;
    }
    if(cmd==='crime'){
      const left = cooldown(user.lastRob, 10*60*1000);
      if(left){ await sock.sendMessage(jid, { text: `⏳ Police is watching! Wait ${left}` }, { quoted: m }); return true; }
      const success = Math.random()<0.5;
      if(success){
        const gain = 200 + Math.floor(Math.random()*800);
        user.coins += gain; user.lastRob = Date.now(); save(db);
        await sock.sendMessage(jid, { text: `😈 *CRIME SUCCESS*\n\nYou stole *${fmt(gain)} coins* and escaped!\nBalance: ${fmt(user.coins)}` }, { quoted: m });
      } else {
        const fine = Math.min(user.coins, 200);
        user.coins -= fine; user.lastRob = Date.now(); save(db);
        await sock.sendMessage(jid, { text: `👮 *CAUGHT!*\n\nPolice caught you! You paid *${fmt(fine)} coins* fine.\nBalance: ${fmt(user.coins)}` }, { quoted: m });
      }
      return true;
    }
    if(['fish','hunt','mine'].includes(cmd)){
      const items = { fish:['🐟 Fish','🦐 Shrimp','🦀 Crab','Nothing'], hunt:['🦌 Deer','🐰 Rabbit','🦁 Lion','Nothing'], mine:['💎 Diamond','🪙 Gold','⛏️ Coal','Nothing'] };
      const got = items[cmd][Math.floor(Math.random()*items[cmd].length)];
      const reward = got==='Nothing'?0:50+Math.floor(Math.random()*300);
      user.coins += reward; save(db);
      await sock.sendMessage(jid, { text: `${cmd==='fish'?'🎣':cmd==='hunt'?'🏹':'⛏️'} *${cmd.toUpperCase()}*\n\nYou got: ${got}\nReward: ${fmt(reward)} coins\nBalance: ${fmt(user.coins)}` }, { quoted: m });
      return true;
    }

    // --- ROB / STEAL ---
    if(cmd==='rob' || cmd==='steal'){
      if(!target){ await sock.sendMessage(jid, { text: 'Usage: .rob @user' }, { quoted: m }); return true; }
      if(target===sender){ await sock.sendMessage(jid, { text: 'You cannot rob yourself 😂' }, { quoted: m }); return true; }
      const left = cooldown(user.lastRob, 10*60*1000);
      if(left){ await sock.sendMessage(jid, { text: `⏳ Wait ${left} before robbing again` }, { quoted: m }); return true; }
      const victim = getUser(db, target);
      if(victim.coins < 100){ await sock.sendMessage(jid, { text: 'Victim is too broke to rob 😭' }, { quoted: m }); return true; }
      // Shield protection
      if(victim.inventory.includes('shield')){
        victim.inventory = victim.inventory.filter(i=>i!=='shield');
        user.lastRob = Date.now(); save(db);
        await sock.sendMessage(jid, { text: `🛡️ @${target.split('@')[0]} had a shield! Rob failed!`, mentions:[target] }, { quoted: m });
        return true;
      }
      const success = Math.random()<0.6;
      if(success){
        const stolen = Math.floor(victim.coins * 0.2);
        victim.coins -= stolen; user.coins += stolen; user.lastRob = Date.now(); save(db);
        await sock.sendMessage(jid, { text: `😈 *ROB SUCCESS*\n\nYou stole *${fmt(stolen)} coins* from @${target.split('@')[0]}!\nYour balance: ${fmt(user.coins)}`, mentions:[target] }, { quoted: m });
      } else {
        const fine = Math.min(user.coins, 150);
        user.coins -= fine; user.lastRob = Date.now(); save(db);
        await sock.sendMessage(jid, { text: `👮 *ROB FAILED*\n\n@${target.split('@')[0]} caught you! You lost ${fmt(fine)} coins.`, mentions:[target] }, { quoted: m });
      }
      return true;
    }

    // --- GAMBLE / SLOTS / BET / COINFLIP ---
    if(['gamble','slots','slot','bet','coinflip','cf','lottery','lotto','spin'].includes(cmd)){
      const amount = parseInt(args[0])||0;
      if(cmd==='lottery' || cmd==='lotto'){
        if(user.coins < 100){ await sock.sendMessage(jid, { text: 'Lottery ticket costs 100 coins. You are broke 😭' }, { quoted: m }); return true; }
        user.coins -= 100;
        const win = Math.random()<0.1;
        if(win){ const prize = 5000; user.coins += prize; save(db); await sock.sendMessage(jid, { text: `🎉 *LOTTERY WIN!*\n\nYou won *${fmt(prize)} coins*!!!` }, { quoted: m }); }
        else { save(db); await sock.sendMessage(jid, { text: `🎟️ *LOTTERY*\n\nNo win this time. Try again!\nBalance: ${fmt(user.coins)}` }, { quoted: m }); }
        return true;
      }
      if(cmd==='spin'){
        const rewards = [0,50,100,200,500,1000];
        const r = rewards[Math.floor(Math.random()*rewards.length)];
        user.coins += r; save(db);
        await sock.sendMessage(jid, { text: `🎡 *SPIN*\n\nYou won *${fmt(r)} coins*!\nBalance: ${fmt(user.coins)}` }, { quoted: m });
        return true;
      }
      if(amount<=0){ await sock.sendMessage(jid, { text: `Usage: .${cmd} <amount>\nExample: .${cmd} 100\nBalance: ${fmt(user.coins)}` }, { quoted: m }); return true; }
      if(user.coins < amount){ await sock.sendMessage(jid, { text: `❌ Not enough coins! Balance: ${fmt(user.coins)}` }, { quoted: m }); return true; }
      if(cmd==='slots' || cmd==='slot'){
        const emojis = ['🍒','🍋','🔔','💎','7️⃣','⭐','🍇'];
        const s = [emojis[Math.floor(Math.random()*emojis.length)], emojis[Math.floor(Math.random()*emojis.length)], emojis[Math.floor(Math.random()*emojis.length)]];
        const win = s[0]===s[1] && s[1]===s[2];
        const jackpot = s[0]==='💎' && win;
        if(win){
          const prize = jackpot ? amount*5 : amount*3;
          user.coins += prize; user.wins++; save(db);
          await sock.sendMessage(jid, { text: `🎰 *SLOTS*\n\n${s.join(' | ')}\n\n🎉 JACKPOT! You won *${fmt(prize)} coins*!\nBalance: ${fmt(user.coins)}` }, { quoted: m });
        } else {
          user.coins -= amount; user.losses++; save(db);
          await sock.sendMessage(jid, { text: `🎰 *SLOTS*\n\n${s.join(' | ')}\n\n💔 You lost ${fmt(amount)} coins\nBalance: ${fmt(user.coins)}` }, { quoted: m });
        }
        return true;
      }
      if(cmd==='coinflip' || cmd==='cf'){
        const choice = (args[1]||'heads').toLowerCase();
        const result = Math.random()<0.5?'heads':'tails';
        if(choice===result){ user.coins += amount; user.wins++; save(db); await sock.sendMessage(jid, { text: `🪙 *COINFLIP*\n\nResult: ${result}\nYou chose: ${choice}\n🎉 You won ${fmt(amount)} coins!\nBalance: ${fmt(user.coins)}` }, { quoted: m }); }
        else { user.coins -= amount; user.losses++; save(db); await sock.sendMessage(jid, { text: `🪙 *COINFLIP*\n\nResult: ${result}\nYou chose: ${choice}\n💔 You lost ${fmt(amount)} coins\nBalance: ${fmt(user.coins)}` }, { quoted: m }); }
        return true;
      }
      // gamble / bet - 50/50
      const win = Math.random()<0.5;
      if(win){ user.coins += amount; user.wins++; save(db); await sock.sendMessage(jid, { text: `🎲 *GAMBLE*\n\n🎉 You won ${fmt(amount)} coins!\nBalance: ${fmt(user.coins)}` }, { quoted: m }); }
      else { user.coins -= amount; user.losses++; save(db); await sock.sendMessage(jid, { text: `🎲 *GAMBLE*\n\n💔 You lost ${fmt(amount)} coins\nBalance: ${fmt(user.coins)}` }, { quoted: m }); }
      return true;
    }

    // --- GIFT / TRANSFER / PAY / SEND ---
    if(['gift','transfer','pay','send'].includes(cmd)){
      if(!target){ await sock.sendMessage(jid, { text: `Usage: .${cmd} @user 100` }, { quoted: m }); return true; }
      const amount = parseInt(args[1]||args[0])||0;
      // args: if mention, amount is args[0] or args[1] depending on format
      let amt = amount;
      if(!amt){
        // try last arg as number
        const nums = args.map(a=>parseInt(a)).filter(n=>!isNaN(n));
        amt = nums[nums.length-1]||0;
      }
      if(amt<=0){ await sock.sendMessage(jid, { text: `Usage: .${cmd} @user 100` }, { quoted: m }); return true; }
      if(user.coins < amt){ await sock.sendMessage(jid, { text: `❌ Not enough coins! Balance: ${fmt(user.coins)}` }, { quoted: m }); return true; }
      const receiver = getUser(db, target);
      user.coins -= amt; receiver.coins += amt; save(db);
      await sock.sendMessage(jid, { text: `💸 *TRANSFER*\n\n@${sender.split('@')[0]} gave *${fmt(amt)} coins* to @${target.split('@')[0]}\n\nYour balance: ${fmt(user.coins)}`, mentions:[sender,target] }, { quoted: m });
      return true;
    }

    // --- BANK / DEPOSIT / WITHDRAW ---
    if(cmd==='bank'){
      await sock.sendMessage(jid, { text: `🏦 *BANK - @${sender.split('@')[0]}*\n\nWallet: ${fmt(user.coins)}\nBank: ${fmt(user.bank)}\nTotal: ${fmt(user.coins+user.bank)}\n\n.deposit 100 - save to bank\n.withdraw 100 - take from bank`, mentions:[sender] }, { quoted: m });
      return true;
    }
    if(cmd==='deposit' || cmd==='dep'){
      let amt = args[0]==='all'?user.coins:parseInt(args[0])||0;
      if(amt<=0 || user.coins<amt){ await sock.sendMessage(jid, { text: `❌ Invalid amount. Wallet: ${fmt(user.coins)}` }, { quoted: m }); return true; }
      user.coins -= amt; user.bank += amt; save(db);
      await sock.sendMessage(jid, { text: `🏦 Deposited ${fmt(amt)} coins to bank\nWallet: ${fmt(user.coins)} | Bank: ${fmt(user.bank)}` }, { quoted: m });
      return true;
    }
    if(cmd==='withdraw' || cmd==='with'){
      let amt = args[0]==='all'?user.bank:parseInt(args[0])||0;
      if(amt<=0 || user.bank<amt){ await sock.sendMessage(jid, { text: `❌ Invalid amount. Bank: ${fmt(user.bank)}` }, { quoted: m }); return true; }
      user.bank -= amt; user.coins += amt; save(db);
      await sock.sendMessage(jid, { text: `🏦 Withdrew ${fmt(amt)} coins from bank\nWallet: ${fmt(user.coins)} | Bank: ${fmt(user.bank)}` }, { quoted: m });
      return true;
    }

    // --- LEADERBOARD / RICH / TOP ---
    if(['leaderboard','lb','rich','top'].includes(cmd)){
      const all = Object.entries(db.users).map(([id,u])=>({ id, total: (u.coins||0)+(u.bank||0) })).sort((a,b)=>b.total-a.total).slice(0,10);
      if(!all.length){ await sock.sendMessage(jid, { text: 'No one has coins yet. Start with .daily' }, { quoted: m }); return true; }
      const medals = ['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
      let msg = `🏆 *RICHEST - LEADERBOARD*\n\n`;
      all.forEach((u,i)=>{ msg += `${medals[i]} @${u.id.split('@')[0]} - ${fmt(u.total)} coins\n`; });
      const myRank = Object.entries(db.users).map(([id,u])=>({id,total:(u.coins||0)+(u.bank||0)})).sort((a,b)=>b.total-a.total).findIndex(x=>x.id===sender)+1;
      msg += `\nYour rank: #${myRank||'?'}`;
      await sock.sendMessage(jid, { text: msg, mentions: all.map(u=>u.id) }, { quoted: m });
      return true;
    }

    // --- SHOP / BUY / SELL / INVENTORY ---
    if(cmd==='shop'){
      let msg = `🛒 *SHOP*\n\n`;
      SHOP.forEach((item,i)=>{ msg += `${i+1}. ${item.name} - ${fmt(item.price)} coins\n   ${item.desc}\n   Buy: .buy ${item.id}\n\n`; });
      msg += `Your coins: ${fmt(user.coins)}\nUse .buy <id> to buy`;
      await sock.sendMessage(jid, { text: msg }, { quoted: m });
      return true;
    }
    if(cmd==='buy'){
      const id = (args[0]||'').toLowerCase();
      const item = SHOP.find(s=>s.id===id);
      if(!item){ await sock.sendMessage(jid, { text: `❌ Item not found. Use .shop to see items\nExample: .buy car` }, { quoted: m }); return true; }
      if(user.coins < item.price){ await sock.sendMessage(jid, { text: `❌ Not enough coins! Need ${fmt(item.price)}, you have ${fmt(user.coins)}` }, { quoted: m }); return true; }
      user.coins -= item.price; user.inventory.push(item.id); save(db);
      await sock.sendMessage(jid, { text: `✅ Bought ${item.name} for ${fmt(item.price)} coins!\nBalance: ${fmt(user.coins)}` }, { quoted: m });
      return true;
    }
    if(cmd==='sell'){
      const id = (args[0]||'').toLowerCase();
      const item = SHOP.find(s=>s.id===id);
      if(!item || !user.inventory.includes(id)){ await sock.sendMessage(jid, { text: '❌ You don\'t own that item' }, { quoted: m }); return true; }
      const sellPrice = Math.floor(item.price*0.7);
      user.inventory = user.inventory.filter(i=>i!==id); user.coins += sellPrice; save(db);
      await sock.sendMessage(jid, { text: `✅ Sold ${item.name} for ${fmt(sellPrice)} coins!\nBalance: ${fmt(user.coins)}` }, { quoted: m });
      return true;
    }
    if(cmd==='inventory' || cmd==='inv'){
      if(!user.inventory.length){ await sock.sendMessage(jid, { text: '🎒 Inventory is empty\nUse .shop to buy items' }, { quoted: m }); return true; }
      const items = user.inventory.map(id=>{ const s=SHOP.find(x=>x.id===id); return s?`${s.name}`:id; });
      await sock.sendMessage(jid, { text: `🎒 *INVENTORY*\n\n${items.map((it,i)=>`${i+1}. ${it}`).join('\n')}` }, { quoted: m });
      return true;
    }

    // --- PROFILE / RANK / LEVEL ---
    if(['profile2','rank','level'].includes(cmd)){
      const t = target || sender;
      const u = getUser(db, t);
      const need = u.level*100;
      await sock.sendMessage(jid, { text: `👤 *PROFILE - @${t.split('@')[0]}*\n\n🪙 Coins: ${fmt(u.coins)}\n🏦 Bank: ${fmt(u.bank)}\n⭐ Level: ${u.level}\n✨ XP: ${u.xp}/${need}\n🎒 Items: ${u.inventory.length}\n🏆 Wins: ${u.wins} | Losses: ${u.losses}`, mentions:[t] }, { quoted: m });
      return true;
    }

    return false;
  }
};
