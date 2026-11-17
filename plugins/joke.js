// 😂 FACELESS - FUN PLUGIN - LONG VERSION - REAL HANDLER
// 100+ jokes, 80+ truths, 80+ dares, 60+ roasts, 50+ compliments, 50+ pickups
// APIs: JokeAPI + Meme API + UselessFacts + Advice + Kanye + Chuck Norris

async function fetchJson(url){
  try{ const r = await fetch(url, {headers:{'User-Agent':'Mozilla/5.0'}}); if(!r.ok) return null; return await r.json(); }catch{ return null; }
}
function pick(a){ return a[Math.floor(Math.random()*a.length)]; }
function getTarget(m, sender){
  return m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || m.message?.extendedTextMessage?.contextInfo?.participant || sender;
}
function getMentions(m){
  return m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
}
function hashPercent(s){
  let h=0; for(let i=0;i<s.length;i++) h=(h*31 + s.charCodeAt(i))%1000;
  return h;
}

// ============ JOKES - 100 ============
const JOKES = [
  "Why did NEPA take light? Because they saw you charging your phone 😂",
  "My village people are not following me, they are leading me 😭",
  "I told my crush I love her, she said 'seen' 😂",
  "Why did the chicken cross the road? To escape Lagos traffic 🐔",
  "My phone battery lasts longer than my relationship 😭",
  "I am not broke, I am just on financial break 💸",
  "Why did Warri boy go to school? To learn how to count money 😂",
  "My mum said 'go and meet your mates' - I went to bed 😴",
  "Naija jollof vs Ghana jollof? No debate, Naija wins 🇳🇬",
  "I tried to be serious for 5 minutes, my face refused 😂",
  "My data finished while I was downloading data saver 😭",
  "I asked God for money, He gave me data to hustle 😂",
  "Why is my pocket always empty? Because my hand is always inside it searching 😭",
  "My girlfriend said I am too broke, I said 'at least I am honest' 😂",
  "If money no dey, love no dey - Nigerian proverb 💸",
  "I went to church to pray for money, pastor asked for offering 😭",
  "My landlord said 'pay rent or leave' - I left my problems there 😂",
  "Why did the student bring ladder to school? To go to high school 😂",
  "My exam result was like NEPA light - it came and went 😭",
  "Teacher: Why are you late? Me: My bed refused to let me go 🛏️",
  "My mum beats me, then asks 'why are you crying?' 😭",
  "African parents: 'I will beat you and you will thank me' 😂",
  "My phone fell inside water, now it swims better than me 🏊",
  "I told my phone 'I love you', it said 'low battery' 😭",
  "Why did the boy bring rope to school? To skip class 😂",
  "My crush posted 'I need money', I posted 'I need you' - we both got ignored 😂",
  "Lagos traffic is so bad, I grew old inside keke 😭",
  "I bought fuel 1000 naira, my bike said 'thank you' and stopped 😂",
  "My village people sent me 'how far' - I knew wahala don come 😭",
  "If you see me smiling alone, I am remembering my village people wahala 😂",
  "My girlfriend asked for iPhone 16, I gave her iPhone 6 and 10 prayers 😂",
  "Why did the man run from police? Because police run faster when they see money 😂",
  "My data is like my ex - it finishes quickly 😭",
  "I am not lazy, I am on energy saving mode 🔋",
  "My stomach said 'I am hungry', my pocket said 'me too' 😭",
  "Why did the goat go to school? To become GOAT 🐐",
  "My best friend is like MTN - always there but no network 😂",
  "I asked Siri for money, Siri said 'I am not your village people' 😂",
  "My shadow left me because I have no light - NEPA wahala 😭",
  "Why did the fish go to school? To learn how to swim in exam 😂",
  "My mum: 'If I hear pim, you go hear wim' 😭",
  "I tried to save money, money saved itself from me 😂",
  "My phone is smarter than me, it knows when I am broke and shows ads 😭",
  "Why did the boy eat his homework? Teacher said it was a piece of cake 😂",
  "My love life is like NEPA - on and off 😭",
  "I went to buy suya, suya bought me 😂",
  "My ancestors are watching me fail and laughing 😭",
  "Why did the man carry umbrella inside house? Rain of blessings 😂",
  "My crush is like fuel - scarce and expensive ⛽",
  "I am so broke, my bank sends me 'sorry' instead of alert 😭",
  "Why did the chicken join WhatsApp group? To see who is gossiping 🐔",
  "My dad said 'when I was your age' - I said 'when you were my age, fuel was 20 naira' 😂",
  "My mum cooks jollof, my sister cooks rice with red colour 😭",
  "Why did the student fail? Because teacher set exam like JAMB 😂",
  "My phone charger is like my ex - always leaving me 😭",
  "I told my boss I am sick, he saw my status at beach 🏖️",
  "Why did the man go to bank with ladder? To check his high balance 😂",
  "My village people have WiFi, they follow me everywhere 📶",
  "I am not short, I am just concentrated awesome 😂",
  "Why did the boy put his phone in fridge? To cool down hot gist 😂",
  "My girlfriend left me for a yahoo boy, now I am learning coding 😭",
  "If I had money, I would buy NEPA and switch on light for Nigeria 😂",
  "My exam was so hard, even my pen stopped writing 😭",
  "Why did the man buy 2 phones? One for calls, one for excuses 😂",
  "My mum: 'Go and sleep' - Me at 2am watching TikTok 😂",
  "I am so hungry, I can eat my words 😭",
  "Why did the cat sit on computer? To keep an eye on mouse 🐱",
  "My crush said 'you are like a brother to me' - I became pastor 😭",
  "Lagos danfo conductor: 'Enter with your change' - I entered with my problems 😂",
  "Why did the boy run from school? School ran from him 😂",
  "My data finished, I started talking to my family - they are nice people 😂",
  "I asked God for a sign, He gave me network issue 😭",
  "Why did the man carry bucket to party? To carry jollof home 😂",
  "My phone said 'storage full', I deleted my ex pictures - now 10GB free 😂",
  "I am not ugly, I am just on low resolution 😂",
  "Why did the goat become president? Because he is GOAT 🐐",
  "My landlord increased rent, I increased prayers 🙏",
  "Why did the boy bring spoon to exam? To eat questions 😂",
  "My crush blocked me, I created new account - dedication 😭",
  "If you think I am funny, wait till you see my account balance - funnier 😂",
  "Why did the man sleep at bank? To save his dreams 💤",
  "My mum beats me with slippers, slippers get tired before me 😂",
  "I tried to diet, diet tried to kill me 😭",
  "Why did the chicken cross the road twice? To prove it was not chicken 😂",
  "My phone battery is 1%, my life is 100% wahala 😭",
  "I went to village, village people said 'welcome home, we have been waiting' - I ran back 😂",
  "Why did the student bring fan to exam? To blow away difficult questions 😂",
  "My girlfriend said 'we need to talk', I said 'we need to pray' 🙏",
  "I am so broke, I use free mode to view my own status 😭",
  "Why did the man wear 2 watches? One for Nigerian time, one for real time 😂",
  "My crush is like MTN data - I can see her but cannot reach her 😭",
  "I told my mum I want iPhone, she gave me 'iPhon' - remove e 😂",
  "Why did the boy fail maths? He thought X was his ex 😂",
  "My life is like Nollywood movie - plenty drama, no money 😭",
  "I asked for WiFi password, they said 'it is in the Bible' - I opened Bible 😂",
  "Why did the man go to church with umbrella? Blessing rain 😂",
  "My phone fell, screen cracked, my heart cracked more 😭",
  "I am not late, everybody else is early 😂",
  "Why did the student eat exam paper? Teacher said 'chew on it' 😂",
  "My village people are so powerful, they follow me to abroad 😭",
  "If life gives you lemon, sell it and buy data 🍋",
  "Why did the boy bring pillow to school? To dream of passing 😂",
];

