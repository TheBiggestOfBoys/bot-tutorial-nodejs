//#region Header & Config
/**
 * GroupMe Bot Server
 * ------------------
 * Responds to GroupMe messages with random quotes, media, documents, locations, or user callouts.
 * 
 * Features:
 * - Randomly replies to messages (50% chance).
 * - Replies may include a quote, media (image/gif/video), document, or location.
 * - Occasionally tags the user and "calls them out" (8% chance), in which case only the callout is sent.
 * - Can mention users and reply to specific messages.
 * 
 * Environment Variables:
 * - BOT_ID: The GroupMe Bot ID (required).
 * - PORT: The port to run the server on (default: 5000).
 */

const dotenv = require('dotenv');
const axios = require('axios');
const express = require('express');
const { quotes, images, gifs, videos, documents, locations } = require('./data');
const { NAME_TO_USER_ID, USER_ID_TO_NAME } = require('./user_ids');

dotenv.config();

const BOT_ID = process.env.BOT_ID;
const PORT = process.env.PORT || 5000;
const MEDIA_TYPES = ['images', 'gifs', 'videos'];

// Probability settings
const RESPONSE_PROBABILITY = parseFloat(process.env.RESPONSE_PROBABILITY) || 0.05;      // Chance to respond to a message
const QUOTIFY_PROBABILITY = parseFloat(process.env.QUOTIFY_PROBABILITY) || 0.025;      // Chance to quotify a message
const HARDLY_KNOW_HER_PROBABILITY = parseFloat(process.env.HARDLY_KNOW_HER_PROBABILITY) || 0.1; // Chance to "hardly know her"
const CALLOUT_PROBABILITY = parseFloat(process.env.CALLOUT_PROBABILITY) || 0.08;       // Chance to call out a user
const INCLUDE_TEXT_PROBABILITY = parseFloat(process.env.INCLUDE_TEXT_PROBABILITY) || 0.5;   // Chance to include text
const INCLUDE_MEDIA_PROBABILITY = parseFloat(process.env.INCLUDE_MEDIA_PROBABILITY) || 0.5; // Chance to include media
const INCLUDE_MENTION_PROBABILITY = parseFloat(process.env.INCLUDE_MENTION_PROBABILITY) || 0.5; // Chance to mention user
const DOCUMENT_PROBABILITY = parseFloat(process.env.DOCUMENT_PROBABILITY) || 0.1;     // Chance to include a document
const LOCATION_PROBABILITY = parseFloat(process.env.LOCATION_PROBABILITY) || 0.1;     // Chance to include a location

const app = express();
app.use(express.json());
//#endregion

//#region Utility Functions
/**
 * Returns a random element from an array.
 * @param {Array} arr 
 * @returns {string} Random element of the array (quote/URL)
 */
