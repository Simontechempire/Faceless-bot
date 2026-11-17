// 👤 FACELESS - menu.js - with PFP from config.js
let cfg = {};
try { cfg = require('../config'); } catch { try { cfg = require('../settings'); } catch { cfg = {}; } }

const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'menu',
  commands: ['menu','help','list','allmenu'],
  run: async (sock, m, jid, cmd, args, text) => {
    if(!['menu','help','list','allmenu'].includes(cmd)) return false;

    // PFP from config.js - supports any of these keys
    const pfp = cfg.botPfp || cfg.pfp || cfg.menuImage || cfg.menuPfp || cfg.image || cfg.menuImg || cfg.botImage || '';

    const menu = `╭━━〔 ⚡ AUTO MENU 〕
│
│ ➠ .autoread
│ ➠ .autorecord
│ ➠ .autotyping
│ ➠ .autobio
│ ➠ .autoreact
│ ➠ .autostatus
│ ➠ .autoviewstatus
│ ➠ .antidelete
│ ➠ .anticall
│ ➠ .autolikestatus
│ ➠ .autodownload
│ ➠ .alwaysonline
│ ➠ .autoreply
│ ➠ .autosticker
│ ➠ .autotranslate
│ ➠ .autoblock
│ ➠ .autovoice
│ ➠ .autowelcome
│ ➠ .autogoodbye
│ ➠ .autosave
╰━━━━━━━━━━━━━━

╭━━〔 🛡️ ANTI MENU 〕
│
│ ➠ .antibug
│ ➠ .antispam
│ ➠ .antilink
│ ➠ .antibot
│ ➠ .antitag
│ ➠ .antiflood
│ ➠ .antifake
│ ➠ .antinsfw
│ ➠ .antidelete
│ ➠ .antiviewonce
│ ➠ .antisticker
│ ➠ .antiraid
│ ➠ .antigroup
│ ➠ .antipromote
│ ➠ .antidemote
│ ➠ .antimention
│ ➠ .antichannel
│ ➠ .antiforward
│ ➠ .antiedit
│ ➠ .antispamcall
╰━━━━━━━━━━━━━━

╭━━〔 🔧 MODERATOR MENU 〕
│
│ ➠ .kick
│ ➠ .add
│ ➠ .promote
│ ➠ .demote
│ ➠ .mute
│ ➠ .unmute
│ ➠ .warn
│ ➠ .warnings
│ ➠ .resetwarn
│ ➠ .ban
│ ➠ .unban
│ ➠ .delete
│ ➠ .tagall
│ ➠ .hidetag
│ ➠ .groupinfo
│ ➠ .staff
│ ➠ .resetlink
│ ➠ .lock
│ ➠ .unlock
│ ➠ .clear
╰━━━━━━━━━━━━━━

╭━━〔 👁️ VV MENU 〕
│
│ ➠ .vv
│ ➠ .vv2
│ ➠ .vv3
│ ➠ .vv4
│ ➠ .vv5
│ ➠ .save
│ ➠ .retrieve
│ ➠ .getviewonce
│ ➠ .viewonce
│ ➠ .vvimage
│ ➠ .vvvideo
│ ➠ .vvaudio
│ ➠ .vvsticker
│ ➠ .vvstatus
│ ➠ .vvdoc
│ ➠ .vvmedia
│ ➠ .vvforward
│ ➠ .vvinfo
│ ➠ .vvdownload
╰━━━━━━━━━━━━━━

╭━━〔 🎮 GAME MENU 〕
│
│ ➠ .tictactoe
│ ➠ .quiz
│ ➠ .riddle
│ ➠ .trivia
│ ➠ .math
│ ➠ .guess
│ ➠ .guessnumber
│ ➠ .guessword
│ ➠ .wordchain
│ ➠ .scramble
│ ➠ .rps
│ ➠ .coinflip
│ ➠ .dice
│ ➠ .truth
│ ➠ .dare
│ ➠ .hangman
│ ➠ .slots
│ ➠ .memory
│ ➠ .fasttype
│ ➠ .puzzle
╰━━━━━━━━━━━━━━

╭━━〔 💰 ECONOMY MENU 〕
│
│ ➠ .balance
│ ➠ .daily
│ ➠ .weekly
│ ➠ .monthly
│ ➠ .work
│ ➠ .crime
│ ➠ .rob
│ ➠ .deposit
│ ➠ .withdraw
│ ➠ .transfer
│ ➠ .pay
│ ➠ .shop
│ ➠ .buy
│ ➠ .sell
│ ➠ .inventory
│ ➠ .leaderboard
│ ➠ .coin
│ ➠ .bank
│ ➠ .gamble
│ ➠ .beg
│ ➠ .fish
│ ➠ .hunt
│ ➠ .mine
│ ➠ .dailybonus
│ ➠ .profile
╰━━━━━━━━━━━━━━

╭━━〔 👥 GROUP MENU 〕
│
│ ➠ .group
│ ➠ .setname
│ ➠ .setdesc
│ ➠ .setgpp
│ ➠ .welcome
│ ➠ .goodbye
│ ➠ .setwelcome
│ ➠ .setgoodbye
│ ➠ .open
│ ➠ .close
│ ➠ .link
│ ➠ .revoke
│ ➠ .invite
│ ➠ .leave
│ ➠ .join
│ ➠ .poll
│ ➠ .tagall
│ ➠ .hidetag
│ ➠ .getmembers
│ ➠ .grouplist
│ ➠ .antilink
│ ➠ .groupinfo
│ ➠ .setsubject
│ ➠ .setdescription
│ ➠ .resetgroup
╰━━━━━━━━━━━━━━

╭━━〔 👑 OWNER MENU 〕
│
│ ➠ .owner
│ ➠ .mode
│ ➠ .public
│ ➠ .private
│ ➠ .setprefix
│ ➠ .setname
│ ➠ .setbio
│ ➠ .setpp
│ ➠ .restart
│ ➠ .shutdown
│ ➠ .update
│ ➠ .broadcast
│ ➠ .bcgroup
│ ➠ .bcstatus
│ ➠ .eval
│ ➠ .exec
│ ➠ .getfile
│ ➠ .delplugin
│ ➠ .listplugin
│ ➠ .join
│ ➠ .leave
│ ➠ .block
│ ➠ .unblock
│ ➠ .banuser
│ ➠ .unbanuser
│ ➠ .addowner
│ ➠ .delowner
│ ➠ .setppbot
│ ➠ .getsession
│ ➠ .clearsession
╰━━━━━━━━━━━━━━

╭━━〔 🎭 FUN MENU 〕
│
│ ➠ .joke
│ ➠ .meme
│ ➠ .quote
│ ➠ .fact
│ ➠ .insult
│ ➠ .compliment
│ ➠ .ship
│ ➠ .character
│ ➠ .flirt
│ ➠ .pickup
│ ➠ .rate
│ ➠ .howcute
│ ➠ .emoji
│ ➠ .8ball
│ ➠ .define
│ ➠ .fakechat
│ ➠ .truth
│ ➠ .dare
│ ➠ .roast
│ ➠ .say
│ ➠ .reverse
│ ➠ .repeat
│ ➠ .choose
│ ➠ .coin
│ ➠ .random
╰━━━━━━━━━━━━━━

╭━━〔 🎨 STICKER MENU 〕
│
│ ➠ .sticker
│ ➠ .s
│ ➠ .take
│ ➠ .emojimix
│ ➠ .attp
│ ➠ .ttp
│ ➠ .brat
│ ➠ .bratvideo
│ ➠ .toimg
│ ➠ .tovideo
│ ➠ .circle
│ ➠ .crop
│ ➠ .getsticker
│ ➠ .wm
│ ➠ .qc
╰━━━━━━━━━━━━━━

╭━━〔 📥 DOWNLOAD MENU 〕
│
│ ➠ .play
│ ➠ .song
│ ➠ .video
│ ➠ .ytmp3
│ ➠ .ytmp4
│ ➠ .tiktok
│ ➠ .instagram
│ ➠ .facebook
│ ➠ .twitter
│ ➠ .mediafire
│ ➠ .gdrive
│ ➠ .pinterest
│ ➠ .spotify
│ ➠ .apk
│ ➠ .gitclone
╰━━━━━━━━━━━━━━

╭━━〔 🔍 SEARCH MENU 〕
│
│ ➠ .google
│ ➠ .wikipedia
│ ➠ .youtube
│ ➠ .lyrics
│ ➠ .weather
│ ➠ .news
│ ➠ .image
│ ➠ .pinterest
│ ➠ .github
│ ➠ .npm
│ ➠ .define
│ ➠ .movie
│ ➠ .anime
│ ➠ .manga
│ ➠ .search
╰━━━━━━━━━━━━━━

╭━━〔 🧰 TOOLS MENU 〕
│
│ ➠ .calc
│ ➠ .translate
│ ➠ .qr
│ ➠ .readqr
│ ➠ .shorturl
│ ➠ .tinyurl
│ ➠ .ssweb
│ ➠ .screenshot
│ ➠ .whois
│ ➠ .ping
│ ➠ .runtime
│ ➠ .uptime
│ ➠ .device
│ ➠ .inspect
│ ➠ .getinfo
╰━━━━━━━━━━━━━━

╭━━〔 🤖 AI MENU 〕
│
│ ➠ .ai
│ ➠ .chatgpt
│ ➠ .gemini
│ ➠ .meta
│ ➠ .blackbox
│ ➠ .deepseek
│ ➠ .llama
│ ➠ .copilot
│ ➠ .imagine
│ ➠ .removebg
│ ➠ .enhance
│ ➠ .caption
│ ➠ .summarize
│ ➠ .rewrite
│ ➠ .ask
╰━━━━━━━━━━━━━━

╭━━〔 🎵 AUDIO MENU 〕
│
│ ➠ .bass
│ ➠ .blown
│ ➠ .deep
│ ➠ .earrape
│ ➠ .fast
│ ➠ .nightcore
│ ➠ .reverseaudio
│ ➠ .robot
│ ➠ .slow
│ ➠ .smooth
│ ➠ .tupai
│ ➠ .volume
│ ➠ .toaudio
│ ➠ .tomp3
│ ➠ .audioinfo
╰━━━━━━━━━━━━━━

╭━━〔 🎬 VIDEO MENU 〕
│
│ ➠ .tovideo
│ ➠ .togif
│ ➠ .reversevideo
│ ➠ .slowvideo
│ ➠ .fastvideo
│ ➠ .compress
│ ➠ .trim
│ ➠ .videoinfo
│ ➠ .extractaudio
│ ➠ .mutevideo
╰━━━━━━━━━━━━━━

╭━━〔 🖼️ IMAGE MENU 〕
│
│ ➠ .toimg
│ ➠ .blur
│ ➠ .pixelate
│ ➠ .greyscale
│ ➠ .wanted
│ ➠ .triggered
│ ➠ .wasted
│ ➠ .beautiful
│ ➠ .removebg
│ ➠ .enhance
│ ➠ .remini
│ ➠ .crop
│ ➠ .resize
│ ➠ .flip
╰━━━━━━━━━━━━━━

╭━━〔 📱 STATUS MENU 〕
│
│ ➠ .getstatus
│ ➠ .save
│ ➠ .status
│ ➠ .statusview
│ ➠ .statuslike
│ ➠ .statusreply
│ ➠ .statusreact
│ ➠ .statusprivacy
│ ➠ .statusmute
│ ➠ .statusunmute
╰━━━━━━━━━━━━━━

╭━━〔 🌐 INTERNET MENU 〕
│
│ ➠ .ipinfo
│ ➠ .dns
│ ➠ .checkhost
│ ➠ .speedtest
│ ➠ .urlcheck
│ ➠ .isup
│ ➠ .domain
│ ➠ .whois
│ ➠ .shortlink
│ ➠ .fetch
╰━━━━━━━━━━━━━━

╭━━〔 📂 FILE MENU 〕
│
│ ➠ .get
│ ➠ .sendfile
│ ➠ .upload
│ ➠ .download
│ ➠ .zip
│ ➠ .unzip
│ ➠ .pdf
│ ➠ .doc
│ ➠ .txt
│ ➠ .fileinfo
╰━━━━━━━━━━━━━━

╭━━〔 👤 USER MENU 〕
│
│ ➠ .profile
│ ➠ .id
│ ➠ .jid
│ ➠ .tagme
│ ➠ .myinfo
│ ➠ .avatar
│ ➠ .getpp
│ ➠ .userinfo
│ ➠ .level
│ ➠ .rank
╰━━━━━━━━━━━━━━

╭━━〔 ⚙️ SETTINGS MENU 〕
│
│ ➠ .settings
│ ➠ .setprefix
│ ➠ .setlang
│ ➠ .settimezone
│ ➠ .setmode
│ ➠ .setwelcome
│ ➠ .setgoodbye
│ ➠ .setreply
│ ➠ .setmenu
│ ➠ .resetsettings
╰━━━━━━━━━━━━━━

> ╭─────────────
> │ © 2026 Faceless bot
> │ POWERED BY SIMON TECH INC
> │ 𝗪𝗢𝗟𝗙 𝗧𝗘𝗖𝗛 • 𝗘𝗫𝗖𝗘𝗟𝗟𝗘𝗡𝗖𝗘
> ╰─────────────`;

    // Send with PFP if set in config.js
    try{
      if(pfp){
        if(/^https?:\/\//i.test(pfp)){
          await sock.sendMessage(jid, { image: { url: pfp }, caption: menu }, { quoted: m });
        } else {
          const filePath = path.isAbsolute(pfp) ? pfp : path.join(__dirname, '..', pfp);
          if(fs.existsSync(filePath)){
            await sock.sendMessage(jid, { image: fs.readFileSync(filePath), caption: menu }, { quoted: m });
          } else {
            await sock.sendMessage(jid, { text: menu }, { quoted: m });
          }
        }
      } else {
        await sock.sendMessage(jid, { text: menu }, { quoted: m });
      }
    }catch{
      await sock.sendMessage(jid, { text: menu }, { quoted: m });
    }
    return true;
  }
};