const FACTS = [
  "Nigeria has over 500 languages! 🇳🇬","Lagos is the largest city in Africa by population",
  "Nollywood is the 2nd largest film industry in the world","The River Niger is 4,180 km long",
  "Nigeria has the largest economy in Africa","Honey never expires - 3000 year old honey is still edible 🍯",
  "Bananas are berries, but strawberries are not! 🍌","Your brain uses 20% of your body's energy",
  "Octopus has 3 hearts 🐙","A group of flamingos is called a flamboyance 🦩",
  "Sharks existed before trees 🦈","The Eiffel Tower grows 15cm taller in summer",
  "Wombat poop is cube-shaped","There are more stars in the universe than grains of sand on Earth",
  "Your nose can remember 50,000 different scents","Cows have best friends and get stressed when separated 🐄",
  "The first computer bug was a real moth 🦋","Hot water freezes faster than cold water sometimes",
  "A snail can sleep for up to 3 years 🐌","The moon is moving away from Earth 3.8cm per year",
  "Nigeria is home to the largest diversity of butterflies in Africa 🦋",
  "Pineapples take 2 years to grow one fruit 🍍","You can't hum while holding your nose",
  "The human body has 206 bones","Dolphins have names for each other 🐬",
  "Coffee is a fruit - coffee beans are pits of berries ☕","The Great Wall of China is held together by sticky rice",
  "A jiffy is a real unit of time - 1/100th of a second","Elephants are the only animals that can't jump 🐘",
];

