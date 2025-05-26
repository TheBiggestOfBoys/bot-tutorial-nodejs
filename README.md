# Jake's Bot
A fun and interactive GroupMe bot built with Node.js!  
Jake's Bot responds to messages in your GroupMe group with random quotes, images, GIFs, videos, documents, locations, or occasionally calls out a user.

## Setup
### If using callback URL
#### Cloud
- Create a Heroku (or similar service) account
- Create a project to host the bot
- Setup the GitHub (or similar service) integration
#### GroupMe Developers

- Create a bot on https://dev.groupme.com/
- Add the bot to the desired group chat
- Save the `BOT_ID`
- Add avatar URL
	- Must be image uplaoded to GroupMe
- Make the callback URL, the URL of the Cloud project + `/callback`

#### Repository
- Add `BOT_ID="botid"` to the `.env` and as a variable on Heroku
- Modify `app.json` & `packacge.json` for your needs
- Modify the logic in `bot.js` for your needs
- Modify the arrays in `data.js`
	- All images/GIFs/videos/documents must be already uploaded to GroupMe
		- Copy their links from chats or API

## Features
- **Random Replies:** chance to reply to any message.
- **Quotes & Media:** Replies may include a random quote, image, GIF, or video.
- **Documents & Locations:** Small chance to send a document or a location.
- **User Callouts:** Occasionally tags a user and says "@user, I'm calling you out!" (no other content in that reply).
- **Mentions & Replies:** Can mention users and reply directly to messages.
- All the percentages can be changed to your liking in the `.env`
	- They also must be put as variables in Heroku too