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
];

const activationPhrase = "Activate that sucka!";

function respond() {
	var request = JSON.parse(this.req.chunks[0]);

	if (request.text) {
		if (request.text === activationPhrase) {
			this.res.writeHead(200);
			postMessage(quotes[getRandomIndex(quotes)]);
			this.res.end();
		}

		if (request.text.includes("er")) {
			var words = request.text.split();
			words.forEach(word => {
				if (word.includes("er")) {
					this.res.writeHead(200);
					postMessage(word[0].toUpperCase() + word.substring(1, word.length - 2) + " her?  I hardly know her!");
					this.res.end();
				}
			});
		}

		if (request.text.includes('"')) {
			var words = request.text.split();
			var quotifiedString = "";
			words.forEach(word => {
				if (Math.random() > 0.25) {
					quotifiedString += '"' + word + '" ';
				}
				else {
					quotifiedString += word;
				}
			});
			this.res.writeHead(200);
			postMessage(quotifiedString);
			this.res.end();
		}
	}
}

function getRandomIndex(arr) {
	return Math.floor(Math.random() * arr.length);
}

function postMessage(text) {
	body.text = text;

	console.log('sending ' + text + ' to ' + botID);

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
