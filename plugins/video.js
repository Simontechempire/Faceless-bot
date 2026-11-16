const { facelessReply, sendAwait } = require('../lib/function');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');

const tmpDir = path.join(os.tmpdir(), 'faceless_video');
try{ fs.mkdirSync(tmpDir, { recursive: true }); }catch{}

function runFFmpeg(args){
  return new Promise((resolve, reject) => {
    exec(`ffmpeg -y ${args}`, (err, stdout, stderr) => {
      if(err) reject(new Error("FFmpeg not installed on server OR failed. Install: apt install ffmpeg"));
      else resolve(stdout);
    });
  });
}
async function downloadQuoted(quoted){
  const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
  const type = Object.keys(quoted)[0];
  const stream = await downloadContentFromMessage(quoted[type], type.replace('Message',''));
  let buffer = Buffer.from([]);
  for await(const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
  return buffer;
}

module.exports = {
  name: "video",
  async run(sock, m, jid, cmd, args, text, isOwner, isGroup, sender){

    const videoCmds = ['tovideo','togif','slowmo','fast','reverse','mutevideo','muted','trim','cut','volume','bassvideo','blackwhite','bwvideo','rotatevideo','compressvideo','tomp3','toaudio2'];
    if(!videoCmds.includes(cmd)) return false;

    const ctx = m.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;
    const hasQuoted = quoted && (quoted.videoMessage || quoted.imageMessage || quoted.stickerMessage || quoted.audioMessage);

    // ================= TOVIDEO - REAL: Sticker / Image to Video =================
    if(cmd === 'tovideo'){
      await sendAwait(sock, jid, m);
      if(!hasQuoted){ await facelessReply(sock, jid, "Reply To Sticker / Image With .tovideo", m); return true; }
      try{
        const buffer = await downloadQuoted(quoted);
        await sock.sendMessage(jid, { video: buffer, gifPlayback: true, caption: "Converted To Video" }, { quoted: m });
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= TOGIF - REAL: Video to GIF =================
    if(cmd === 'togif'){
      await sendAwait(sock, jid, m);
      if(!hasQuoted || !quoted.videoMessage){ await facelessReply(sock, jid, "Reply To A Video With .togif", m); return true; }
      try{
        const buffer = await downloadQuoted(quoted);
        const input = path.join(tmpDir, `in_${Date.now()}.mp4`);
        const output = path.join(tmpDir, `out_${Date.now()}.mp4`);
        fs.writeFileSync(input, buffer);
        await runFFmpeg(`-i "${input}" -vf "fps=10,scale=320:-1:flags=lanczos" -c:v libx264 -pix_fmt yuv420p "${output}"`);
        const out = fs.readFileSync(output);
        await sock.sendMessage(jid, { video: out, gifPlayback: true, caption: "Converted To GIF" }, { quoted: m });
        fs.unlinkSync(input); fs.unlinkSync(output);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= SLOWMO - REAL FFmpeg =================
    if(cmd === 'slowmo'){
      await sendAwait(sock, jid, m);
      if(!hasQuoted || !quoted.videoMessage){ await facelessReply(sock, jid, "Reply To Video With .slowmo", m); return true; }
      try{
        const buffer = await downloadQuoted(quoted);
        const input = path.join(tmpDir, `in_${Date.now()}.mp4`);
        const output = path.join(tmpDir, `out_${Date.now()}.mp4`);
        fs.writeFileSync(input, buffer);
        await runFFmpeg(`-i "${input}" -filter:v "setpts=2.0*PTS" -filter:a "atempo=0.5" "${output}"`);
        const out = fs.readFileSync(output);
        await sock.sendMessage(jid, { video: out, caption: "Slow Motion (0.5x)" }, { quoted: m });
        fs.unlinkSync(input); fs.unlinkSync(output);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= FAST - REAL FFmpeg =================
    if(cmd === 'fast'){
      await sendAwait(sock, jid, m);
      if(!hasQuoted || !quoted.videoMessage){ await facelessReply(sock, jid, "Reply To Video With .fast", m); return true; }
      try{
        const buffer = await downloadQuoted(quoted);
        const input = path.join(tmpDir, `in_${Date.now()}.mp4`);
        const output = path.join(tmpDir, `out_${Date.now()}.mp4`);
        fs.writeFileSync(input, buffer);
        await runFFmpeg(`-i "${input}" -filter:v "setpts=0.5*PTS" -filter:a "atempo=2.0" "${output}"`);
        const out = fs.readFileSync(output);
        await sock.sendMessage(jid, { video: out, caption: "Fast Motion (2x)" }, { quoted: m });
        fs.unlinkSync(input); fs.unlinkSync(output);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= REVERSE - REAL FFmpeg =================
    if(cmd === 'reverse'){
      await sendAwait(sock, jid, m);
      if(!hasQuoted || !(quoted.videoMessage || quoted.audioMessage)){ await facelessReply(sock, jid, "Reply To Video / Audio With .reverse", m); return true; }
      try{
        const buffer = await downloadQuoted(quoted);
        const ext = quoted.videoMessage ? 'mp4' : 'mp3';
        const input = path.join(tmpDir, `in_${Date.now()}.${ext}`);
        const output = path.join(tmpDir, `out_${Date.now()}.${ext}`);
        fs.writeFileSync(input, buffer);
        if(ext === 'mp4') await runFFmpeg(`-i "${input}" -vf reverse -af areverse "${output}"`);
        else await runFFmpeg(`-i "${input}" -af areverse "${output}"`);
        const out = fs.readFileSync(output);
        if(ext === 'mp4') await sock.sendMessage(jid, { video: out, caption: "Reversed Video" }, { quoted: m });
        else await sock.sendMessage(jid, { audio: out, mimetype: 'audio/mp4' }, { quoted: m });
        fs.unlinkSync(input); fs.unlinkSync(output);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= MUTE - REAL FFmpeg =================
    if(cmd === 'mutevideo' || cmd === 'muted'){
      await sendAwait(sock, jid, m);
      if(!hasQuoted || !quoted.videoMessage){ await facelessReply(sock, jid, "Reply To Video With .mutevideo", m); return true; }
      try{
        const buffer = await downloadQuoted(quoted);
        const input = path.join(tmpDir, `in_${Date.now()}.mp4`);
        const output = path.join(tmpDir, `out_${Date.now()}.mp4`);
        fs.writeFileSync(input, buffer);
        await runFFmpeg(`-i "${input}" -c:v copy -an "${output}"`);
        const out = fs.readFileSync(output);
        await sock.sendMessage(jid, { video: out, caption: "Muted Video" }, { quoted: m });
        fs.unlinkSync(input); fs.unlinkSync(output);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= TRIM / CUT - REAL FFmpeg =================
    if(cmd === 'trim' || cmd === 'cut'){
      await sendAwait(sock, jid, m);
      // .trim 0 5 = from 0 sec to 5 sec
      const start = parseFloat(args[0]) || 0;
      const duration = parseFloat(args[1]) || 5;
      if(!hasQuoted || !quoted.videoMessage){ await facelessReply(sock, jid, "Reply To Video With .trim <start> <duration>\nExample: .trim 0 5", m); return true; }
      try{
        const buffer = await downloadQuoted(quoted);
        const input = path.join(tmpDir, `in_${Date.now()}.mp4`);
        const output = path.join(tmpDir, `out_${Date.now()}.mp4`);
        fs.writeFileSync(input, buffer);
        await runFFmpeg(`-i "${input}" -ss ${start} -t ${duration} -c copy "${output}"`);
        const out = fs.readFileSync(output);
        await sock.sendMessage(jid, { video: out, caption: `Trimmed: ${start}s to ${start+duration}s` }, { quoted: m });
        fs.unlinkSync(input); fs.unlinkSync(output);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= VOLUME - REAL =================
    if(cmd === 'volume'){
      await sendAwait(sock, jid, m);
      const vol = parseFloat(args[0]) || 2; // 2 = 200%
      if(!hasQuoted || !(quoted.videoMessage || quoted.audioMessage)){ await facelessReply(sock, jid, "Reply To Video / Audio With .volume <number>\nExample: .volume 2", m); return true; }
      try{
        const buffer = await downloadQuoted(quoted);
        const ext = quoted.videoMessage ? 'mp4' : 'mp3';
        const input = path.join(tmpDir, `in_${Date.now()}.${ext}`);
        const output = path.join(tmpDir, `out_${Date.now()}.${ext}`);
        fs.writeFileSync(input, buffer);
        await runFFmpeg(`-i "${input}" -af "volume=${vol}" "${output}"`);
        const out = fs.readFileSync(output);
        if(ext === 'mp4') await sock.sendMessage(jid, { video: out, caption: `Volume x${vol}` }, { quoted: m });
        else await sock.sendMessage(jid, { audio: out, mimetype: 'audio/mp4' }, { quoted: m });
        fs.unlinkSync(input); fs.unlinkSync(output);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= BLACK & WHITE - REAL =================
    if(cmd === 'blackwhite' || cmd === 'bwvideo'){
      await sendAwait(sock, jid, m);
      if(!hasQuoted || !quoted.videoMessage){ await facelessReply(sock, jid, "Reply To Video With .bwvideo", m); return true; }
      try{
        const buffer = await downloadQuoted(quoted);
        const input = path.join(tmpDir, `in_${Date.now()}.mp4`);
        const output = path.join(tmpDir, `out_${Date.now()}.mp4`);
        fs.writeFileSync(input, buffer);
        await runFFmpeg(`-i "${input}" -vf "hue=s=0" "${output}"`);
        const out = fs.readFileSync(output);
        await sock.sendMessage(jid, { video: out, caption: "Black & White Video" }, { quoted: m });
        fs.unlinkSync(input); fs.unlinkSync(output);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= ROTATE VIDEO - REAL =================
    if(cmd === 'rotatevideo'){
      await sendAwait(sock, jid, m);
      const deg = parseInt(args[0]) || 90;
      const transpose = deg === 90 ? 1 : deg === 180 ? 2 : deg === 270 ? 0 : 1;
      if(!hasQuoted || !quoted.videoMessage){ await facelessReply(sock, jid, "Reply To Video With .rotatevideo 90/180/270", m); return true; }
      try{
        const buffer = await downloadQuoted(quoted);
        const input = path.join(tmpDir, `in_${Date.now()}.mp4`);
        const output = path.join(tmpDir, `out_${Date.now()}.mp4`);
        fs.writeFileSync(input, buffer);
        await runFFmpeg(`-i "${input}" -vf "transpose=${transpose}" "${output}"`);
        const out = fs.readFileSync(output);
        await sock.sendMessage(jid, { video: out, caption: `Rotated ${deg}°` }, { quoted: m });
        fs.unlinkSync(input); fs.unlinkSync(output);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= COMPRESS - REAL =================
    if(cmd === 'compressvideo'){
      await sendAwait(sock, jid, m);
      if(!hasQuoted || !quoted.videoMessage){ await facelessReply(sock, jid, "Reply To Video With .compressvideo", m); return true; }
      try{
        const buffer = await downloadQuoted(quoted);
        const input = path.join(tmpDir, `in_${Date.now()}.mp4`);
        const output = path.join(tmpDir, `out_${Date.now()}.mp4`);
        fs.writeFileSync(input, buffer);
        await runFFmpeg(`-i "${input}" -vcodec libx264 -crf 28 -preset veryfast "${output}"`);
        const out = fs.readFileSync(output);
        await sock.sendMessage(jid, { video: out, caption: `Compressed: ${(buffer.length/1024/1024).toFixed(1)}MB -> ${(out.length/1024/1024).toFixed(1)}MB` }, { quoted: m });
        fs.unlinkSync(input); fs.unlinkSync(output);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= TOMP3 - REAL =================
    if(cmd === 'tomp3' || cmd === 'toaudio2'){
      await sendAwait(sock, jid, m);
      if(!hasQuoted || !quoted.videoMessage){ await facelessReply(sock, jid, "Reply To Video With .tomp3", m); return true; }
      try{
        const buffer = await downloadQuoted(quoted);
        const input = path.join(tmpDir, `in_${Date.now()}.mp4`);
        const output = path.join(tmpDir, `out_${Date.now()}.mp3`);
        fs.writeFileSync(input, buffer);
        await runFFmpeg(`-i "${input}" -vn -c:a libmp3lame -q:a 2 "${output}"`);
        const out = fs.readFileSync(output);
        await sock.sendMessage(jid, { audio: out, mimetype: 'audio/mp4' }, { quoted: m });
        fs.unlinkSync(input); fs.unlinkSync(output);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    return false;
  }
};
