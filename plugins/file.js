const { facelessReply, sendAwait } = require('../lib/function');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const saveDir = path.join(__dirname, '../database/savedfiles');

function ensureDir(){
  try{ fs.mkdirSync(saveDir, { recursive: true }); }catch{}
  return saveDir;
}

module.exports = {
  name: "file",
  async run(sock, m, jid, cmd, args, text, isOwner, isGroup, sender){

    const fileCmds = ['tofile','getfile','savefile','listfiles','files','deletefile','delfile','renamefile','downloadfile','fetchfile','tovideo','toaudio','topdf','toimage','tourl','geturl'];
    if(!fileCmds.includes(cmd)) return false;

    const ctx = m.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;

    // ================= TOFILE - REAL: Convert quoted media to file and send as document =================
    if(cmd === 'tofile'){
      await sendAwait(sock, jid, m);
      if(!quoted){
        await facelessReply(sock, jid, "Reply To An Image / Video / Audio / Sticker With .tofile", m);
        return true;
      }
      try{
        const quotedMsg = quoted;
        // Use Baileys download helper via sock
        const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
        const type = Object.keys(quotedMsg)[0]; // imageMessage, videoMessage, etc
        const stream = await downloadContentFromMessage(quotedMsg[type], type.replace('Message',''));
        let buffer = Buffer.from([]);
        for await(const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        if(!buffer.length) throw new Error("Empty file");
        const extMap = { imageMessage: '.jpg', videoMessage: '.mp4', audioMessage: '.mp3', documentMessage: '.bin', stickerMessage: '.webp' };
        const ext = extMap[type] || '.bin';
        const fileName = text || `file_${Date.now()}${ext}`;
        await sock.sendMessage(jid, { document: buffer, fileName, mimetype: 'application/octet-stream', caption: `File: ${fileName}` }, { quoted: m });
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= SAVEFILE - REAL: Save quoted media to server =================
    if(cmd === 'savefile'){
      if(!isOwner){ await facelessReply(sock, jid, "Owner Only", m); return true; }
      await sendAwait(sock, jid, m);
      if(!quoted){ await facelessReply(sock, jid, "Reply To Media With .savefile <name>", m); return true; }
      if(!text){ await facelessReply(sock, jid, "Usage: .savefile <name>", m); return true; }
      try{
        const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
        const type = Object.keys(quoted)[0];
        const stream = await downloadContentFromMessage(quoted[type], type.replace('Message',''));
        let buffer = Buffer.from([]);
        for await(const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        ensureDir();
        const filePath = path.join(saveDir, text);
        fs.writeFileSync(filePath, buffer);
        await facelessReply(sock, jid, `File Saved:\nName: ${text}\nSize: ${(buffer.length/1024).toFixed(1)} KB`, m);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= GETFILE - REAL: Get saved file =================
    if(cmd === 'getfile'){
      if(!isOwner){ await facelessReply(sock, jid, "Owner Only", m); return true; }
      await sendAwait(sock, jid, m);
      if(!text){ await facelessReply(sock, jid, "Usage: .getfile <name>\nUse .listfiles to see files", m); return true; }
      try{
        const filePath = path.join(ensureDir(), text);
        if(!fs.existsSync(filePath)){ await facelessReply(sock, jid, "File Not Found", m); return true; }
        const buffer = fs.readFileSync(filePath);
        await sock.sendMessage(jid, { document: buffer, fileName: text, mimetype: 'application/octet-stream' }, { quoted: m });
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= LISTFILES - REAL =================
    if(cmd === 'listfiles' || cmd === 'files'){
      await sendAwait(sock, jid, m);
      try{
        ensureDir();
        const files = fs.readdirSync(saveDir);
        if(!files.length){ await facelessReply(sock, jid, "No Saved Files Yet\nUse .savefile to save one", m); return true; }
        let txt = `▫️ 💀 Saved Files (${files.length}):\n\n`;
        files.forEach((f,i) => {
          const size = (fs.statSync(path.join(saveDir,f)).size/1024).toFixed(1);
          txt += `${i+1}. ${f} - ${size} KB\n`;
        });
        txt += `\nGet With: .getfile <name>`;
        await facelessReply(sock, jid, txt, m);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= DELETEFILE - REAL =================
    if(cmd === 'deletefile' || cmd === 'delfile'){
      if(!isOwner){ await facelessReply(sock, jid, "Owner Only", m); return true; }
      await sendAwait(sock, jid, m);
      if(!text){ await facelessReply(sock, jid, "Usage: .deletefile <name>", m); return true; }
      try{
        const filePath = path.join(ensureDir(), text);
        if(!fs.existsSync(filePath)){ await facelessReply(sock, jid, "File Not Found", m); return true; }
        fs.unlinkSync(filePath);
        await facelessReply(sock, jid, `File Deleted: ${text}`, m);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= RENAMEFILE - REAL =================
    if(cmd === 'renamefile'){
      if(!isOwner){ await facelessReply(sock, jid, "Owner Only", m); return true; }
      await sendAwait(sock, jid, m);
      // .renamefile old | new
      if(!text.includes('|')){ await facelessReply(sock, jid, "Usage: .renamefile oldname | newname", m); return true; }
      const [oldName, newName] = text.split('|').map(s=>s.trim());
      try{
        const oldPath = path.join(ensureDir(), oldName);
        const newPath = path.join(ensureDir(), newName);
        if(!fs.existsSync(oldPath)){ await facelessReply(sock, jid, "Old File Not Found", m); return true; }
        fs.renameSync(oldPath, newPath);
        await facelessReply(sock, jid, `Renamed:\n${oldName} -> ${newName}`, m);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= DOWNLOADFILE / FETCHFILE - REAL: Download link as file =================
    if(cmd === 'downloadfile' || cmd === 'fetchfile'){
      await sendAwait(sock, jid, m);
      if(!text || !text.startsWith('http')){ await facelessReply(sock, jid, "Usage: .downloadfile <link>", m); return true; }
      try{
        const res = await axios.get(text, { responseType: 'arraybuffer', timeout: 30000 });
        const buffer = Buffer.from(res.data);
        let fileName = text.split('/').pop().split('?')[0] || `download_${Date.now()}`;
        if(!fileName.includes('.')) fileName += '.bin';
        await sock.sendMessage(jid, { document: buffer, fileName, mimetype: 'application/octet-stream', caption: `Downloaded: ${fileName} (${(buffer.length/1024).toFixed(1)} KB)` }, { quoted: m });
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= TOURL - REAL: Upload quoted media to catbox and get link =================
    if(cmd === 'tourl' || cmd === 'geturl'){
      await sendAwait(sock, jid, m);
      if(!quoted){ await facelessReply(sock, jid, "Reply To Image / Video With .tourl", m); return true; }
      try{
        const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
        const type = Object.keys(quoted)[0];
        const stream = await downloadContentFromMessage(quoted[type], type.replace('Message',''));
        let buffer = Buffer.from([]);
        for await(const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        const FormData = require('form-data');
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', buffer, { filename: `upload_${Date.now()}.jpg` });
        const res = await axios.post('https://catbox.moe/user/api.php', form, { headers: form.getHeaders(), timeout: 30000 });
        await facelessReply(sock, jid, `Upload Done:\nLink: ${res.data}`, m);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= TOIMAGE / TOAUDIO / TOVIDEO - REAL conversions =================
    if(cmd === 'toimage'){
      await sendAwait(sock, jid, m);
      if(!quoted){ await facelessReply(sock, jid, "Reply To Sticker With .toimage", m); return true; }
      try{
        const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
        const type = Object.keys(quoted)[0];
        const stream = await downloadContentFromMessage(quoted[type], type.replace('Message',''));
        let buffer = Buffer.from([]);
        for await(const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        await sock.sendMessage(jid, { image: buffer, caption: "Converted To Image" }, { quoted: m });
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }
    if(cmd === 'toaudio'){
      await sendAwait(sock, jid, m);
      if(!quoted){ await facelessReply(sock, jid, "Reply To Video With .toaudio", m); return true; }
      try{
        const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
        const type = Object.keys(quoted)[0];
        const stream = await downloadContentFromMessage(quoted[type], type.replace('Message',''));
        let buffer = Buffer.from([]);
        for await(const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        await sock.sendMessage(jid, { audio: buffer, mimetype: 'audio/mp4', ptt: false }, { quoted: m });
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }
    if(cmd === 'tovideo'){
      await sendAwait(sock, jid, m);
      if(!quoted){ await facelessReply(sock, jid, "Reply To Sticker With .tovideo", m); return true; }
      try{
        const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
        const type = Object.keys(quoted)[0];
        const stream = await downloadContentFromMessage(quoted[type], type.replace('Message',''));
        let buffer = Buffer.from([]);
        for await(const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        await sock.sendMessage(jid, { video: buffer, gifPlayback: true, caption: "Converted To Video" }, { quoted: m });
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    return false;
  }
};
