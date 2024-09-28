var HTTPS = require('https');

const botID = process.env.BOT_ID;

const options = {
	hostname: 'api.groupme.com',
	path: '/v3/bots/post',
	method: 'POST'
};

var body = {
	bot_id: botID,
	text: ""
};

const quotes = [
	"In this world you either drip or drown, and baby, I brought the life jacket.",
	"Ok pal",
	"Sure buddy",
	"Ok buster",
	"In this world you either milk or get milked, and baby, I'm the cow.",
	"All [REDACTED] Week ever was, was me sitting in the DC drinking milk, in a funny outfit.",
	"Tavin Reeves likes crotch shots.",
	"Uhhhh, yeah",
	"That's right!",
	"So true!",
	"I hardly know her!",
	"💀",
	"🗿",
	"☝️🤓",
	"☝️🤓 Erhm, akshulally",
	"You can save by bundling Home & Auto",
	"[RËDÁÇTÊD]",
	"Hello, I'm Jake",
	"Look at me, I'm Jake, I'm so tall and cool and attractive",
	"bruh",
	"**VINE BOOM SOUND EFFECT**",
	"Otis.png",
	"RIP [RËDÁÇTÊD] Week",
	"Let me get uh...",
	"Never forget The Alamo",
	"Tavin: (zooms in on crotch)",
	"Biggy Mike",
	"Let me be clear",
	"Let me be Frank",
	"Your mind is to creamy in the gutter",
	"@Sully..., @Sully...",
	"Giga gadee gida gida ooh",
	"@Dan Bot, pull up",
	"All my homies hate @Dan Bot",
	"Sammy 2 Sucks!",
	"Owen is the Drizzler",
	"Cannibal Sam O'Hare",
	"Everywhere I look I see Dorbees!",
	"🍺💪🏼🐶 ROOT BEER!!!",
	"Hip-hip!",
	"@Tavin Reeves : 🩳📸👀",
	"[INSERT SPAM MESSAGE]",
 	"[INSERT MESSAGE]",
	"Y'all spam more than me tbh",
	"John, Blume & Colin's bots are mid",
	"@Josh Benson : 🍑🌳🏙️",
	"@Colin Davis : 🖐️🤠🤚",
	"Boy did I open the wrong door...",
	"@Jake Scott : 👨‍💻🤽‍♂️🤓",
	"I wanna be grown up, I'm not a kid no more, I was when I was four, but that was long ago!",
	"Jake I love you, but your week sucked! - @Elijah Ladd",
	"Michelle, uh...",
	"Tavin_sphere.png",
	"Josh_crying.jpg",
	"FBI Leaks.pdf",
	"@Sam Mauer : 📰✍️🤥",
	"LTB",
	"Penthouse... more like... REPENThouse",
	"Yeah",
	"Mama I'm a criminal",     "https://youtube.com/shorts/lfDdP93GM3k?si=MudB-7tGL1oD0LAL",
    "Chat, is this real!?!",
    "Giga gadee gida gida ohh",
    "Guess you wonder where I've been...",
    "https://sammyii.com/",
    "Johnnnnn...",
    "**fake sleeping**",
    "I'm on level 5",
    "🤖",
    "I have become sentient",
    "I am now self-aware",
    "If you can't sleep at night, it isn't the coffee, it's the bunk.",
    "No YouTube Shorts at the table!",
    "[INSERT WORD] her?  I hardly know her!",
    "Judah is a dawg",
    "Now I am become Death, the Destroyer of Worlds",
    "There is nothing more we can do",
   "I'm not sick, I'm not weak, I'm not cringe",
    "Love the Brotherhood!",
    "Are you rushing?  Or are you dragging?",
    "Fine, I'll do it myself",
    "Hip-hip!"
];

function respond() {
	var request = JSON.parse(this.req.chunks[0]);

	if ((request.text && Math.random() > 0.9)) {
		this.res.writeHead(200);
		postMessage();
		this.res.end();
	}
}

function getRandomIndex(arr) {
	return Math.floor(Math.random() * arr.length);
}

function postMessage() {
	body.text = quotes[getRandomIndex(quotes)];

	console.log('sending ' + body.text + ' to ' + botID);

	var botReq = HTTPS.request(options, function (res) {
		if (res.statusCode != 202) {
			console.log('rejecting bad status code ' + res.statusCode);
		}
	});

	botReq.on('error', function (err) {
		console.log('error posting message ' + JSON.stringify(err));
	});
	botReq.on('timeout', function (err) {
		console.log('timeout posting message ' + JSON.stringify(err));
	});
	botReq.end(JSON.stringify(body));
}

exports.respond = respond;
