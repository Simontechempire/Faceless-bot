const axios = require('axios');
const config = require('../config');

// ==========================================
// 1. FONT KEYBOARD - Fancy Font For Every Cmd
// ==========================================
function toFont(text){
  const map = {
    a:'𝚊',b:'𝚋',c:'𝚌',d:'𝚍',e:'𝚎',f:'𝚏',g:'𝚐',h:'𝚑',i:'𝚒',j:'𝚓',k:'𝚔',l:'𝚕',m:'𝚖',
    n:'𝚗',o:'𝚘',p:'𝚙',q:'𝚚',r:'𝚛',s:'𝚜',t:'𝚝',u:'𝚞',v:'𝚟',w:'𝚠',x:'𝚡',y:'𝚢',z:'𝚣',
    A:'𝙰',B:'𝙱',C:'𝙲',D:'𝙳',E:'𝙴',F:'𝙵',G:'𝙶',H:'𝙷',I:'𝙸',J:'𝙹',K:'𝙺',L:'𝙻',M:'𝙼',
    N:'𝙽',O:'𝙾',P:'𝙿',Q:'𝚀',R:'𝚁',S:'𝚂',T:'𝚃',U:'𝚄',V:'𝚅',W:'𝚆',X:'𝚇',Y:'𝚈',Z:'𝚉',
    0:'𝟶',1:'𝟷',2:'𝟸',3:'𝟹',4:'𝟺',5:'𝟻',6:'𝟼',7:'𝟽',8:'𝟾',9:'𝟿',
    ':':':', '.':'.', '-':'-', '_':'_', '/':'/', '+':'+', '(': '(', ')':')', '!':'!', '?':'?', ' ':' '
  };
  return String(text).split('').map(ch => map[ch] || ch).join('');
}

// ==========================================
// 2. NEWSLETTER + CUBE TINY + FONT + COMPLETE 💀
// Every Complete Reply Must Use This
// ==========================================
async function facelessReply(sock, jid, text, quoted){
  return await sock.sendMessage(jid, {
    text: `▫️ 💀 ${toFont(text)}`,
    contextInfo: {
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: config.newsletterJid,
        newsletterName: config.newsletterName,
        serverMessageId: 1
      }
    }
  }, { quoted });
}

// ==========================================
// 3. AWAIT ⏳ - Must Be Sent First In Every Cmd
// ==========================================
async function sendAwait(sock, jid, quoted){
  return await sock.sendMessage(jid, {
    text: `▫️ ⏳ ${toFont('Please wait...')}`,
    contextInfo: {
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: config.newsletterJid,
        newsletterName: config.newsletterName,
        serverMessageId: 1
      }
    }
  }, { quoted });
}

// ==========================================
// 4. BOT PFP - Set Once Only, No Separation
// ==========================================
let pfpDone = false;
async function setBotPfpOnce(sock){
  if(pfpDone) return;
  try{
    const res = await axios.get(config.botPfp, { responseType: 'arraybuffer' });
    await sock.updateProfilePicture(sock.user.id, Buffer.from(res.data));
    pfpDone = true;
    console.log('✅ Bot PFP set once');
  }catch(e){ console.log('PFP failed:', e.message); }
}

// ==========================================
// 5. OWNER CHECK
// ==========================================
function isOwner(jid, participant){
  const num = (participant || jid || "").replace(/[^0-9]/g,'');
  const owner = config.ownerNumber.replace(/[^0-9]/g,'');
  const ownerZero = owner.startsWith('234') ? '0' + owner.slice(3) : owner;
  return num === owner || num === ownerZero || num.endsWith(owner.slice(3));
}

function isGroup(jid){
  return jid.endsWith('@g.us');
}

function isAdmin(sock, jid, participant){
  // Check in group metadata later - placeholder
  return false;
}

// ==========================================
// 6. GET TEXT FROM MESSAGE - All Types
// ==========================================
function getText(m){
  return m.message?.conversation
    || m.message?.extendedTextMessage?.text
    || m.message?.imageMessage?.caption
    || m.message?.videoMessage?.caption
    || m.message?.documentMessage?.caption
    || "";
}

function getSender(m){
  return m.key.participant || m.key.remoteJid;
}

// ==========================================
// 7. RUNTIME / UPTIME
// ==========================================
function runtime(seconds){
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600*24));
  const h = Math.floor(seconds % (3600*24) / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = Math.floor(seconds % 60);
  const dDisplay = d > 0 ? d + (d === 1 ? " day, " : " days, ") : "";
  const hDisplay = h > 0 ? h + (h === 1 ? " hour, " : " hours, ") : "";
  const mDisplay = m > 0 ? m + (m === 1 ? " minute, " : " minutes, ") : "";
  const sDisplay = s > 0 ? s + (s === 1 ? " second" : " seconds") : "";
  return dDisplay + hDisplay + mDisplay + sDisplay;
}

// ==========================================
// 8. REACT + DELETE AWAIT MSG
// ==========================================
async function react(sock, jid, key, emoji){
  try{ await sock.sendMessage(jid, { react: { text: emoji, key } }); }catch(e){}
}

async function sleep(ms){
  return new Promise(r => setTimeout(r, ms));
}

// ==========================================
// 9. DOWNLOAD BUFFER - For PFP / Media
// ==========================================
async function getBuffer(url){
  const res = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(res.data);
}

module.exports = {
  toFont,
  facelessReply,
  sendAwait,
  setBotPfpOnce,
  isOwner,
  isGroup,
  isAdmin,
  getText,
  getSender,
  runtime,
  react,
  sleep,
  getBuffer
};