const TRUTHS = [
  "What is your biggest secret?","Who is your crush right now?","What is the most embarrassing thing you have done?",
  "Have you ever lied to your parents?","What is your biggest fear?","Who do you stalk on WhatsApp?",
  "What is your worst habit?","Have you ever cheated in an exam?","Have you ever cried because of a movie?",
  "Who was your first crush?","Have you ever pretended to be sick to skip school?","What is the biggest lie you told?",
  "Have you ever stolen money from your parents?","Who do you secretly hate in this group?",
  "Have you ever peed in a pool?","What is your most embarrassing nickname?",
  "Have you ever snooped in someone's phone?","What is the worst thing you have done to a friend?",
  "Have you ever had a dream about someone here?","What is your guilty pleasure?",
  "Have you ever liked someone who didn't like you back?","What is the most childish thing you still do?",
  "Have you ever sent a message to the wrong person?","What is your biggest insecurity?",
  "Have you ever broken someone's heart?","Who is the most annoying person you know?",
  "Have you ever eaten food that fell on the floor?","What is your weirdest habit?",
  "Have you ever faked a smile for a photo?","What is the last lie you told?",
  "Have you ever been caught lying?","Who would you marry in this group if you had to?",
  "Have you ever ghosted someone?","What is your biggest regret?",
  "Have you ever been in love?","What is the dumbest thing you believed as a child?",
  "Have you ever pretended to know a song but didn't?","What is your most used emoji?",
  "Have you ever laughed at a funeral?","Who is your celebrity crush?",
  "Have you ever cheated in a game?","What is the most expensive thing you broke?",
  "Have you ever been rejected?","What is your secret talent?",
  "Have you ever talked to yourself?","What is your biggest turn-off?",
  "Have you ever stalked your ex?","What is your most embarrassing WhatsApp status?",
  "Have you ever fallen asleep in class?","Who do you text most?",
  "Have you ever lied about your age?","What is your worst date story?",
  "Have you ever been caught cheating?","What is something you are ashamed of?",
  "Have you ever had a crush on a teacher?","What is your biggest flex?",
  "Have you ever cried in public?","Who is the funniest person in this group?",
  "Have you ever kept a secret from your best friend?","What is your dream job?",
  "Have you ever been jealous of a friend?","What is your most embarrassing moment in school?",
  "Have you ever pretended to be busy to avoid someone?","What is your favourite lie to tell?",
  "Have you ever eaten someone else's food?","Who would you kiss in this group?",
  "Have you ever been caught gossiping?","What is your weirdest dream?",
  "Have you ever used someone's toothbrush?","What is your biggest pet peeve?",
  "Have you ever been in a fight?","What is the last thing you searched on Google?",
  "Have you ever faked being sick for work?","What is your most embarrassing photo?",
  "Have you ever liked your own post?","Who do you miss the most?",
  "Have you ever been caught singing in shower?","What is your secret obsession?",
  "Have you ever been friend-zoned?","What is your worst habit when angry?",
  "Have you ever stolen food from fridge?","What is your biggest fear about future?",
];

const DARES = [
  "Send 'I love you' to the 3rd person in your contact list","Change your DP to a funny face for 1 hour","Dance and send video in group",
  "Call your crush and say hi","Text your ex 'I miss you' (just kidding, don't 😂)","Sing your favourite song and send voice note",
  "Do 10 pushups and send video","Speak in funny accent for next 5 messages","Send a voice note singing your national anthem",
  "Change your name to 'I Love Jollof' for 1 hour","Send 'I am pregnant' to your best friend and screenshot reaction (joke!)",
  "Post 'I am getting married' as your status for 10 mins","Call your mum and say 'I love you'",
  "Do 20 squats and send video","Speak only in emojis for next 3 messages","Send your last photo in gallery to group",
  "Imitate your favourite celebrity","Say 'I am a chicken' 5 times in voice note","Dance to any song for 30 seconds and send video",
  "Text your crush 'Hey, I had a dream about you'","Change your DP to your childhood photo","Send a voice note saying 'I am the best' in funny voice",
  "Do your best cat impression in voice note","Send 'Good morning' to 5 people you haven't talked to","Tell a joke in group and if no one laughs, do 10 pushups",
  "Post a selfie with funny filter","Say 'I love Warri' in group chat","Call someone and sing Happy Birthday even if it's not their birthday",
  "Send your most embarrassing photo to group","Do 15 jumping jacks and send video","Speak like a pastor for next 3 messages",
  "Send 'I need 5000 naira' to your dad","Imitate your teacher","Send voice note crying like a baby",
  "Change your status to 'Single and searching'","Dance like Davido for 20 seconds","Send 'You are beautiful' to someone in group",
  "Do your best Nollywood cry in voice note","Send a photo of your feet (just kidding, don't 😂)","Say 'I am the king/queen' in group",
  "Call your best friend and say 'I miss you'","Send your screen time screenshot","Tell us your most embarrassing story",
  "Send a voice note in a foreign accent","Post 'I just won lottery' as status","Do a TikTok dance and send it",
  "Send 'I love you' to your mum","Imitate Burna Boy singing","Send your last 3 emojis you used",
  "Say 'NEPA, take light' 3 times fast","Do 10 pushups while singing","Send a selfie without filter",
  "Call your sibling and say 'You are my best friend'","Tell group your crush name (or do 20 pushups)",
  "Send 'I am hungry, send food' to 3 people","Speak in Yoruba/Igbo/Hausa for next 2 messages even if you don't know",
  "Send a voice note saying 'I am a goat'","Change your name to 'Village People' for 1 hour",
  "Send your favourite meme","Do a funny face and send selfie","Say 'I will be rich this year' in voice note with confidence",
  "Send 'Good night' to your crush","Imitate your mum calling you","Do 5 pushups and shout 'I am strong'",
  "Send a voice note whispering 'I love jollof'","Post 'I am tired of being broke' as status",
  "Tell us a secret (or do dare)","Send your most used sticker","Dance to Amapiano for 15 seconds",
  "Call someone and say 'You are my bestie'","Send 'I need help' to your group admin",
  "Say 'I am handsome/beautiful' 5 times in mirror and send video","Send your last WhatsApp chat screenshot (hide names)",
  "Imitate a chicken","Send voice note saying 'Wahala be like bicycle'",
  "Do 20 seconds plank and send video","Send 'I miss you' to someone you haven't talked to",
  "Change DP to a cartoon character","Tell group your biggest fear","Send a voice note in a baby voice",
  "Post 'I am in love' as status for 5 mins","Do your best Wizkid dance","Send 'You are my favourite' to someone",
];

