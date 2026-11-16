const { facelessReply, sendAwait } = require('../lib/function');
const fs = require('fs');
const path = require('path');

const econPath = path.join(__dirname, '../database/economy.json');

function loadEcon(){
  try{ if(fs.existsSync(econPath)) return JSON.parse(fs.readFileSync(econPath,'utf8')); }catch{}
  return {};
}
function saveEcon(d){
  try{ fs.mkdirSync(path.dirname(econPath),{recursive:true}); fs.writeFileSync(econPath, JSON.stringify(d,null,2)); }catch{}
}
function getUser(jid){
  const db = loadEcon();
  if(!db[jid]) db[jid] = { wallet: 0, bank: 0, lastDaily: 0, lastWork: 0, items: [] };
  return { db, user: db[jid] };
}
function addCoins(jid, amount){
  const { db, user } = getUser(jid);
  user.wallet += amount;
  db[jid] = user;
  saveEcon(db);
  return user.wallet;
}
function removeCoins(jid, amount){
  const { db, user } = getUser(jid);
  user.wallet = Math.max(0, user.wallet - amount);
  db[jid] = user;
  saveEcon(db);
  return user.wallet;
}

const shopItems = [
  { id: 'vip', name: 'VIP Badge', price: 5000, desc: 'Show VIP status' },
  { id: 'shield', name: 'Rob Shield', price: 2000, desc: 'Protect from rob for 24h' },
  { id: 'car', name: 'Car', price: 50000, desc: 'Flex car' },
  { id: 'house', name: 'House', price: 100000, desc: 'Flex house' },
  { id: 'phone', name: 'iPhone 17', price: 20000, desc: 'Flex phone' }
];
const workJobs = [
  "You worked as a Bolt driver and earned",
  "You worked as a waiter and earned",
  "You fixed phones and earned",
  "You sold data and earned",
  "You worked as a barber and earned",
  "You did POS business and earned"
];

