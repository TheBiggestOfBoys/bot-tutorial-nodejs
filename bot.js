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
];

function respond() {
	var request = JSON.parse(this.req.chunks[0]);

	if (request.text && Math.random() > 0.95) {
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
