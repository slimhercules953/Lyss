const { CommandInteraction, Client, MessageEmbed } = require('discord.js');
// const db = require('quick.db');

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

        let walletBalance = db.get(`coins.${userId}`) || 0;
        let bankBalance = db.get(`bank.${userId}`) || 0;
        let amount;

        // If user says "all" or "max", set the amount to their entire wallet balance
        if (amountInput.toLowerCase() === 'all' || amountInput.toLowerCase() === 'max') {
            amount = walletBalance;
        } else {
            amount = parseInt(amountInput); // Try to convert input to a number
        }

        // Check for valid amount
        if (isNaN(amount) || amount <= 0) {
            return await interaction.followUp('Please enter a valid amount greater than zero.');
        }

        // Check if the user has enough in their wallet
        if (amount > walletBalance) {
            return await interaction.followUp(`You don't have enough Hypno Dollars in your wallet! Your current wallet balance is ${walletBalance}.`);
        }

        // Update wallet and bank balances
        db.subtract(`coins.${userId}`, amount);
        db.add(`bank.${userId}`, amount);

        // Get updated balances
        const newWalletBalance = db.get(`coins.${userId}`);
        const newBankBalance = db.get(`bank.${userId}`);

        // Create an embed for the result
        const embed = new MessageEmbed()
            .setTitle('Deposit Successful')
            .setDescription(`You have successfully deposited ${amount} Hypno Dollars into your bank.`)
            .addField('New Wallet Balance', newWalletBalance.toString(), true)
            .addField('New Bank Balance', newBankBalance.toString(), true)
            .setColor('#37115a');

        // Send the embed as a reply
        await interaction.followUp({ embeds: [embed] });
    }
};
