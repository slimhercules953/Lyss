const client = require("../index");  // Importing the client from index.js
const { Client, Events, ActivityType } = require('discord.js');

const { REST, Routes } = require('discord.js');

const TOKEN = process.env.TOKEN

const rest = new REST().setToken(TOKEN);

// Combined 'ready' event listener for the Discord client
client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    client.user.setActivity('users paint the world with kindness', { type: ActivityType.Watching });
});