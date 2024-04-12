let botID = process.env.BOT_ID;

const quotes = [
  "In this world you either drip or drown, and baby, I brought the life jacket.",
  "Ok pal",
  "Sure buddy",
  "Ok buster",
  "In this world you either milk or get milked, and baby, I'm the cow.",
  "All [REDACTED] Week ever was, was me sitting in the DC drinking milk, in a funny outfit.",
  "Tavin Reeves likes crotch shots.",
];

const activationString = "Activate Jake's Bot";

function respond() {
  let request = JSON.parse(this.req.chunks[0]);

  if (request.text &&  request.text === activationString) {
    this.res.writeHead(200);
    postMessage();
    this.res.end();
  }
}

function getRandomIndex(arr) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return randomIndex;
}

function postMessage() {
  let botResponse = quotes[getRandomIndex(quotes)];

  let options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  let body = {
    bot_id : botID,
    text : botResponse
  };
  
  console.log('sending ' + botResponse + ' to ' + botID);
  console.log(body);

  let botReq = _request(options, function(res) {
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

const _respond = respond;
export { _respond as respond };