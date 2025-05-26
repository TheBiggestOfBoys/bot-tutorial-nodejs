const dotenv = require('dotenv');
const axios = require('axios');
const express = require('express');
const { quotes, images, gifs, videos } = require('./data');
const { NAME_TO_USER_ID, USER_ID_TO_NAME } = require('./user_ids');

dotenv.config();

const BOT_ID = process.env.BOT_ID;
const PORT = process.env.PORT || 5000;
const MEDIA_TYPES = ['images', 'gifs', 'videos'];

const app = express();
app.use(express.json());

// Utility Functions
function getRandom(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomMedia(type) {
	if (type === 'images') return getRandom(images);
	if (type === 'gifs') return getRandom(gifs);
	if (type === 'videos') return getRandom(videos);
	return null;
}

async function sendMessage({ text = null, image_url = null, video_url = null, user_id = null, reply_id = null }) {
	const GROUPME_POST_URL = 'https://api.groupme.com/v3/bots/post';

	if (!text && !image_url && !video_url) {
		console.warn("sendMessage called with no content. Aborting send.");
		return null;
	}

	const payload = { bot_id: BOT_ID, text: text || "" };
	const attachments = [];

	if (image_url) {
		attachments.push({ type: 'image', url: image_url });
	}
	if (video_url) {
		if (video_url.endsWith('.mp4')) {
			const preview_url = video_url.slice(0, -3) + 'jpg';
			attachments.push({ type: 'video', url: video_url, preview_url });
		}
	}
	if (user_id) {
		const user_name = USER_ID_TO_NAME[user_id] || "user";
		const mention_text = `@${user_name}`;
		payload.text = payload.text ? `${mention_text} ${payload.text}` : mention_text;
		attachments.push({
			type: "mentions",
			user_ids: [user_id],
			loci: [[0, mention_text.length]]
		});
	}
	if (reply_id) {
		attachments.push({
			type: "reply",
			reply_id,
			base_reply_id: reply_id
		});
	}
	if (attachments.length > 0) {
		payload.attachments = attachments;
	}

	try {
		const response = await axios.post(GROUPME_POST_URL, payload);
		console.log(`Status: ${response.status}, Content: ${JSON.stringify(response.data)}`);
		return response.data;
	} catch (e) {
		console.error(`Error sending message: ${e}`);
		return null;
	}
}

// Main webhook endpoint for GroupMe callback
app.post('/callback', async (req, res) => {
	const message = req.body;

	// Ignore messages sent by the bot itself
	if (message.sender_type && message.sender_type === 'bot') {
		return res.sendStatus(200);
	}

	// Example: respond to a keyword or randomly
	const shouldRespond = Math.random() < 0.5; // Adjust probability as needed
	if (shouldRespond) {
		let include_text = Math.random() < 0.5;
		let include_media = Math.random() < 0.5;
		let include_mention = Math.random() < 0.5;

		if (!include_text && !include_media) {
			if (Math.random() < 0.5) include_text = true;
			else include_media = true;
		}

		let text = null, image_url = null, video_url = null;

		if (include_text) {
			text = getRandom(quotes);
		}
		if (include_media) {
			const media_type = getRandom(MEDIA_TYPES);
			const media_url = getRandomMedia(media_type);
			if (media_type === 'images' || media_type === 'gifs') {
				image_url = media_url;
			} else {
				video_url = media_url;
			}
		}

		const mention_user_id = include_mention ? message.sender_id : null;

		if (text || image_url || video_url) {
			await sendMessage({
				text,
				image_url,
				video_url,
				user_id: mention_user_id,
				reply_id: message.id
			});
		}
	}

	res.sendStatus(200);
});

// Health check endpoint
app.get('/', (req, res) => {
	res.send('Bot is running.');
});

app.listen(PORT, () => {
	console.log(`Bot server listening on port ${PORT}`);
});
