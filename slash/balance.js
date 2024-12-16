const { CommandInteraction, Client, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = './balances.json'; // Path to the balances JSON file

module.exports = {
    name: 'balance',
    description: 'Check your current wallet and bank balances.',
    run: async (client, interaction) => {
        const userId = interaction.user.id;

        // Read balances from the JSON file
        let balancesData = readBalances();

        // Ensure the user's data exists and initialize to 0 if it doesn't
        if (!balancesData[userId]) {
            balancesData[userId] = { wallet: 0, bank: 0 }; // Initialize user's balance to 0
        }

        const walletBalance = balancesData[userId].wallet;
        const bankBalance = balancesData[userId].bank;

        // Create an embed to display the balances
        const embed = new EmbedBuilder()
            .setTitle(`${interaction.user.username}'s Balance`)
            .setDescription('Here are your current balances:')
            .addFields(
                { name: 'Wallet Balance', value: `${walletBalance} Hypno Dollars`, inline: true },
                { name: 'Bank Balance', value: `${bankBalance} Hypno Dollars`, inline: true }
            )
            .setColor('#37115a');

        // Send the embed as a reply
        await interaction.followUp({ embeds: [embed] });
        if (!balancesData[userId]) {
            balancesData[userId] = { wallet: 0, bank: 0 }; // Initialize user's balance to 0
            saveBalances(balancesData); // Save updated balance data to the file
        }
        
    }
};

// Function to read balances data from the JSON file
function readBalances() {
    if (fs.existsSync(path)) {
        return JSON.parse(fs.readFileSync(path, 'utf8'));
    } else {
        return {}; // Return an empty object if the file doesn't exist
    }
}

// Function to save the updated balances data to the JSON file
function saveBalances(data) {
    fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
}
