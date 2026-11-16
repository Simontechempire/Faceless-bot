const { facelessReply, sendAwait, runtime } = require('../lib/function');
const menus = require('../lib/menu');
const config = require('../config');

module.exports = {
  name: "main",

  async run(sock, m, jid, cmd, args, text, isOwner, isGroup, sender) {

    // ================= PING =================
    if (cmd === 'ping') {
      await sendAwait(sock, jid, m);
      const start = Date.now();
      try {
        const sent = await sock.sendMessage(jid, { text: "▫️ Testing..." }, { quoted: m });
        const latency = Date.now() - start;
        // delete test msg cleanly
        try { await sock.sendMessage(jid, { delete: sent.key }); } catch {}
        await facelessReply(sock, jid, `Pong!\nLatency: ${latency}ms\nUptime: ${runtime(process.uptime())}\nMode: ${config.mode}`, m);
      } catch (e) {
        await facelessReply(sock, jid, `Pong!\nLatency: ${Date.now() - start}ms\nUptime: ${runtime(process.uptime())}`, m);
      }
      return true;
    }

    // ================= ALIVE =================
    if (cmd === 'alive') {
      await sendAwait(sock, jid, m);
      await facelessReply(sock, jid, `FACELESS BOT Is Alive\nPrefix: ${config.prefix}\nMode: ${config.mode}\nUptime: ${runtime(process.uptime())}\nOwner: +234 903 748 3649`, m);
      return true;
    }

    // ================= OWNER - REAL VCARD =================
    if (cmd === 'owner') {
      await sendAwait(sock, jid, m);
      const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${config.ownerName}\nORG:FACELESS BOT;\nTEL;TYPE=CELL;TYPE=VOICE;waid=${config.ownerNumber}:+${config.ownerNumber}\nEND:VCARD`;
      await sock.sendMessage(jid, {
        contacts: {
          displayName: config.ownerName,
          contacts: [{ vcard }]
        },
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: config.newsletterJid,
            newsletterName: config.newsletterName,
            serverMessageId: 1
          }
        }
      }, { quoted: m });
      return true;
    }

    // ================= MENU =================
    if (cmd === 'menu') {
      await sendAwait(sock, jid, m);
      await facelessReply(sock, jid, menus.menu, m);
      return true;
    }

    // ================= ALLMENU =================
    if (cmd === 'allmenu') {
      await sendAwait(sock, jid, m);
      await facelessReply(sock, jid, menus.allmenu, m);
      return true;
    }

    // ================= SUB MENUS =================
    const subMenus = {
      'ownermenu': menus.ownerMenu,
      'groupmenu': menus.groupMenu,
      'antimenu': menus.antiMenu,
      'downloadmenu': menus.downloaderMenu,
      'funmenu': menus.funMenu,
      'gamemenu': menus.gameMenu,
      'economymenu': menus.economyMenu,
      'aimenu': menus.aiMenu,
      'animemenu': menus.animeMenu,
      'adultmenu': menus.adultMenu,
      'mediamenu': menus.mediaMenu,
      'toolsmenu': menus.mediaMenu,
      'searchmenu': menus.searchMenu
    };

    if (subMenus[cmd]) {
      await sendAwait(sock, jid, m);
      await facelessReply(sock, jid, subMenus[cmd], m);
      return true;
    }

    // ================= RUNTIME =================
    if (cmd === 'runtime' || cmd === 'uptime') {
      await sendAwait(sock, jid, m);
      await facelessReply(sock, jid, `Uptime: ${runtime(process.uptime())}`, m);
      return true;
    }

    // ================= SPEED =================
    if (cmd === 'speed') {
      await sendAwait(sock, jid, m);
      const start = Date.now();
      await facelessReply(sock, jid, `Speed: ${Date.now() - start}ms`, m);
      return true;
    }

    // ================= SCRIPT =================
    if (cmd === 'script' || cmd === 'repo') {
      await sendAwait(sock, jid, m);
      await facelessReply(sock, jid, `FACELESS BOT\nVersion: ${config.version}\nOwner: +234 903 748 3649\nPrefix: ${config.prefix}\nMode: ${config.mode}`, m);
      return true;
    }

    return false;
  }
};
