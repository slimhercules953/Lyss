const { CommandInteraction, Client, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const databasePath = './balances.json'; // Path to the database JSON file
const claimPath = './claim.json'; // Path to the claim JSON file

module.exports = {
    name: 'profile',
    description: 'View your profile including wallet, bank, daily status, and claim information.',
    options: [],

    run: async (client, interaction) => {
        const userId = interaction.user.id;

        // Read database data
        let database = readData(databasePath);

        // Read claim data
        let claimData = readData(claimPath);

        // Initialize user data in database if not found
        if (!database[userId]) {
            database[userId] = {
                wallet: 0,
                bank: 0,
                daily: 0,
            };
            saveData(databasePath, database); // Save new user data to the database
        }

        // Initialize claim data for the user if not found
        if (!claimData[userId]) {
            claimData[userId] = {
                claimedBy: null, // User who claimed them
                claimed: null, // User they claimed
            };
            saveData(claimPath, claimData); // Save new user claim data
        }

        const userData = database[userId];
        const userClaimData = claimData[userId];
        const currentTime = Date.now();
        const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        // Calculate daily cooldown
        let timeLeft = 0;
        if (userData.daily && currentTime - userData.daily < oneDay) {
            timeLeft = oneDay - (currentTime - userData.daily);
        }

        // Format cooldown into hours and minutes
        const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
        const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
        const cooldownMessage =
            timeLeft > 0
                ? `${hoursLeft} hours and ${minutesLeft} minutes left`
                : 'Available to claim!';

        // Claimer and claimed relationships
        const claimedBy = userClaimData.claimedBy
            ? `<@${userClaimData.claimedBy}>`
            : 'No one has claimed you yet.';
        const claimed = userClaimData.claimed
            ? `<@${userClaimData.claimed}>`
            : 'You haven’t claimed anyone yet.';

        // Create an embed for the profile
        const embed = new EmbedBuilder()
            .setTitle(`${interaction.user.username}'s Profile`)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 512 }))
            .addFields(
                { name: 'Wallet Balance', value: `${userData.wallet} coins`, inline: true },
                { name: 'Bank Balance', value: `${userData.bank} coins`, inline: true },
                { name: 'Daily Status', value: cooldownMessage, inline: false },
                { name: 'Claimed By', value: claimedBy, inline: true },
                { name: 'You Claimed', value: claimed, inline: true }
            )
            .setColor('#37115a')
            .setTimestamp();

        // Send the embed as a reply
        return interaction.followUp({ embeds: [embed] });
    },
};

// Function to read data from a JSON file
function readData(filePath) {
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } else {
        // If the file doesn't exist, return an empty object
        return {};
    }
}

// Function to save data to a JSON file
function saveData(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}