module.exports = {
  name: "economy",
  loadEcon, saveEcon, getUser, addCoins, removeCoins, shopItems,

  async run(sock, m, jid, cmd, args, text, isOwner, isGroup, sender){

    const econCmds = ['balance','bal','daily','work','rob','transfer','pay','leaderboard','lb','shop','buy','deposit','dep','withdraw','wd','rich'];
    if(!econCmds.includes(cmd)) return false;

    const getTarget = () => {
      const ctx = m.message?.extendedTextMessage?.contextInfo;
      if(ctx?.mentionedJid?.length) return ctx.mentionedJid[0];
      if(ctx?.participant) return ctx.participant;
      if(args[0]) return args[0].replace(/[^0-9]/g,'') + '@s.whatsapp.net';
      return sender;
    };

    // ================= BALANCE =================
    if(cmd === 'balance' || cmd === 'bal'){
      await sendAwait(sock, jid, m);
      const { user } = getUser(sender);
      await sock.sendMessage(jid, { text: `▫️ 💀 Balance For @${sender.split('@')[0]}\n\nWallet: ${user.wallet} Coins\nBank: ${user.bank} Coins\nTotal: ${user.wallet + user.bank} Coins\nItems: ${user.items.length ? user.items.join(', ') : 'None'}`, mentions: [sender] }, { quoted: m });
      return true;
    }

    // ================= DAILY - REAL 24H COOLDOWN =================
    if(cmd === 'daily'){
      await sendAwait(sock, jid, m);
      const { db, user } = getUser(sender);
      const now = Date.now();
      const cooldown = 24 * 60 * 60 * 1000;
      if(now - user.lastDaily < cooldown){
        const left = cooldown - (now - user.lastDaily);
        const h = Math.floor(left / 3600000);
        const min = Math.floor((left % 3600000) / 60000);
        await facelessReply(sock, jid, `You Already Claimed Daily, Come Back In ${h}h ${min}m`, m);
        return true;
      }
      const amount = 500;
      user.wallet += amount;
      user.lastDaily = now;
      db[sender] = user;
      saveEcon(db);
      await facelessReply(sock, jid, `Daily Reward: +${amount} Coins\nWallet: ${user.wallet}`, m);
      return true;
    }

    // ================= WORK - REAL 5 MIN COOLDOWN =================
    if(cmd === 'work'){
      await sendAwait(sock, jid, m);
      const { db, user } = getUser(sender);
      const now = Date.now();
      if(now - user.lastWork < 5 * 60 * 1000){
        const left = Math.ceil((5*60*1000 - (now - user.lastWork))/1000);
        await facelessReply(sock, jid, `Wait ${left}s Before Working Again`, m);
        return true;
      }
      const earn = Math.floor(Math.random()*300)+100;
      const job = workJobs[Math.floor(Math.random()*workJobs.length)];
      user.wallet += earn;
      user.lastWork = now;
      db[sender] = user;
      saveEcon(db);
      await facelessReply(sock, jid, `${job} ${earn} Coins\nWallet: ${user.wallet}`, m);
      return true;
    }

    // ================= ROB - REAL =================
    if(cmd === 'rob'){
      await sendAwait(sock, jid, m);
      const target = getTarget();
      if(target === sender){
        await facelessReply(sock, jid, "You Cannot Rob Yourself", m);
        return true;
      }
      const { db: db1, user: me } = getUser(sender);
      const { db: db2, user: victim } = getUser(target);
      if(victim.wallet < 100){
        await facelessReply(sock, jid, "That User Is Too Poor To Rob (Less Than 100)", m);
        return true;
      }
      const success = Math.random() < 0.5;
      if(success){
        const stolen = Math.floor(victim.wallet * 0.3);
        victim.wallet -= stolen;
        me.wallet += stolen;
        db1[sender] = me; saveEcon(db1);
        db2[target] = victim; saveEcon(db2);
        await sock.sendMessage(jid, { text: `▫️ 💀 You Robbed @${target.split('@')[0]} And Got ${stolen} Coins!`, mentions: [target] }, { quoted: m });
      } else {
        const fine = Math.min(100, me.wallet);
        me.wallet -= fine;
        db1[sender] = me; saveEcon(db1);
        await facelessReply(sock, jid, `Rob Failed! You Were Caught And Fined ${fine} Coins`, m);
      }
      return true;
    }

    // ================= TRANSFER / PAY - REAL =================
    if(cmd === 'transfer' || cmd === 'pay'){
      await sendAwait(sock, jid, m);
      const target = getTarget();
      const amount = parseInt(args[1] || args[0]);
      if(!target || target === sender || !amount || isNaN(amount) || amount <= 0){
        await facelessReply(sock, jid, "Usage: .transfer @user <amount>", m);
        return true;
      }
      const { db, user } = getUser(sender);
      if(user.wallet < amount){
        await facelessReply(sock, jid, `Insufficient Funds, Wallet: ${user.wallet}`, m);
        return true;
      }
      const { db: db2, user: receiver } = getUser(target);
      user.wallet -= amount;
      receiver.wallet += amount;
      db[sender] = user; saveEcon(db);
      db2[target] = receiver; saveEcon(db2);
      await sock.sendMessage(jid, { text: `▫️ 💀 Transfer Success\n@${sender.split('@')[0]} -> @${target.split('@')[0]}\nAmount: ${amount} Coins`, mentions: [sender, target] }, { quoted: m });
      return true;
    }

    // ================= LEADERBOARD - REAL SORT =================
    if(cmd === 'leaderboard' || cmd === 'lb' || cmd === 'rich'){
      await sendAwait(sock, jid, m);
      const db = loadEcon();
      const sorted = Object.entries(db).sort((a,b) => (b[1].wallet + b[1].bank) - (a[1].wallet + a[1].bank)).slice(0,10);
      if(!sorted.length){
        await facelessReply(sock, jid, "No One Has Coins Yet, Do .daily", m);
        return true;
      }
      let txt = `Top 10 Richest:\n\n`;
      sorted.forEach(([id, u], i) => {
        txt += `${i+1}. @${id.split('@')[0]} - ${u.wallet + u.bank} Coins\n`;
      });
      const mentions = sorted.map(([id]) => id);
      await sock.sendMessage(jid, { text: `▫️ 💀 ${txt}`, mentions }, { quoted: m });
      return true;
    }

    // ================= SHOP =================
    if(cmd === 'shop'){
      await sendAwait(sock, jid, m);
      let txt = `Shop:\n\n`;
      shopItems.forEach(i => txt += `${i.id} - ${i.name} - ${i.price} Coins\n${i.desc}\n\n`);
      txt += `Buy With: .buy <id>`;
      await facelessReply(sock, jid, txt, m);
      return true;
    }

    // ================= BUY - REAL =================
    if(cmd === 'buy'){
      await sendAwait(sock, jid, m);
      const itemId = (args[0]||"").toLowerCase();
      const item = shopItems.find(i => i.id === itemId);
      if(!item){
        await facelessReply(sock, jid, "Item Not Found, Use .shop To See Items", m);
        return true;
      }
      const { db, user } = getUser(sender);
      if(user.wallet < item.price){
        await facelessReply(sock, jid, `You Need ${item.price} Coins, You Have ${user.wallet}`, m);
        return true;
      }
      user.wallet -= item.price;
      user.items.push(item.name);
      db[sender] = user;
      saveEcon(db);
      await facelessReply(sock, jid, `You Bought ${item.name} For ${item.price} Coins\nWallet Left: ${user.wallet}`, m);
      return true;
    }

    // ================= DEPOSIT =================
    if(cmd === 'deposit' || cmd === 'dep'){
      await sendAwait(sock, jid, m);
      let amount = args[0] === 'all' ? null : parseInt(args[0]);
      const { db, user } = getUser(sender);
      if(args[0] === 'all') amount = user.wallet;
      if(!amount || isNaN(amount) || amount <= 0){
        await facelessReply(sock, jid, "Usage: .deposit <amount> / .deposit all", m);
        return true;
      }
      if(user.wallet < amount){
        await facelessReply(sock, jid, `Insufficient Wallet: ${user.wallet}`, m);
        return true;
      }
      user.wallet -= amount;
      user.bank += amount;
      db[sender] = user;
      saveEcon(db);
      await facelessReply(sock, jid, `Deposited ${amount} Coins\nWallet: ${user.wallet}\nBank: ${user.bank}`, m);
      return true;
    }

    // ================= WITHDRAW =================
    if(cmd === 'withdraw' || cmd === 'wd'){
      await sendAwait(sock, jid, m);
      let amount = args[0] === 'all' ? null : parseInt(args[0]);
      const { db, user } = getUser(sender);
      if(args[0] === 'all') amount = user.bank;
      if(!amount || isNaN(amount) || amount <= 0){
        await facelessReply(sock, jid, "Usage: .withdraw <amount> / .withdraw all", m);
        return true;
      }
      if(user.bank < amount){
        await facelessReply(sock, jid, `Insufficient Bank: ${user.bank}`, m);
        return true;
      }
      user.bank -= amount;
      user.wallet += amount;
      db[sender] = user;
      saveEcon(db);
      await facelessReply(sock, jid, `Withdrew ${amount} Coins\nWallet: ${user.wallet}\nBank: ${user.bank}`, m);
      return true;
    }

    return false;
  }
};
