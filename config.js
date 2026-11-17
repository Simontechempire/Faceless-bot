require('dotenv').config();

// ==========================================
// FACELESS BOT - CONFIG
// ==========================================
module.exports = {

  // --- BOT INFO ---
  botName: process.env.BOT_NAME || "FACELESS BOT",
  ownerName: process.env.OWNER_NAME || "FACELESS",
  ownerNumber: process.env.OWNER_NUMBER || "2349037483649",
  ownerJid: "2349037483649@s.whatsapp.net",
  prefix: process.env.PREFIX || ".",
  version: "1.0.0",

  // --- MODE ---
  // public = everyone can use, private = owner only
  mode: process.env.MODE || "public",

  // --- NEWSLETTER - Cube Tiny + Newsletter Reply ---
  newsletterJid: process.env.NEWSLETTER_JID || "120363419123456789@newsletter",
  newsletterName: process.env.NEWSLETTER_NAME || "FACELESS BOT",

  // --- BOT PFP - Catbox Link - Set Once Only ---
  // Put your real Catbox link here OR in .env as BOT_PFP=
  botPfp: process.env.BOT_PFP || "https://files.catbox.moe/xxxxxx.jpg",
  // Also read by menu.js as fallback keys
  pfp: process.env.BOT_PFP || "https://files.catbox.moe/xxxxxx.jpg",
  menuImage: process.env.BOT_PFP || "https://files.catbox.moe/xxxxxx.jpg",
  botBio: "FACELESS BOT - Prefix . | Owner +234 903 748 3649",

  // --- PAIRING WEBSITE ---
  port: process.env.PORT || 3000,
  PORT: process.env.PORT || 3000,
  sessionId: process.env.SESSION_ID || "faceless-session",
  sessionName: process.env.SESSION_ID || "faceless-session",

  // --- ANTI FEATURES - Default OFF, Owner Turns ON Per Group ---
  anti: {
    antilink: false,
    antidelete: false,
    antiviewonce: false,
    antistatus: false,
    antibot: false,
    antiforeign: false,
    antisticker: false,
    antivideo: false,
    antiimage: false,
    antiaudio: false,
    antiviewonceGroup: false
  },

  // --- GROUP SETTINGS ---
  group: {
    welcome: false,
    goodbye: false,
    welcomeText: "Welcome @user to @group",
    goodbyeText: "Goodbye @user",
    tagallLimit: 100
  },

  // --- ECONOMY SETTINGS ---
  economy: {
    startingBalance: 1000,
    dailyAmount: 500,
    workMin: 100,
    workMax: 500,
    robMin: 50,
    robMax: 300
  },

  // --- ADULT SETTINGS ---
  adult: {
    enabled: true,
    onlyPrivate: false,
    ageGate: true,
    warning: "18+ Only"
  },

  // --- API KEYS - Put In .env ---
  apis: {
    openai: process.env.OPENAI_KEY || "",
    gemini: process.env.GEMINI_KEY || "",
    removeBg: process.env.REMOVE_BG_KEY || ""
  },

  // --- LIMITS ---
  limits: {
    maxFileSize: 100 * 1024 * 1024, // 100MB
    downloadTimeout: 60000,
    stickerTimeout: 30000
  },

  // --- MESSAGES - All Go Through Font + ⏳ + 💀 ---
  messages: {
    await: "Please wait...",
    done: "Done",
    ownerOnly: "This command is for owner only",
    adminOnly: "This command is for admins only",
    groupOnly: "This command works in group only",
    privateOnly: "This command works in private only",
    notFound: "Not found",
    error: "An error occurred, try again",
    adultWarn: "This command is 18+ only"
  },

  // --- DATABASE FILES ---
  db: {
    users: "./database/users.json",
    groups: "./database/groups.json",
    economy: "./database/economy.json",
    anti: "./database/anti.json"
  },

  // --- OWNER NUMBERS - Extra Owners ---
  extraOwners: [
    "2349037483649"
  ],

  // --- PREFIXES - Allow Multiple ---
  prefixes: [".", "!", "#", "/"],
  prefixList: [".", "!", "#", "/"],

  // --- TIMEZONE ---
  timezone: "Africa/Lagos",

  // --- AUTO FEATURES ---
  auto: {
    autoread: true,
    autotype: false,
    autoreact: false,
    autoviewStatus: false,
    autostatus: false,
    autorecord: false,
    autotyping: false,
    autobio: false,
    autolikestatus: false,
    autodownload: false,
    alwaysonline: false,
    autoreply: false,
    autosticker: false,
    autotranslate: false,
    autoblock: false,
    autovoice: false,
    autowelcome: false,
    autogoodbye: false,
    autosave: false
  }
};
