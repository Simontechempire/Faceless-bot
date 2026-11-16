// FACELESS Bot - All Menus
// Note: Font + ⏳ + 💀 + ▫️ + Newsletter is added in facelessReply, so menu text stays plain here

const prefix = ".";

const menu = `
╭━━━〔 FACELESS BOT 〕━━━╮
│
│ Owner : +234 903 748 3649
│ Prefix : ${prefix}
│ Mode : Public
│ Version : 1.0.0
│
├━━━〔 MAIN 〕━━━
│ ${prefix}ping
│ ${prefix}alive
│ ${prefix}owner
│ ${prefix}menu
│ ${prefix}allmenu
│ ${prefix}runtime
│ ${prefix}speed
│
├━━━〔 QUICK 〕━━━
│ ${prefix}ownermenu
│ ${prefix}groupmenu
│ ${prefix}downloadmenu
│ ${prefix}funmenu
│ ${prefix}gamemenu
│ ${prefix}economymenu
│ ${prefix}aimenu
│ ${prefix}animemenu
│ ${prefix}adultmenu
│ ${prefix}antimenu
│
╰━━━━━━━━━━━━━━━━━╯
Type ${prefix}allmenu for full list
`;

const allmenu = `
╭━━━〔 FACELESS BOT - ALL MENU 〕━━━╮
│
├━━━〔 1. MAIN 〕━━━
│ ${prefix}ping ${prefix}alive ${prefix}owner
│ ${prefix}menu ${prefix}allmenu ${prefix}runtime
│ ${prefix}speed ${prefix}uptime ${prefix}script
│
├━━━〔 2. OWNER 〕━━━
│ ${prefix}mode ${prefix}eval ${prefix}exec
│ ${prefix}broadcast ${prefix}shutdown ${prefix}restart
│ ${prefix}setpfp ${prefix}setbio ${prefix}block ${prefix}unblock
│ ${prefix}join ${prefix}leave ${prefix}clearsession
│
├━━━〔 3. GROUP 〕━━━
│ ${prefix}tagall ${prefix}hidetag ${prefix}kick
│ ${prefix}add ${prefix}promote ${prefix}demote
│ ${prefix}group open ${prefix}group close
│ ${prefix}link ${prefix}revoke ${prefix}setname
│ ${prefix}setdesc ${prefix}setppgc ${prefix}welcome on/off
│
├━━━〔 4. ANTI 〕━━━
│ ${prefix}antilink on/off ${prefix}antidelete on/off
│ ${prefix}antiviewonce on/off ${prefix}antistatus on/off
│ ${prefix}antibot on/off ${prefix}antiforeign on/off
│ ${prefix}antisticker on/off ${prefix}antivideo on/off
│
├━━━〔 5. DOWNLOADER 〕━━━
│ ${prefix}play ${prefix}song ${prefix}video
│ ${prefix}ytmp3 ${prefix}ytmp4 ${prefix}tiktok
│ ${prefix}ig ${prefix}fb ${prefix}twitter
│ ${prefix}apk ${prefix}image ${prefix}pinterest
│
├━━━〔 6. FUN 〕━━━
│ ${prefix}joke ${prefix}quote ${prefix}fact
│ ${prefix}roast ${prefix}compliment ${prefix}truth
│ ${prefix}dare ${prefix}ship ${prefix}gayrate
│ ${prefix}beautiful ${prefix}ugly ${prefix}smart
│
├━━━〔 7. GAMES 〕━━━
│ ${prefix}quiz ${prefix}riddle ${prefix}math
│ ${prefix}guess ${prefix}slot ${prefix}dice
│ ${prefix}coinflip ${prefix}rps ${prefix}tictactoe
│
├━━━〔 8. ECONOMY 〕━━━
│ ${prefix}balance ${prefix}daily ${prefix}work
│ ${prefix}rob ${prefix}transfer ${prefix}leaderboard
│ ${prefix}shop ${prefix}buy ${prefix}deposit ${prefix}withdraw
│
├━━━〔 9. AI 〕━━━
│ ${prefix}ai ${prefix}gpt ${prefix}gemini
│ ${prefix}imagine ${prefix}ask ${prefix}chat
│
├━━━〔 10. ANIME 〕━━━
│ ${prefix}anime ${prefix}waifu ${prefix}neko
│ ${prefix}husbando ${prefix}cosplay ${prefix}manga
│
├━━━〔 11. ADULT 18+ 〕━━━
│ ${prefix}hentai ${prefix}blowjob ${prefix}ass
│ ${prefix}boobs ${prefix}porn ${prefix}sex
│
├━━━〔 12. MEDIA / TOOLS 〕━━━
│ ${prefix}sticker ${prefix}toimg ${prefix}tomp3
│ ${prefix}toaudio ${prefix}removebg ${prefix}remini
│ ${prefix}ss ${prefix}qr ${prefix}shorturl
│
├━━━〔 13. SEARCH 〕━━━
│ ${prefix}google ${prefix}image ${prefix}lyrics
│ ${prefix}wiki ${prefix}weather ${prefix}news
│
╰━━━━━━━━━━━━━━━━━╯
FACELESS BOT - Type ${prefix}menu to go back
`;

