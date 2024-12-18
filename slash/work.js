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
    name: 'work',
    description: 'Use your job to earn money.',
    run: async (client, interaction) => {
        const userId = interaction.user.id;

        // Read balances data
        const balancesData = getBalancesData();
        const userBalance = balancesData[userId] || { wallet: 0, bank: 0, daily: 0, job: null, jobCooldown: 0 };

        // Check if the user has a job
        const job = userBalance.job;
        if (!job) {
            return interaction.followUp('You need to pick a job first! Use /pickjob to select one.');
        }

        const cooldown = 60 * 60 * 1000; // 60 minutes in milliseconds
        const lastWorked = userBalance.jobCooldown || 0;
        const currentTime = Date.now();

        // Check if the user is still on cooldown
        if (currentTime - lastWorked < cooldown) {
            const timeLeft = Math.ceil((cooldown - (currentTime - lastWorked)) / 60000); // Time left in minutes
            return interaction.followUp(`You need to wait ${timeLeft} more minutes before working again.`);
        }

        // Update the cooldown timer
        userBalance.jobCooldown = currentTime;

        // Generate a random earning based on the user's job
        let earnings;
        switch (job) {
            case 'farmer':
                earnings = Math.floor(Math.random() * 50) + 50; // Farmer earns 50-100 coins
                break;
            case 'miner':
                earnings = Math.floor(Math.random() * 100) + 100; // Miner earns 100-200 coins
                break;
            case 'merchant':
                earnings = Math.floor(Math.random() * 150) + 200; // Merchant earns 200-350 coins
                break;
            default:
                earnings = 0; // Default earnings if job is invalid
        }

        // Add earnings to the user's wallet
        userBalance.wallet += earnings;

        // Save updated balances data
        balancesData[userId] = userBalance;
        saveBalancesData(balancesData);

        // Create the response embed
        const embed = new EmbedBuilder()
            .setTitle('Work Successful')
            .setDescription(`You worked as a ${job} and earned ${earnings} coins!`)
            .addFields({ name: 'New Wallet Balance', value: `${userBalance.wallet} coins`, inline: true })
            .setColor('#37115a');

        await interaction.followUp({ embeds: [embed] });
    }
};