const ROASTS = [
  "Your face is like NEPA - it disappears when we need it most 😂","You are so broke, your ATM said 'insufficient funds' to itself 💸",
  "Your brain is like WiFi in my village - no network 😂","You are proof that evolution can go backwards",
  "Your hairstyle is like Lagos traffic - confusing 😂","You are so slow, snail is faster than you 🐌",
  "Your phone is smarter than you, and it's a Nokia 3310 😂","You are so ugly, your mirror said 'I can't do this' 😭",
  "Your jokes are like NEPA light - they never come 😂","You are so short, you need ladder to reach your dreams 😂",
  "Your breath is so bad, mosquito flies away 😂","You are like data - you finish quickly 😭",
  "Your face is like JAMB exam - hard to pass 😂","You are so lazy, your shadow does the work for you 😂",
  "Your brain is like empty pure water sachet 😂","You are so broke, you borrow money from your piggy bank and still owe it 😭",
  "Your style is like my grandma's wrapper - old 😂","You are so dull, even your shadow is brighter than you 😂",
  "Your voice is like generator - noisy and annoying 😂","You are so fat, when you sit, you sit in two places 😂",
  "Your hairline is running away like thief 😂","You are so ugly, when you were born, doctor said 'let's try again' 😭",
  "Your IQ is like fuel price - low and going down 😂","You are like Warri rain - you come when nobody invites you 😂",
  "Your face is like expired bread - nobody wants it 😂","You are so slow, your thoughts arrive tomorrow 😂",
  "Your clothes are like my village - old and dirty 😂","You are so broke, you check your account balance for entertainment 😭",
  "Your smile is like NEPA - it goes off quickly 😂","You are so stupid, you thought 'WiFi' was a new food 😂",
  "Your brain is on airplane mode 😂","You are like a broken keke - you make noise but go nowhere 😂",
  "Your face is like 2G network - slow to load 😂","You are so ugly, your selfie camera said 'no face detected' 😭",
  "Your jokes are like my landlord - nobody likes them 😂","You are so lazy, you hire someone to sleep for you 😂",
  "Your hair is like bush - animals live there 😂","You are so broke, you use your phone torch to see your problems 😭",
  "Your voice is like my mum shouting - scary 😂","You are so short, you can walk under a table without bending 😂",
  "Your brain is like a pot without soup - empty 😂","You are so dull, you need tutorial to breathe 😂",
  "Your face is like fuel scarcity - nobody wants to see it 😂","You are so ugly, your own shadow runs from you 😭",
  "Your style is like 1999 - expired 😂","You are so slow, you are still in 2020 😂",
  "Your phone is like your brain - low storage 😂","You are so broke, you ask your reflection for money 😭",
  "Your laugh is like generator - loud and annoying 😂","You are so fat, your belt needs belt 😂",
  "Your brain is like MTN network - always down 😂","You are so ugly, mirror broke when you looked 😭",
  "Your jokes are like my ex - nobody misses them 😂","You are so lazy, you sleep to rest from sleeping 😂",
  "Your hairline is like recession - going back 😂","You are so stupid, you put your phone in microwave to charge it 😂",
  "Your face is like expired milk - sour 😂","You are so broke, your bank charges you for checking balance 😭",
  "Your voice is like frog - croak croak 😂","You are so short, your legs are shorter than your problems 😂",
];

