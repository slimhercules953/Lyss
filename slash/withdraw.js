const { CommandInteraction, Client, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const balancesFilePath = './balances.json';

// Helper function to read balances data
function getBalancesData() {
    if (!fs.existsSync(balancesFilePath)) {
        fs.writeFileSync(balancesFilePath, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(balancesFilePath, 'utf8'));
}

// Helper function to save balances data
function saveBalancesData(data) {
    fs.writeFileSync(balancesFilePath, JSON.stringify(data, null, 4));
}

module.exports = {
    name: 'withdraw',
    description: 'Withdraw money from your bank into your wallet.',
    options: [
        {
            name: 'amount',
            description: 'The amount of money to withdraw. Use "all" to withdraw everything.',
            type: 3, // String type to handle "all"
            required: true
        }
    ],
    run: async (client, interaction) => {
        const userId = interaction.user.id;
        const amountInput = interaction.options.getString('amount');

        // Read balances data
        const balancesData = getBalancesData();
        const userBalance = balancesData[userId] || { wallet: 0, bank: 0, daily: 0 };

        // Check if the user has any money in the bank
        if (userBalance.bank <= 0) {
            return interaction.followUp({ content: 'You have no Hypno Dollars in your bank to withdraw.', ephemeral: true });
        }

        // Handle "all" input
        let amountToWithdraw;
        if (amountInput.toLowerCase() === 'all') {
            amountToWithdraw = userBalance.bank;
        } else {
            amountToWithdraw = parseInt(amountInput, 10);

            // Validate amount
            if (isNaN(amountToWithdraw) || amountToWithdraw <= 0) {
                return interaction.followUp({ content: 'Please provide a valid amount to withdraw.', ephemeral: true });
            }

            // Check if the user has enough in the bank
            if (amountToWithdraw > userBalance.bank) {
                return interaction.followUp({ content: 'You do not have enough Hypno Dollars in your bank to withdraw that amount.', ephemeral: true });
            }
        }

        // Perform the withdrawal
        userBalance.bank -= amountToWithdraw;
        userBalance.wallet += amountToWithdraw;

        // Save updated balances
        balancesData[userId] = userBalance;
        saveBalancesData(balancesData);

        const embed = new EmbedBuilder()
            .setTitle('Withdrawal Successful')
            .setDescription(`You have withdrawn ${amountToWithdraw} Hypno Dollars into your wallet.`)
            .addFields(
                { name: 'New Wallet Balance', value: `${userBalance.wallet}`, inline: true },
                { name: 'New Bank Balance', value: `${userBalance.bank}`, inline: true }
            )
            .setColor('#37115a');

        await interaction.followUp({ embeds: [embed] });
    }
};