const ownerMenu = `
╭━━━〔 OWNER MENU 〕━━━╮
│ .mode public / private
│ .eval <code>
│ .exec <cmd>
│ .broadcast <text>
│ .shutdown
│ .restart
│ .setpfp <reply img>
│ .setbio <text>
│ .block / .unblock
│ .join <link>
│ .leave
│ .clearsession
╰━━━━━━━━━━╯
`;

const groupMenu = `
╭━━━〔 GROUP MENU 〕━━━╮
│ .tagall
│ .hidetag <text>
│ .kick @user
│ .add 234xxx
│ .promote / .demote
│ .group open / close
│ .link / .revoke
│ .setname / .setdesc
│ .setppgc
│ .welcome on / off
╰━━━━━━━━━━╯
`;

const antiMenu = `
╭━━━〔 ANTI MENU 〕━━━╮
│ .antilink on / off
│ .antidelete on / off
│ .antiviewonce on / off
│ .antistatus on / off
│ .antibot on / off
│ .antiforeign on / off
│ .antisticker on / off
│ .antivideo on / off
╰━━━━━━━━━━╯
`;

const downloaderMenu = `
╭━━━〔 DOWNLOADER MENU 〕━━━╮
│ .play <song>
│ .song <name>
│ .video <name>
│ .ytmp3 / .ytmp4 <link>
│ .tiktok <link>
│ .ig <link>
│ .fb <link>
│ .twitter <link>
│ .apk <name>
│ .image <name>
╰━━━━━━━━━━╯
`;

const funMenu = `
╭━━━〔 FUN MENU 〕━━━╮
│ .joke .quote .fact
│ .roast .compliment
│ .truth .dare
│ .ship @user
│ .gayrate .beautiful
│ .ugly .smart
╰━━━━━━━━━━╯
`;

const gameMenu = `
╭━━━〔 GAMES MENU 〕━━━╮
│ .quiz .riddle .math
│ .guess .slot .dice
│ .coinflip .rps
╰━━━━━━━━━━╯
`;

const economyMenu = `
╭━━━〔 ECONOMY MENU 〕━━━╮
│ .balance .daily .work
│ .rob @user
│ .transfer @user <amount>
│ .leaderboard
│ .shop .buy
│ .deposit .withdraw
╰━━━━━━━━━━╯
`;

const aiMenu = `
╭━━━〔 AI MENU 〕━━━╮
│ .ai <ask>
│ .gpt <ask>
│ .gemini <ask>
│ .imagine <prompt>
│ .ask <question>
╰━━━━━━━━━━╯
`;

const animeMenu = `
╭━━━〔 ANIME MENU 〕━━━╮
│ .anime .waifu .neko
│ .husbando .cosplay
│ .manga <name>
╰━━━━━━━━━━╯
`;

const adultMenu = `
╭━━━〔 ADULT 18+ MENU 〕━━━╮
│ .hentai .blowjob
│ .ass .boobs
│ .porn .sex
│ Only 18+ - Use in private
╰━━━━━━━━━━╯
`;

const mediaMenu = `
╭━━━〔 MEDIA / TOOLS MENU 〕━━━╮
│ .sticker .toimg .tomp3
│ .toaudio .removebg
│ .remini .ss <link>
│ .qr <text> .shorturl <link>
╰━━━━━━━━━━╯
`;

const searchMenu = `
╭━━━〔 SEARCH MENU 〕━━━╮
│ .google <query>
│ .image <query>
│ .lyrics <song>
│ .wiki <query>
│ .weather <city>
│ .news
╰━━━━━━━━━━╯
`;

module.exports = {
  menu,
  allmenu,
  ownerMenu,
  groupMenu,
  antiMenu,
  downloaderMenu,
  funMenu,
  gameMenu,
  economyMenu,
  aiMenu,
  animeMenu,
  adultMenu,
  mediaMenu,
  searchMenu
};