const COMPLIMENTS = [
  "You are amazing! Keep shining ✨","Your smile can light up Lagos! 😊","You are smarter than you think 💡",
  "You have a heart of gold ❤️","You are the best! Don't let anyone tell you otherwise 🔥",
  "You are beautiful inside and out 😍","Your energy is contagious! Keep it up 💪",
  "You are a blessing to everyone around you 🙏","Your laugh is the best sound in the world 😂",
  "You are stronger than you know 💪","You make the world a better place 🌍",
  "Your kindness is rare, don't change ❤️","You are a star! Shine bright ⭐",
  "  "You have the best taste in everything 😎",
  "You are incredibly talented! 🎨",
  "Your presence makes any room better ✨",
  "You are a queen/king! 👑",
  "You are so creative! I love your ideas 💡",
  "Your smile is my favourite view 😊",
  "You are a good person, never forget that ❤️",
  "You are funny, smart and beautiful - triple threat 😍",
  "You are the reason someone smiles today 😊",
  "Your determination is inspiring 💪",
  "You are a breath of fresh air 🌬️",
  "You are loved more than you know ❤️",
  "You are a gem! Rare and precious 💎",
  "Your voice is so soothing 🎶",
  "You are a masterpiece 🎨",
  "You are the best friend anyone could ask for 🤝",
  "You are a ray of sunshine ☀️",
  "Your confidence is beautiful 😍",
  "You are a warrior! Keep fighting 💪",
  "You are pure gold ✨",
  "You are a legend in the making 🔥",
  "Your heart is so pure ❤️",
  "You are a joy to be around 😊",
  "You are incredibly kind 💖",
  "You are a star that never dims ⭐",
  "Your intelligence is sexy 🧠",
  "You are a blessing 🙏",
  "You are the MVP! 🏆",
  "You are a dream come true 💭",
  "Your smile is contagious 😊",
  "You are a wonderful human being ❤️",
  "Your energy is electric ⚡",
  "You are a boss! 👑",
  "You are a beautiful soul ✨",
  "You are a champion! 🏆",
  "Your laugh makes my day 😂",
  "You are a true friend 🤝",
  "You are amazing just the way you are ✨",
];

const PICKUPS = [
  "Are you NEPA? Because you light up my world 💡",
  "Are you jollof rice? Because I want you every day 🍚",
  "Do you have a map? I keep getting lost in your eyes 😍",
  "Are you WiFi? Because I'm feeling the connection 📶",
  "You must be from Warri, because you stole my heart ❤️",
  "Are you fuel? Because my heart is burning for you ⛽",
  "Are you MTN? Because you are always in my heart 📱",
  "Do you have a charger? Because you energize me 🔋",
  "Are you a bank? Because you have my interest 💰",
  "Are you Lagos traffic? Because I can't get past you 🚗",
  "Are you suya? Because you are hot and spicy 🌶️",
  "Do you believe in love at first sight, or should I walk by again? 😍",
  "Are you a magician? Because whenever I look at you, everyone else disappears ✨",
  "Are you from heaven? Because you are an angel 😇",
  "Are you a camera? Because every time I look at you, I smile 📸",
  "Do you have a Band-Aid? Because I just scraped my knee falling for you 😍",
  "Are you a star? Because you light up my night ⭐",
  "Are you a thief? Because you stole my heart ❤️",
  "Are you a phone? Because I want to be with you 24/7 📱",
  "Are you a dream? Because I don't want to wake up 💭",
  "Are you a song? Because I can't get you out of my head 🎶",
  "Are you a gift? Because you are a blessing 🎁",
  "Are you a flower? Because you make my world beautiful 🌸",
  "Are you a book? Because I want to read you forever 📚",
  "Are you a pizza? Because I want a slice of you 🍕",
  "Are you a diamond? Because you are rare and precious 💎",
  "Are you a rainbow? Because you bring colour to my life 🌈",
  "Are you a coffee? Because you keep me awake at night ☕",
  "Are you a star? Because you shine brighter than everyone ⭐",
  "Are you a lion? Because you are the king/queen of my heart 🦁",
  "Are you a mountain? Because I want to climb to your heart ⛰️",
  "Are you a river? Because I want to flow with you 🌊",
  "Are you a fire? Because you ignite my heart 🔥",
  "Are you a moon? Because you light up my darkness 🌙",
  "Are you a sun? Because you warm my heart ☀️",
  "Are you a wind? Because you take my breath away 🌬️",
  "Are you a key? Because you unlock my heart 🔑",
  "Are you a lock? Because you keep my heart safe 🔒",
  "Are you a pillow? Because I want to sleep on you 😴",
  "Are you a blanket? Because you warm me up 🛏️",
  "Are you a chocolate? Because you are sweet 🍫",
  "Are you a candy? Because you are sweet and I want you 🍬",
  "Are you a honey? Because you are sweet like honey 🍯",
  "Are you a sugar? Because you sweeten my life 🍬",
  "Are you a spice? Because you add flavour to my life 🌶️",
  "Are you a salt? Because you make everything better 🧂",
  "Are you a light? Because you brighten my day 💡",
  "Are you a shadow? Because I want you to follow me everywhere 👤",
  "Are you a mirror? Because I see myself in you 🪞",
  "Are you a dream? Because you are too good to be true 💭",
];

