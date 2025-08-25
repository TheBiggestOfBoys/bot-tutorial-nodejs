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
 * - GROUP_ID: The GroupMe Group ID (required for user tagging).
 * - ACCESS_TOKEN: Your GroupMe user access token (required for user tagging).
 * - PORT: The port to run the server on (default: 5000).
 */

const dotenv = require('dotenv');
const axios = require('axios');
const express = require('express');
const fs = require('fs');
const path = require('path');

dotenv.config();

const BOT_ID = process.env.BOT_ID;
const GROUP_ID = process.env.GROUP_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PORT = process.env.PORT || 5000;
const MEDIA_TYPES = ['images', 'gifs', 'videos'];

// Probability settings
const RESPONSE_PROBABILITY = parseFloat(process.env.RESPONSE_PROBABILITY) || 0.05;
const QUOTIFY_PROBABILITY = parseFloat(process.env.QUOTIFY_PROBABILITY) || 0.025;
const HARDLY_KNOW_HER_PROBABILITY = parseFloat(process.env.HARDLY_KNOW_HER_PROBABILITY) || 0.1;
const CALLOUT_PROBABILITY = parseFloat(process.env.CALLOUT_PROBABILITY) || 0.08;
const INCLUDE_TEXT_PROBABILITY = parseFloat(process.env.INCLUDE_TEXT_PROBABILITY) || 0.5;
const INCLUDE_MEDIA_PROBABILITY = parseFloat(process.env.INCLUDE_MEDIA_PROBABILITY) || 0.5;
const INCLUDE_MENTION_PROBABILITY = parseFloat(process.env.INCLUDE_MENTION_PROBABILITY) || 0.5;
const DOCUMENT_PROBABILITY = parseFloat(process.env.DOCUMENT_PROBABILITY) || 0.1;
const LOCATION_PROBABILITY = parseFloat(process.env.LOCATION_PROBABILITY) || 0.1;

const app = express();
app.use(express.json());

// Cache for group members (loaded on demand, expires after 1 hour)
let membersCache = null;
let cacheExpiry = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Fetches group members from GroupMe API
 * @returns {Promise<Array|null>} Array of member objects or null if error
 */
async function getGroupMembers() {
    // Check if cache is still valid
    if (membersCache && Date.now() < cacheExpiry) {
        return membersCache;
    }

    if (!GROUP_ID || !ACCESS_TOKEN) {
        console.warn('GROUP_ID and ACCESS_TOKEN required for user tagging');
        return null;
    }

    try {
        console.log('Fetching group members from API...');
        
        const response = await axios.get(`https://api.groupme.com/v3/groups/${GROUP_ID}/members`, {
            params: { token: ACCESS_TOKEN }
        });

        if (response.data.meta.code !== 200) {
            console.error('GroupMe API Error:', response.data.meta);
            return null;
        }

        membersCache = response.data.response.members;
        cacheExpiry = Date.now() + CACHE_DURATION;
        
        console.log(`Loaded ${membersCache.length} group members`);
        return membersCache;
        
    } catch (error) {
        console.error('Error fetching group members:', error.message);
        return null;
    }
}

/**
 * Gets a random group member
 * @returns {Promise<Object|null>} Random member object {nickname, user_id} or null
 */
async function getRandomMember() {
    const members = await getGroupMembers();
    if (!members || members.length === 0) return null;
    
    return members[Math.floor(Math.random() * members.length)];
}

/**
 * Gets member info by user ID
 * @param {string} userId - The user ID to look up
 * @returns {Promise<Object|null>} Member object or null if not found
 */
async function getMemberById(userId) {
    const members = await getGroupMembers();
    if (!members) return null;
    
    return members.find(member => member.user_id === userId) || null;
}
//#endregion

//#region File Utility Functions
/**
 * Returns a random line from a text file
 * @param {string} filename - Name of the file (e.g., 'quotes.txt')
 * @returns {string|null} Random line from file, or null if error/empty
 */
function getRandomLineFromFile(filename) {
    try {
        const filePath = path.join(__dirname, 'Data', filename);
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim() !== '');

        if (lines.length === 0) return null;

        return lines[Math.floor(Math.random() * lines.length)];
    } catch (error) {
        console.error(`Error reading ${filename}:`, error);
        return null;
    }
}

/**
 * Gets a random document from documents.txt
 * Expected format: "url|title" (one per line)
 * @returns {Object|null} {url, title} or null
 */
function getRandomDocument() {
    const line = getRandomLineFromFile('documents.txt');
    if (!line) return null;
    
    const [url, title] = line.split('|');
    return url && title ? { url, title } : null;
}

/**
 * Gets a random location from locations.txt  
 * Expected format: "name|lat|lng" (one per line)
 * @returns {Object|null} {name, lat, lng} or null
 */
function getRandomLocation() {
    const line = getRandomLineFromFile('locations.txt');
    if (!line) return null;
    
    const [name, lat, lng] = line.split('|');
    if (!name || !lat || !lng) return null;
    
    return { 
        name, 
        lat: parseFloat(lat), 
        lng: parseFloat(lng) 
    };
}

/**
 * Returns a random media URL from the specified file
 * @param {'images'|'gifs'|'videos'} type 
 * @returns {string|null}
 */
function getRandomMedia(type) {
    return getRandomLineFromFile(`${type}.txt`);
}

/**
 * Returns a random quote from quotes.txt
 * @returns {string|null}
 */
function getRandomQuote() {
    return getRandomLineFromFile('quotes.txt');
}
//#endregion

//#region Utility Functions
/**
 * Returns a random element from an array.
 * @param {Array} arr 
 * @returns {*} Random element
 */
function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
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
 * If a message ends with a word ending in 'er', returns a "hardly know her" joke.
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
        const member = await getMemberById(user_id);
        const user_name = member ? member.nickname : "user";
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

        if (callout_user) {
            // Tag a random user and call them out (no other content)
            const randomMember = await getRandomMember();
            if (randomMember) {
                text = `@${randomMember.nickname}, I'm calling you out!`;
                attachments.push({
                    type: "mentions",
                    user_ids: [randomMember.user_id],
                    loci: [[0, (`@${randomMember.nickname}`).length]]
                });
                called_out = true;
            }
        } else {
            // Normal random reply
            if (include_text) {
                text = getRandomQuote();
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
            if (Math.random() < DOCUMENT_PROBABILITY) {
                const doc = getRandomDocument();
                if (doc) {
                    attachments.push({
                        type: "document",
                        url: doc.url,
                        title: doc.title
                    });
                }
            }
            // Small chance to include a location
            if (Math.random() < LOCATION_PROBABILITY) {
                const loc = getRandomLocation();
                if (loc) {
                    attachments.push({
                        type: "location",
                        name: loc.name,
                        lat: loc.lat,
                        lng: loc.lng
                    });
                }
            }
        }

        // Only mention user if not a callout and include_mention is true
        let mention_user_id = null;
        if (!called_out && include_mention) {
            const randomMember = await getRandomMember();
            mention_user_id = randomMember ? randomMember.user_id : null;
        }

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
