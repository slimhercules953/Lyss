const { CommandInteraction, Client, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = './balances.json'; // Path to the balances JSON file

module.exports = {
    name: 'deposit',
    description: 'Deposit Hypno Dollars from your wallet to your bank.',
    options: [{
        name: 'amount',
        description: 'The amount of Hypno Dollars to deposit ("all" to deposit everything).',
        type: 3, // We use STRING to handle "all" or "max"
        required: true
    }],
    run: async (client, interaction) => {
        const amountInput = interaction.options.getString('amount'); // Get amount as a string
        const userId = interaction.user.id;

        // Read balances from the JSON file
        let balancesData = readBalances();

        // Ensure the user's data exists
        if (!balancesData[userId]) {
            balancesData[userId] = { wallet: 0, bank: 0 }; // Initialize the user's data
        }

        let walletBalance = balancesData[userId].wallet;
        let bankBalance = balancesData[userId].bank;
        let amount;

        // Handle "all" or "max" input
        if (amountInput.toLowerCase() === 'all' || amountInput.toLowerCase() === 'max') {
            amount = walletBalance;
        } else {
            amount = parseInt(amountInput); // Try to convert input to a number
        }

        // Validate the deposit amount
        if (isNaN(amount) || amount <= 0) {
            return await interaction.followUp('Please enter a valid amount greater than zero.');
        }

        // Check if the user has enough in their wallet
        if (amount > walletBalance) {
            return await interaction.followUp(`You don't have enough Hypno Dollars in your wallet! Your current wallet balance is ${walletBalance}.`);
        }

        // Update balances
        balancesData[userId].wallet -= amount;
        balancesData[userId].bank += amount;

        // Save the updated data to the file
        saveBalances(balancesData);

        // Get updated balances
        const newWalletBalance = balancesData[userId].wallet;
        const newBankBalance = balancesData[userId].bank;

        // Create an embed for the result
        const embed = new EmbedBuilder()
            .setTitle('Deposit Successful')
            .setDescription(`You have successfully deposited ${amount} Hypno Dollars into your bank.`)
            .addFields(
                { name: 'New Wallet Balance', value: `${newWalletBalance}`, inline: true },
                { name: 'New Bank Balance', value: `${newBankBalance}`, inline: true }
            )
            .setColor('#37115a');

        // Send the embed as a reply
        await interaction.followUp({ embeds: [embed] });
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

// Function to save balances data to the JSON file
function saveBalances(data) {
    fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
}