const EIGHTBALL = ["Yes ✅","No ❌","Maybe 🤔","Definitely! 💯","Ask again later","My village people say no 😂","100% Yes!","Don't count on it","It is certain!","Very doubtful","Signs point to yes ✨","My reply is no","Without a doubt!","Outlook not so good","Yes in due time","Concentrate and ask again","Better not tell you now","Cannot predict now","Most likely!","Don't bet on it"];

const ADVICE = [
  "Never give up, your breakthrough is near 💪",
  "Save money, even if it's small - it adds up 💰",
  "Love yourself first, others will follow ❤️",
  "Don't compare your chapter 1 to someone's chapter 20 📖",
  "Work hard in silence, let success make noise 🔥",
  "Drink water, mind your business, pray 🙏",
  "Your village people cannot stop what God has blessed 🙏",
  "Stay focused, distractions are everywhere 🎯",
];

const WOULDYOU = [
  "Would you rather be rich or famous?",
  "Would you rather have 1 million naira or 1 million followers?",
  "Would you rather be able to fly or be invisible?",
  "Would you rather live in Lagos or Abuja?",
  "Would you rather marry for love or money?",
  "Would you rather be a celebrity or a billionaire?",
  "Would you rather have unlimited data or unlimited money?",
  "Would you rather be smart or beautiful?",
  "Would you rather eat jollof every day or never eat jollof again?",
  "Would you rather be able to talk to animals or speak all languages?",
  "Would you rather be famous on TikTok or Instagram?",
  "Would you rather have a private jet or a mansion?",
  "Would you rather be able to time travel or read minds?",
  "Would you rather live without phone or without food for 1 day?",
  "Would you rather be the funniest person or smartest person?",
  "Would you rather have 10 houses or 10 cars?",
  "Would you rather be a singer or actor?",
  "Would you rather marry your crush or your best friend?",
  "Would you rather have super strength or super speed?",
  "Would you rather be rich in village or poor in city?",
];

const NEVERHAVE = [
  "Never have I ever cheated in exam",
  "Never have I ever lied to my parents",
  "Never have I ever stalked my ex",
  "Never have I ever cried because of a movie",
  "Never have I ever sent a message to wrong person",
  "Never have I ever pretended to be sick",
  "Never have I ever eaten someone else's food",
  "Never have I ever been caught lying",
  "Never have I ever ghosted someone",
  "Never have I ever been in love",
  "Never have I ever broken someone's heart",
  "Never have I ever snooped in someone's phone",
  "Never have I ever fallen asleep in class",
  "Never have I ever been rejected",
  "Never have I ever talked to myself",
  "Never have I ever been friend-zoned",
  "Never have I ever stolen money",
  "Never have I ever peed in pool",
  "Never have I ever laughed at a funeral",
  "Never have I ever used someone's toothbrush",
];

const COMMANDS = ['joke','meme','truth','dare','roast','compliment','ship','love','lovecalc','pickup','8ball','fact','darkjoke','troll','emojify','insult','flirt','crush','gay','straight','simp','couple','soulmate','compatibility','randomjoke','advice','kanye','chuck','wouldyou','neverhave','wyr','nhie','horoscope','zodiac','vibe','aura','rizz','aura2','baddie','cute','ugly','smart','dumb','rich','poor','funny','boring','kind','mean','hot','cold','introvert','extrovert'];

