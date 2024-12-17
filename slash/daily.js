const { CommandInteraction, Client } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = './balances.json'; // Path to the database JSON file

module.exports = {
    name: 'daily',
    description: 'Claim your randomly generated daily reward.',
    options: [],

    run: async (client, interaction) => {
        const userId = interaction.user.id;

        // Read database data
        let database = readDatabaseData();

        // Initialize user data if not found
        if (!database[userId]) {
            database[userId] = {
                wallet: 0,
                bank: 0,
                daily: 0,
            };
        }

        const userData = database[userId];
        const currentTime = Date.now();
        const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        // Check if the user is eligible to claim their daily reward
        if (userData.daily && currentTime - userData.daily < oneDay) {
            const timeLeft = oneDay - (currentTime - userData.daily);
            const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
            const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));

            return interaction.followUp({
                content: `You have already claimed your daily reward. Come back in ${hoursLeft} hours and ${minutesLeft} minutes!`,
                ephemeral: true,
            });
        }

        // Generate a random reward
        const reward = Math.floor(Math.random() * 100) + 50; // Random amount between 50 and 150

        // Update user's wallet and daily timestamp
        userData.wallet += reward;
        userData.daily = currentTime;

        // Save the updated database data
        saveDatabaseData(database);

        // Create an embed to show the reward
        const embed = new EmbedBuilder()
            .setTitle('Daily Reward Claimed!')
            .setDescription(`You have claimed your daily reward of **${reward} coins**.`)
            .addFields(
                { name: 'New Wallet Balance', value: `${userData.wallet} coins`, inline: true },
                { name: 'Bank Balance', value: `${userData.bank} coins`, inline: true }
            )
            .setColor('#37115a');

        // Reply with the embed
        return interaction.followUp({ embeds: [embed] });
    },
};

// Function to read the database data from the JSON file
function readDatabaseData() {
    if (fs.existsSync(path)) {
        return JSON.parse(fs.readFileSync(path, 'utf8'));
    } else {
        // If the file doesn't exist, return an empty object
        return {};
    }
}

// Function to save the database data to the JSON file
function saveDatabaseData(database) {
    fs.writeFileSync(path, JSON.stringify(database, null, 2), 'utf8');
}
