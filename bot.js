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
  attachments: {
    type: "image",
    url: ""
  }
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

const imageURLs = [
  "https://i.groupme.com/1080x1079.jpeg.e08faeb0a4bb4068b458a3f63994a842.large",
  "https://i.groupme.com/750x650.png.8874165939864b6b9d26ad5e918dcd0d.large",
  "https://i.groupme.com/375x666.jpeg.6bef1d29066e4ace89ad056a551eceb5.large",
  "https://i.groupme.com/720x1280.jpeg.017a0936855f4703b73bb28cc2d974a3.large",
  "https://i.groupme.com/433x577.jpeg.6347f72c4ce0467998beb54f9460bd77.large",
  "https://i.groupme.com/3024x4032.jpeg.c6f14d8fa5b44c30b0bbb031b3634751.large",
];

const activationPhrase = "Activate that sucka!";

function respond() {
  var request = JSON.parse(this.req.chunks[0]);

  if (request.text && request.text === activationPhrase) {
    this.res.writeHead(200);
    postMessage();
    this.res.end();
  }
}

function getRandomIndex(arr) {
  return Math.floor(Math.random() * arr.length);
}

function postMessage() {
  var botResponse = quotes[getRandomIndex(quotes)];
  var imageURL = imageURLs[getRandomIndex(imageURLs)];

  body.text = botResponse;
  body.attachments.url = imageURL;

  console.log('sending ' + botResponse + ' to ' + botID);

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
