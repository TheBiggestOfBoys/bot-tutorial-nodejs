var HTTPS = require('https');

var botID = process.env.BOT_ID;

var quotes = getLines("quotes.txt");
var imageLinks = getLines("image links.txt");

var activationString = "Activate Jake's Bot"

function respond() {
  var request = JSON.parse(this.req.chunks[0]);

  if (request.text &&  request.text === activationString) {
    this.res.writeHead(200);
    postMessage();
    this.res.end();
  }
}

function getLines(path) {
  fetch(path)
    .then((response) => response.text())
    .then((text) => {
      const lines = text.split('\n'); // Split by newline character
      console.log(lines);
    })
    .catch((error) => console.error(error));
}

function postMessage() {
  var botResponse, options, body, botReq;

  botResponse = quotes[Math.random(length(quotes))];

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  body = {
    bot_id : botID,
    text : botResponse,
    attachments :
    {
      type  : "image",
      url   : ""
    }
  };

  attachments.url = imageLinks[Math.random(length(imageLinks))];
  
  console.log('sending ' + botResponse + ' to ' + botID);
  console.log(body);

  botReq = _request(options, function(res) {
      if (res.statusCode != 202) {
        console.log('rejecting bad status code ' + res.statusCode);
      }
  });

  botReq.on('error', function(err) {
    console.log('error posting message '  + JSON.stringify(err));
  });
  botReq.on('timeout', function(err) {
    console.log('timeout posting message '  + JSON.stringify(err));
  });
  botReq.end(JSON.stringify(body));
}

exports.respond = respond;