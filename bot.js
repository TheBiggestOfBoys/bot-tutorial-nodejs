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
	"Mama I'm a criminal",
	"https://youtube.com/shorts/lfDdP93GM3k?si=MudB-7tGL1oD0LAL",
	"I'm feelin' MAD stuffy rn",
	"O'Drizzly...",
	"Hey @Peter",
];

const imageURLs = [
	"https://i.groupme.com/1080x1079.jpeg.e08faeb0a4bb4068b458a3f63994a842",
	"https://i.groupme.com/750x650.png.8874165939864b6b9d26ad5e918dcd0d",
	"https://i.groupme.com/375x666.jpeg.6bef1d29066e4ace89ad056a551eceb5",
	"https://i.groupme.com/720x1280.jpeg.017a0936855f4703b73bb28cc2d974a3",
	"https://i.groupme.com/433x577.jpeg.6347f72c4ce0467998beb54f9460bd77",
	"https://i.groupme.com/3024x4032.jpeg.c6f14d8fa5b44c30b0bbb031b3634751",
	"https://i.groupme.com/750x739.jpeg.9f6db6097d7b43ab9c497df4b3dea139",
	"https://i.groupme.com/551x699.jpeg.3c182abef6d044dfb218803cf8df828f",
	"https://i.groupme.com/1152x1750.png.764de261289d422b8c13117669700e83",
	"https://i.groupme.com/750x650.png.8874165939864b6b9d26ad5e918dcd0d",
	"https://i.groupme.com/480x429.jpeg.5acd54f001864eaaaa1230ba9457ce14",
	"https://i.groupme.com/1482x800.png.da55ee91b13d4a9aacdda8fe01b8287c",
	"https://i.groupme.com/768x403.jpeg.b130366fed5941fcad9227937db57ddd",
	"https://i.groupme.com/957x1258.jpeg.b5d71e7f4a0f4a59ad6275b2712c3458",
	"https://i.groupme.com/1500x2000.jpeg.977af0db50804deda9842c7d576650cf",
	"https://i.groupme.com/298x167.jpeg.f30bd5f19ccd4a00b31b167a9209911a",
	"https://i.groupme.com/320x180.jpeg.aa245952845042fea4f24bd3a0a75cde",
	"https://i.groupme.com/243x369.jpeg.7f2af1009dc744d0bd0aaefec59508b6",
	"https://i.groupme.com/375x666.jpeg.06b2138cb74e4b6fba392b490743fd18",
	"https://i.groupme.com/606x856.png.c072de3871994608839b38a1fff8d179",
	"https://i.groupme.com/300x480.png.0acdb46bd00c44acb50f5e83e8c2643b",
	"https://i.groupme.com/1500x2000.jpeg.d8eecab63de441e6bfa539af43c8c00c",
	"https://i.groupme.com/2000x924.jpeg.a071b3fc04394277a879b0f1d05aa06d",
	"https://i.groupme.com/2796x4974.jpeg.fbb3ff2d0da04af09015b10ec709544c",
	"https://i.groupme.com/1124x1498.jpeg.ed053252e43d49458f4d209c4e25482d",
	"https://i.groupme.com/720x1280.jpeg.83d0c2376fba4779a8d986e736f96d01",
	"https://i.groupme.com/720x1280.jpeg.b14b1ccb7dae43a98d23e61bd05f368b",
	"https://i.groupme.com/2532x1401.jpeg.3af482e4109d43efadeda614314688bc",
	"https://i.groupme.com/720x1280.jpeg.a699c61c19dd498285f54da5df453af1",
	"https://i.groupme.com/1080x598.jpeg.3947d092bb6e434893c6d78372847cbd",
	"https://i.groupme.com/2532x4494.jpeg.b2b6ebf281e342c0a894c7882c9351c1",
	"https://i.groupme.com/225x225.jpeg.284025cd84ed441db9f93c02308f1d78",
	"https://i.groupme.com/680x653.jpeg.3cf30494de2242f48fae288222bef492",
	"https://i.groupme.com/680x760.png.87e40d892c2b4158ac236deeb5b31ae3",
	"https://i.groupme.com/1170x1149.jpeg.334339372c9e47b4a76d1be82b88d5ac",
	"https://i.groupme.com/1025x1348.jpeg.e9a4efb4a4ce4300ae48646b30166c98",
	"https://i.groupme.com/1334x2372.jpeg.dabcb7a3eaa34d99919d153153aed451",
	"https://i.groupme.com/3024x4032.jpeg.b238c4f2a2a041c38dcd5b60c9b6b3da",
	"https://i.groupme.com/768x1024.jpeg.178e1a140cc5492880e7cc4fefab0577",
	"https://i.groupme.com/2268x4032.jpeg.a864771c5cfb4e1e862bcc4d7cbc878f",
	"https://i.groupme.com/2316x3088.jpeg.614b6cc1d5954cb5a81943f693cfe78d",
	"https://i.groupme.com/2532x4485.jpeg.dfa35d7a1c684acc8ea6a4a65d874830",
	"https://i.groupme.com/1170x821.jpeg.f1ed3520ba2e4781a98ac3b3f2fe6636",
	"https://i.groupme.com/1920x1280.jpeg.574499bcd88b43a39b6c2a49aaecb30d",
	"https://i.groupme.com/2000x1500.jpeg.174deeccab4a406ea4498f0254a60945",
	"https://i.groupme.com/2268x4032.jpeg.dc60909e71c241709330a43abcfe8b27",
	"https://i.groupme.com/3024x4032.jpeg.f3654b5d693341399af5512c57c85bef",
	"https://i.groupme.com/2532x4494.jpeg.807f615711ae4d429c22bc29a7d131b4",
	"https://i.groupme.com/3024x4032.jpeg.68b4bb5e41904268ba3f4461b4c8b307",
	"https://i.groupme.com/3024x4032.jpeg.6ac82ac8e5c946ac84b6b0e400fdf75c",
	"https://i.groupme.com/1280x720.jpeg.45cf746afbc140c4966e9975216b836e",
	"https://i.groupme.com/828x1083.jpeg.f8330161bb074bf2a2730b41ef6037a9",
	"https://i.groupme.com/2268x4032.jpeg.b5ea55bd76064a36b7933ffc773194b2",
	"https://i.groupme.com/575x800.png.7c7844c11f61465a8714575f66c714fe",
	"https://i.groupme.com/1334x2372.jpeg.1c399ed3f89f4ad382b13cb485f4efcd",
	"https://i.groupme.com/2259x3048.jpeg.3c8674314f4f4aeeac095238ab5fe65c",
	"https://i.groupme.com/1600x900.jpeg.44ae6265a13b49b7a3a15f22418a54d4",
	"https://i.groupme.com/161x250.jpeg.627cc972bd534f8d9562b91ff0853718",
	"https://i.groupme.com/1467x2016.jpeg.372c9674c125466a98d7e699d004245e",
	"https://i.groupme.com/894x1078.jpeg.984cead0bd94400cba766bd8e6a3abb6",
	"https://i.groupme.com/1165x874.jpeg.00444f2970424617983b4282be7a90d4",
	"https://i.groupme.com/1165x874.jpeg.0824d5badfe84a5e86be2a8cf80c30a2",
	"https://i.groupme.com/1224x1632.jpeg.c4c525901e334578854274a8499d6f9a",
	"https://i.groupme.com/1165x874.jpeg.68647a2cdec040958db888a2f75d82a9",
	"https://i.groupme.com/1917x2556.jpeg.0455cf6283d84306be1ec3b5281bad07",
	"https://i.groupme.com/1333x1000.jpeg.2e06800e9a4b41c9ba5801b386a325a4",
	"https://i.groupme.com/1536x2048.jpeg.55d5227b3d914d06a65f6a68c540c058",
	"https://i.groupme.com/433x577.jpeg.5deb4e3370a24fa39cfdf49599b3e6e7",
	"https://i.groupme.com/1827x2436.jpeg.96f4c5089f1a49afbb1c5c6a51322997",
	"https://i.groupme.com/1917x2556.jpeg.847cbe1456f9411d8b47b40b2dfadce6",
	"https://i.groupme.com/224x224.jpeg.ed1bd0080936486c9de30aeed796993f",
	"https://i.groupme.com/182x274.jpeg.3dbad591aadd449d9ebc619e9d3a8d6a",
	"https://i.groupme.com/2040x1530.jpeg.1043bb6112434022a89eec0a490f0770",
	"https://i.groupme.com/1333x616.jpeg.cbc8073acea94c8eb4c9acae52b27ab1",
	"https://i.groupme.com/220x213.jpeg.33ffba4f75034a24a61cd9cec26c4f8d",
	"https://i.groupme.com/2436x3246.jpeg.9f3cd8c6c93042d3adac298f8a4e5ae4",
	"https://i.groupme.com/2340x3816.jpeg.4c0ab73d8f73472985b090b82a1a24d0",
	"https://i.groupme.com/160x144.jpeg.eb9a1bf53eb74e2bac2e545362425a62",
	"https://i.groupme.com/955x765.png.55d445ce7dcf4b8ea9d7a0224712c675",
	"https://i.groupme.com/551x699.jpeg.a9a384d7b0e54fa887a3d76c69ff17ef",
	"https://i.groupme.com/2097x2796.jpeg.0e656e5ff70447b1904cbae8a68b3709",
	"https://i.groupme.com/800x450.jpeg.78bae4e7e4d349a6aca6438477208c2b",
	"https://i.groupme.com/388x392.jpeg.5501575e561d4ef5a13694c372c14b96",
	"https://i.groupme.com/148x148.gif.64f227cfbe1f4d1a934eecf98a90d11f",
	"https://i.groupme.com/405x720.gif.99b5d82e6e404e7aa230fbeffdf62557",
	"https://i.groupme.com/640x522.gif.102d79b04911443ab791e3194e2764c6",
	"https://i.groupme.com/405x720.gif.9273e0313da342399d63fbf29662c32f",
	"https://i.groupme.com/220x91.gif.9fdc010e19a54c89b5aaa7d2a4d07556",
	"https://i.groupme.com/390x480.gif.17bf3bd7d62a48a18739f6b3db0801ac",
	"https://i.groupme.com/640x612.gif.79d5b648e1b043edafebc24c3a01250e",
	"https://i.groupme.com/195x229.gif.f8d72135257a4db18cef44f487ab4186",
	"https://i.groupme.com/480x200.gif.38c3f06228b445b694e0f87ca3220d55",
	"https://i.groupme.com/498x498.gif.9ba90b8b11f94d3dbf50370e1176971c",
	"https://i.groupme.com/480x206.gif.3e04bcc558c345b5ac2a2d42f67bbcc3",
	"https://i.groupme.com/220x181.gif.132aca3241874b6fb5611751ceef1525",
	"https://i.groupme.com/500x375.gif.6f44868e1a01423abf02966310ff11be",
	"https://i.groupme.com/540x224.gif.6130682e337d4bb9b0d2ee51523f7bf7",
	"https://i.groupme.com/382x470.gif.84d33a9a20b9416eb80fec8a685a312f",
	"https://i.groupme.com/390x480.gif.621af73028224623aab6c2a03c14a9d0",
	"https://i.groupme.com/220x162.gif.5b78feafbdb94b9da927cab4c9ae3bc6",
	"https://i.groupme.com/220x159.gif.6885716a001243d6b3f117821b4de53f",
	"https://i.groupme.com/245x220.gif.c91f05b6e02343d2bcbb3ddb25c3ee4c",
    "https://i.groupme.com/220x165.gif.fe288553b30e43e3a4c38b1c9303527f"
]

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
	body.text = quotes[getRandomIndex(quotes)];
	body.attachments[0].url = imageURLs[getRandomIndex(imageURLs)];

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
