import { quotes } from './quotes';
import { imageURLs } from './imageURLs';

var HTTPS = require('https');

const botID = process.env.BOT_ID;

const options = {
	hostname: 'api.groupme.com',
	path: '/v3/bots/post',
	method: 'POST'
};

var body = {
	bot_id: botID,
	text: "",
	attachments: [
		{
			type: "image",
			url: ""
		}
	]
};

function respond() {
	var request = JSON.parse(this.req.chunks[0]);
	console.log(request);

	if ((request.text && Math.random() > 0.9) || (request.text == "HeIIo")) {
		this.res.writeHead(200);
		postMessage();
		this.res.end();
	}
}

function getRandomIndex(arr) {
	return Math.floor(Math.random() * arr.length);
}

function postMessage() {
	var randomValue = Math.random();

	if (randomValue <= 0.5) {
		body.text = quotes[getRandomIndex(quotes)];
	}
	else {
		body.attachments[0].url = imageURLs[getRandomIndex(imageURLs)];
	}

	console.log(body);
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