module.exports = {
  name: 'fun',
  commands: COMMANDS,
  run: async (sock, m, jid, cmd, args, text, isOwner, isGroup, sender) => {
    if(!COMMANDS.includes(cmd)) return false;

    if(cmd==='joke' || cmd==='randomjoke'){
      const d = await fetchJson('https://v2.jokeapi.dev/joke/Any?safe-mode&type=single');
      const joke = d?.joke || pick(JOKES);
      await sock.sendMessage(jid, { text: `😂 *JOKE*\n\n${joke}\n\n_Send .joke for another_` }, { quoted: m });
      return true;
    }
    if(cmd==='darkjoke'){
      const d = await fetchJson('https://v2.jokeapi.dev/joke/Dark?safe-mode&type=single');
      await sock.sendMessage(jid, { text: `😈 *DARK JOKE*\n\n${d?.joke||pick(JOKES)}` }, { quoted: m });
      return true;
    }
    if(cmd==='meme'){
      try{
        const d = await fetchJson('https://meme-api.com/gimme');
        if(d?.url){ await sock.sendMessage(jid, { image: { url: d.url }, caption: `😂 *MEME*\n${d.title||''}\n\nSend .meme for another` }, { quoted: m }); return true; }
      }catch{}
      await sock.sendMessage(jid, { text: `😂 *MEME*\n\n${pick(JOKES)}` }, { quoted: m });
      return true;
    }
    if(cmd==='fact'){
      const d = await fetchJson('https://uselessfacts.jsph.pl/api/v2/facts/random');
      await sock.sendMessage(jid, { text: `🧠 *DID YOU KNOW?*\n\n${d?.text||pick(FACTS)}\n\n_Send .fact for another_` }, { quoted: m });
      return true;
    }
    if(cmd==='advice'){
      const d = await fetchJson('https://api.adviceslip.com/advice');
      await sock.sendMessage(jid, { text: `💡 *ADVICE*\n\n${d?.slip?.advice||pick(ADVICE)}` }, { quoted: m });
      return true;
    }
    if(cmd==='kanye'){
      const d = await fetchJson('https://api.kanye.rest/');
      await sock.sendMessage(jid, { text: `🎤 *KANYE SAYS*\n\n"${d?.quote||'I am the best'}"` }, { quoted: m });
      return true;
    }
    if(cmd==='chuck'){
      const d = await fetchJson('https://api.chucknorris.io/jokes/random');
      await sock.sendMessage(jid, { text: `💪 *CHUCK NORRIS*\n\n${d?.value||'Chuck Norris can divide by zero'}` }, { quoted: m });
      return true;
    }
    if(cmd==='truth'){ await sock.sendMessage(jid, { text: `🎯 *TRUTH*\n\n${pick(TRUTHS)}\n\n_Send .truth for another_` }, { quoted: m }); return true; }
    if(cmd==='dare'){ await sock.sendMessage(jid, { text: `😈 *DARE*\n\n${pick(DARES)}\n\n_Send .dare for another_` }, { quoted: m }); return true; }
    if(cmd==='wouldyou' || cmd==='wyr'){ await sock.sendMessage(jid, { text: `🤔 *WOULD YOU RATHER*\n\n${pick(WOULDYOU)}` }, { quoted: m }); return true; }
    if(cmd==='neverhave' || cmd==='nhie'){ await sock.sendMessage(jid, { text: `🙈 *NEVER HAVE I EVER*\n\n${pick(NEVERHAVE)}\n\n_If you have, send 😂_` }, { quoted: m }); return true; }
    if(cmd==='horoscope' || cmd==='zodiac'){
      const signs = ['Aries ♈','Taurus ♉','Gemini ♊','Cancer ♋','Leo ♌','Virgo ♍','Libra ♎','Scorpio ♏','Sagittarius ♐','Capricorn ♑','Aquarius ♒','Pisces ♓'];
      const sign = text || pick(signs);
      await sock.sendMessage(jid, { text: `🔮 *HOROSCOPE - ${sign}*\n\nToday is your lucky day! Money is coming 💰\nLove: ❤️❤️❤️❤️\nLuck: ⭐⭐⭐⭐⭐\n\n_Stay positive!_` }, { quoted: m });
      return true;
    }
    if(cmd==='roast' || cmd==='insult'){
      const target = getTarget(m, sender);
      if(target!==sender || m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) await sock.sendMessage(jid, { text: `🔥 *ROAST for @${target.split('@')[0]}*\n\n${pick(ROASTS)}`, mentions:[target] }, { quoted: m });
      else await sock.sendMessage(jid, { text: `🔥 *ROAST*\n\n${pick(ROASTS)}\n\n_Usage: .roast @user_` }, { quoted: m });
      return true;
    }
    if(cmd==='compliment'){
      const target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      if(target) await sock.sendMessage(jid, { text: `💖 *COMPLIMENT for @${target.split('@')[0]}*\n\n${pick(COMPLIMENTS)}`, mentions:[target] }, { quoted: m });
      else await sock.sendMessage(jid, { text: `💖 *COMPLIMENT*\n\n${pick(COMPLIMENTS)}` }, { quoted: m });
      return true;
    }
    if(['ship','love','lovecalc','couple','soulmate','compatibility'].includes(cmd)){
      const mentions = getMentions(m);
      let name1 = sender.split('@')[0];
      let name2 = mentions[0]?.split('@')[0] || (text ? text.split(' ')[0] : 'Crush');
      if(text && /[,|&+]/.test(text)){
        const parts = text.split(/[,|&+]/).map(s=>s.trim()).filter(Boolean);
        if(parts.length>=2){ name1 = parts[0]; name2 = parts[1]; }
      }
      const combined = (name1+name2).toLowerCase();
      let hash = 0; for(let i=0;i<combined.length;i++) hash = (hash*31 + combined.charCodeAt(i)) % 100;
      const percent = 30 + (hash % 70);
      const filled = Math.floor(percent/10);
      const bar = '❤️'.repeat(Math.floor(filled/2)) + '🤍'.repeat(5-Math.floor(filled/2));
      const msg = percent>85 ? 'Perfect match! Marry now! 💍💒' : percent>70 ? 'Strong match! Go for it 💕' : percent>55 ? 'Good match! Give it a try 💕' : percent>40 ? 'Maybe... try harder 😅' : 'Village people are against this one 😂';
      const shipName = (name1.slice(0,3)+name2.slice(-3)).toUpperCase();
      await sock.sendMessage(jid, { text: `💘 *LOVE CALCULATOR*\n\n${name1} ❤️ ${name2}\nShip Name: *${shipName}*\n\nCompatibility: *${percent}%*\n${bar} ${percent}%\n\n${msg}`, mentions: mentions.length?mentions:[] }, { quoted: m });
      return true;
    }
    if(cmd==='pickup' || cmd==='flirt'){
      await sock.sendMessage(jid, { text: `😍 *PICKUP LINE*\n\n${pick(PICKUPS)}\n\n_Send .pickup for another_` }, { quoted: m });
      return true;
    }
    if(cmd==='8ball'){
      if(!text){ await sock.sendMessage(jid, { text: 'Usage: .8ball Will I be rich?' }, { quoted: m }); return true; }
      await sock.sendMessage(jid, { text: `🎱 *8BALL*\n\nQ: ${text}\nA: ${pick(EIGHTBALL)}` }, { quoted: m });
      return true;
    }
    if(cmd==='troll'){
      await sock.sendMessage(jid, { text: `😂 *TROLL*\n\n${pick(['Your phone will hang in 3...2...1... just kidding 😂','NEPA is coming to take your light now ⚡','Your crush just viewed your status 👀','Village people are typing... 😂','Your data will finish in 5 mins 😂','Your ex is stalking you 👀'])}` }, { quoted: m });
      return true;
    }
    if(cmd==='emojify'){
      if(!text){ await sock.sendMessage(jid, { text: 'Usage: .emojify Hello' }, { quoted: m }); return true; }
      const map = { a:'🅰️', b:'🅱️', c:'©️', d:'🇩', e:'📧', f:'🎏', g:'🌀', h:'♓', i:'ℹ️', j:'🎷', k:'🎋', l:'🦁', m:'Ⓜ️', n:'🇳', o:'🅾️', p:'🅿️', q:'🇶', r:'®️', s:'💲', t:'✝️', u:'⛎', v:'✅', w:'〰️', x:'❎', y:'🇾', z:'💤', ' ':'   ' };
      const out = text.toLowerCase().split('').map(c=>map[c]||c).join(' ');
      await sock.sendMessage(jid, { text: out }, { quoted: m });
      return true;
    }
    if(['crush','gay','straight','simp','rizz','aura','aura2','baddie','cute','ugly','smart','dumb','rich','poor','funny','boring','kind','mean','hot','cold','introvert','extrovert','vibe'].includes(cmd)){
      const target = getTarget(m, sender);
      const percent = (hashPercent(target+cmd)%100)+1;
      const labels = {
        crush:'Crush Level', gay:'Gay Meter', straight:'Straight Meter', simp:'Simp Meter',
        rizz:'Rizz Level', aura:'Aura Level', aura2:'Aura Level', baddie:'Baddie Level',
        cute:'Cuteness', ugly:'Ugliness', smart:'Smartness', dumb:'Dumbness',
        rich:'Richness', poor:'Poorness', funny:'Funniness', boring:'Boring Level',
        kind:'Kindness', mean:'Meanness', hot:'Hotness', cold:'Coldness',
        introvert:'Introvert Level', extrovert:'Extrovert Level', vibe:'Vibe Check'
      };
      const emoji = percent>80 ? '🔥' : percent>60 ? '😍' : percent>40 ? '😐' : '😂';
      const bar = '█'.repeat(Math.floor(percent/10)) + '░'.repeat(10-Math.floor(percent/10));
      await sock.sendMessage(jid, { text: `${emoji} *${labels[cmd]||cmd.toUpperCase()}*\n\n@${target.split('@')[0]} is ${percent}% ${cmd} ${emoji}\n\n[${bar}] ${percent}%` , mentions:[target] }, { quoted: m });
      return true;
    }

    return false;
  }
};
