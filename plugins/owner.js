const { facelessReply, sendAwait, runtime } = require('../lib/function');
const config = require('../config');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

let botMode = config.mode; // real in-memory mode

module.exports = {
  name: "owner",
  getMode: () => botMode,
  setMode: (m) => { botMode = m; },

  async run(sock, m, jid, cmd, args, text, isOwner, isGroup, sender) {

    // All owner cmds need owner check - real
    const ownerCmds = ['mode','eval','exec','broadcast','bc','shutdown','restart','setpfp','setbio','block','unblock','join','leave','clearsession','setprefix'];
    if (!ownerCmds.includes(cmd)) return false;

    if (!isOwner) {
      await facelessReply(sock, jid, "This Command Is For Owner Only", m);
      return true;
    }

    // ================= MODE =================
    if (cmd === 'mode') {
      await sendAwait(sock, jid, m);
      const mode = (args[0] || "").toLowerCase();
      if (mode !== 'public' && mode !== 'private') {
        await facelessReply(sock, jid, `Current Mode: ${botMode}\nUsage: .mode public / .mode private`, m);
        return true;
      }
      botMode = mode;
      config.mode = mode;
      await facelessReply(sock, jid, `Mode Changed To: ${mode}`, m);
      return true;
    }

    // ================= EVAL - REAL JS EVAL =================
    if (cmd === 'eval') {
      await sendAwait(sock, jid, m);
      if (!text) {
        await facelessReply(sock, jid, "Usage: .eval <code>", m);
        return true;
      }
      try {
        let result = await eval(text);
        if (typeof result !== 'string') result = require('util').inspect(result);
        await facelessReply(sock, jid, `Eval Result:\n${result.slice(0, 3000)}`, m);
      } catch (e) {
        await facelessReply(sock, jid, `Eval Error:\n${e.message}`, m);
      }
      return true;
    }

    // ================= EXEC - REAL SHELL =================
    if (cmd === 'exec') {
      await sendAwait(sock, jid, m);
      if (!text) {
        await facelessReply(sock, jid, "Usage: .exec <command>", m);
        return true;
      }
      exec(text, (err, stdout, stderr) => {
        const out = (stdout || stderr || err?.message || "Done").slice(0, 3000);
        facelessReply(sock, jid, `Exec Result:\n${out}`, m);
      });
      return true;
    }

    // ================= BROADCAST - REAL TO ALL CHATS =================
    if (cmd === 'broadcast' || cmd === 'bc') {
      await sendAwait(sock, jid, m);
      if (!text) {
        await facelessReply(sock, jid, "Usage: .broadcast <message>", m);
        return true;
      }
      const chats = await sock.groupFetchAllParticipating().catch(() => ({}));
      let count = 0;
      for (const id of Object.keys(chats)) {
        try {
          await sock.sendMessage(id, { text: `▫️ 💀 Broadcast From FACELESS BOT\n\n${text}` });
          count++;
          await new Promise(r => setTimeout(r, 500));
        } catch {}
      }
      await facelessReply(sock, jid, `Broadcast Sent To ${count} Groups`, m);
      return true;
    }

    // ================= SHUTDOWN - REAL =================
    if (cmd === 'shutdown') {
      await sendAwait(sock, jid, m);
      await facelessReply(sock, jid, "Shutting Down FACELESS BOT...", m);
      setTimeout(() => process.exit(0), 1000);
      return true;
    }

    // ================= RESTART - REAL =================
    if (cmd === 'restart') {
      await sendAwait(sock, jid, m);
      await facelessReply(sock, jid, "Restarting FACELESS BOT...", m);
      setTimeout(() => process.exit(1), 1000);
      return true;
    }

    // ================= SETPFP - REAL FROM REPLY IMAGE =================
    if (cmd === 'setpfp') {
      await sendAwait(sock, jid, m);
      const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const imgMsg = quoted?.imageMessage;
      if (!imgMsg) {
        await facelessReply(sock, jid, "Reply To An Image With .setpfp", m);
        return true;
      }
      try {
        const quotedKey = m.message.extendedTextMessage.contextInfo.stanzaId;
        const quotedMsg = { key: { remoteJid: jid, id: quotedKey, fromMe: false }, message: quoted };
        const buffer = await sock.downloadMediaMessage ? await require('@whiskeysockets/baileys').downloadMediaMessage(quotedMsg, 'buffer', {}, { logger: console, reupload: sock.updateMediaMessage }) : null;
        // Fallback: use downloadContentFromMessage
        const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
        const stream = await downloadContentFromMessage(imgMsg, 'image');
        let buf = Buffer.from([]);
        for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
        await sock.updateProfilePicture(sock.user.id, buf);
        await facelessReply(sock, jid, "Bot Profile Picture Updated", m);
      } catch (e) {
        await facelessReply(sock, jid, `Failed To Update PFP: ${e.message}`, m);
      }
      return true;
    }

    // ================= SETBIO - REAL =================
    if (cmd === 'setbio') {
      await sendAwait(sock, jid, m);
      if (!text) {
        await facelessReply(sock, jid, "Usage: .setbio <text>", m);
        return true;
      }
      try {
        await sock.updateProfileStatus(text);
        await facelessReply(sock, jid, `Bio Updated To: ${text}`, m);
      } catch (e) {
        await facelessReply(sock, jid, `Failed: ${e.message}`, m);
      }
      return true;
    }

    // ================= BLOCK / UNBLOCK - REAL =================
    if (cmd === 'block' || cmd === 'unblock') {
      await sendAwait(sock, jid, m);
      let target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        || m.message?.extendedTextMessage?.contextInfo?.participant
        || (args[0] ? args[0].replace(/[^0-9]/g,'') + '@s.whatsapp.net' : null);
      if (!target) {
        await facelessReply(sock, jid, "Reply / Mention / Give Number: .block 234xxx", m);
        return true;
      }
      try {
        await sock.updateBlockStatus(target, cmd === 'block' ? 'block' : 'unblock');
        await facelessReply(sock, jid, `${cmd === 'block' ? 'Blocked' : 'Unblocked'}: ${target.split('@')[0]}`, m);
      } catch (e) {
        await facelessReply(sock, jid, `Failed: ${e.message}`, m);
      }
      return true;
    }

    // ================= JOIN - REAL =================
    if (cmd === 'join') {
      await sendAwait(sock, jid, m);
      const link = args[0];
      if (!link || !link.includes('whatsapp.com')) {
        await facelessReply(sock, jid, "Usage: .join <group link>", m);
        return true;
      }
      try {
        const code = link.split('/').pop().split('?')[0];
        await sock.groupAcceptInvite(code);
        await facelessReply(sock, jid, "Joined Group Successfully", m);
      } catch (e) {
        await facelessReply(sock, jid, `Failed To Join: ${e.message}`, m);
      }
      return true;
    }

    // ================= LEAVE - REAL =================
    if (cmd === 'leave') {
      await sendAwait(sock, jid, m);
      if (!isGroup) {
        await facelessReply(sock, jid, "This Command Works In Group Only", m);
        return true;
      }
      await facelessReply(sock, jid, "Leaving Group, Bye...", m);
      setTimeout(() => sock.groupLeave(jid).catch(()=>{}), 1000);
      return true;
    }

    // ================= CLEARSESSION =================
    if (cmd === 'clearsession') {
      await sendAwait(sock, jid, m);
      try {
        const sessPath = path.join(__dirname, '../session');
        if (fs.existsSync(sessPath)) fs.rmSync(sessPath, { recursive: true, force: true });
        await facelessReply(sock, jid, "Session Cleared, Re-Pair Bot", m);
      } catch (e) {
        await facelessReply(sock, jid, `Failed: ${e.message}`, m);
      }
      return true;
    }

    // ================= SETPREFIX =================
    if (cmd === 'setprefix') {
      await sendAwait(sock, jid, m);
      if (!args[0]) {
        await facelessReply(sock, jid, "Usage: .setprefix <new prefix>", m);
        return true;
      }
      config.prefix = args[0];
      await facelessReply(sock, jid, `Prefix Changed To: ${args[0]}`, m);
      return true;
    }

    return false;
  }
};