function getRandom(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Returns a random media URL of the given type.
 * @param {'images'|'gifs'|'videos'} type 
 * @returns {string|null} Media URL
 */
function getRandomMedia(type) {
	if (type === 'images') return getRandom(images);
	if (type === 'gifs') return getRandom(gifs);
	if (type === 'videos') return getRandom(videos);
	return null;
}

/**
 * For each word in the text, randomly chooses to quotify it based on a percentage passed to the function.
 * Returns the text with randomly quoted words if any were quotified, otherwise null.
 * @param {string} text
 * @param {number} quotyness - Probability (0 to 1) to quotify each word
 * @returns {string|null}
 */
function quotify(text, quotyness) {
	if (typeof text !== 'string' || text.trim().length === 0) return null;
	const words = text.split(/\s+/);
	let changed = false;
	const quotified = words.map(word => {
		if (Math.random() < quotyness) {
			changed = true;
			return `"${word}"`;
		}
		return word;
	});
	return changed ? quotified.join(' ') : null;
}

/**
 * If a message ends with a word ending in 'her', returns a "hardly know her" joke.
 * E.g., "They never found the killer" -> "Kill her? I hardly know her!"
 * @param {string} text
 * @returns {string|null}
 */
function hardlyKnowHer(text) {
    if (typeof text === 'string') {
        const match = text.match(/(\w+)er\b/i);
        if (match && match[1]) {
            let base = match[1];
            // Capitalize if the original word was capitalized
            if (text.match(new RegExp(`\\b${base}er`, 'i'))[0][0] === text.match(new RegExp(`\\b${base}er`, 'i'))[0][0].toUpperCase()) {
                base = base[0].toUpperCase() + base.slice(1).toLowerCase();
            }
            return `${base} her? I hardly know her!`;
        }
    }
    return null;
}
//#endregion

//#region Message Sending
/**
 * Sends a message to GroupMe using the bot API.
 * @param {Object} options
 * @param {string|null} options.text - The message text.
 * @param {string|null} options.image_url - Image URL to attach.
 * @param {string|null} options.video_url - Video URL to attach.
 * @param {string|null} options.user_id - User ID to mention.
 * @param {string|null} options.reply_id - Message ID to reply to.
 * @param {Array|null} options.extra_attachments - Additional attachments (e.g., document, location).
 */
async function sendMessage({ text = null, image_url = null, video_url = null, user_id = null, reply_id = null, extra_attachments = null }) {
	const GROUPME_POST_URL = 'https://api.groupme.com/v3/bots/post';

	if (!text && !image_url && !video_url && (!extra_attachments || extra_attachments.length === 0)) {
		console.warn("sendMessage called with no content. Aborting send.");
		return null;
	}

	const payload = { bot_id: BOT_ID, text: text || "" };
	const attachments = [];

	// Attach image
	if (image_url) {
		attachments.push({ type: 'image', url: image_url });
	}
	// Attach video (with preview if possible)
	if (video_url) {
		if (video_url.endsWith('.mp4')) {
			const preview_url = video_url.slice(0, -3) + 'jpg';
			attachments.push({ type: 'video', url: video_url, preview_url });
		}
	}
	// Mention user (if not a callout)
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
	// Reply to a message
	if (reply_id) {
		attachments.push({
			type: "reply",
			reply_id,
			base_reply_id: reply_id
		});
	}
	// Add any extra attachments (documents, locations, etc.)
	if (extra_attachments && Array.isArray(extra_attachments)) {
		attachments.push(...extra_attachments);
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
//#endregion

//#region Webhook Endpoint
/**
 * Main webhook endpoint for GroupMe callback.
 * Responds to incoming messages with random content or a callout.
 */
app.post('/callback', async (req, res) => {
	const message = req.body;

	// Ignore messages sent by the bot itself
	if (message.sender_type && message.sender_type === 'bot') {
		return res.sendStatus(200);
	}

	// --- Always check for "hardly know her" ---
	if (message.text) {
		const hkh = hardlyKnowHer(message.text);
		if (hkh) {
			const shouldHardlyKnowHer = Math.random() < HARDLY_KNOW_HER_PROBABILITY;
			if (shouldHardlyKnowHer) {
				await sendMessage({
					text: hkh,
					reply_id: message.id
				});
				return res.sendStatus(200);
			}
		}
	}

	// --- Quotify only with response probability ---
	const shouldQuotify = Math.random() < QUOTIFY_PROBABILITY;
	if (shouldQuotify && message.text) {
		const quotified = quotify(message.text, 0.25);
		if (quotified) {
			await sendMessage({
				text: quotified,
				reply_id: message.id
			});
			return res.sendStatus(200);
		}
	}

	// --- Normal random response logic ---
	const shouldRespond = Math.random() < RESPONSE_PROBABILITY;
	if (shouldRespond) {
		let include_text = Math.random() < INCLUDE_TEXT_PROBABILITY;
		let include_media = Math.random() < INCLUDE_MEDIA_PROBABILITY;
		let include_mention = Math.random() < INCLUDE_MENTION_PROBABILITY;
		let callout_user = Math.random() < CALLOUT_PROBABILITY;

		// Ensure at least one of text or media is included
		if (!include_text && !include_media) {
			if (Math.random() < 0.5) include_text = true;
			else include_media = true;
		}

		let text = null, image_url = null, video_url = null, attachments = [];
		let called_out = false;

		if (callout_user && message.sender_id) {
			// Tag the user and call them out (no other content)
			const user_name = USER_ID_TO_NAME[message.sender_id] || "user";
			text = `@${user_name}, I'm calling you out!`;
			attachments.push({
				type: "mentions",
				user_ids: [message.sender_id],
				loci: [[0, (`@${user_name}`).length]]
			});
			called_out = true;
		} else {
			// Normal random reply
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
			// Small chance to include a document
			if (documents.length > 0 && Math.random() < DOCUMENT_PROBABILITY) {
				const doc = getRandom(documents);
				attachments.push({
					type: "document",
					url: doc.url,
					title: doc.title
				});
			}
			// Small chance to include a location
			if (locations.length > 0 && Math.random() < LOCATION_PROBABILITY) {
				const loc = getRandom(locations);
				attachments.push({
					type: "location",
					name: loc.name,
					lat: loc.lat,
					lng: loc.lng
				});
			}
		}

		// Only mention user if not a callout
		const mention_user_id = (!called_out && include_mention) ? message.sender_id : null;

		if (text || image_url || video_url || attachments.length > 0) {
			await sendMessage({
				text,
				image_url,
				video_url,
				user_id: mention_user_id,
				reply_id: message.id,
				extra_attachments: attachments
			});
		}
	}
	res.sendStatus(200);
});
//#endregion

//#region Health Check & Server Start
/**
 * Health check endpoint.
 */
app.get('/', (req, res) => {
	res.send('Bot is running.');
});

/**
 * Start the server.
 */
app.listen(PORT, () => {
	console.log(`Bot server listening on port ${PORT}`);
});
//#endregion
