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
    name: 'pickjob',
    description: 'Pick a job to start earning money.',
    options: [{
        name: 'job',
        description: 'Choose a job: Farmer, Miner, or Merchant.',
        type: 3,
        required: true,
        choices: [
            { name: 'Farmer', value: 'farmer' },
            { name: 'Miner', value: 'miner' },
            { name: 'Merchant', value: 'merchant' }
        ]
    }],
    run: async (client, interaction) => {
        const job = interaction.options.getString('job');
        const userId = interaction.user.id;

        // Read balances data
        const balancesData = getBalancesData();
        const userBalance = balancesData[userId] || { wallet: 0, bank: 0, daily: 0, job: null, jobCooldown: 0 };

        // Check if the user already has a job
        if (userBalance.job) {
            return interaction.followUp(`You already have a job as a ${userBalance.job}. Use /work to earn money.`);
        }

        // Assign the selected job to the user
        userBalance.job = job;
        userBalance.jobCooldown = 0; // Initialize cooldown
        balancesData[userId] = userBalance;
        saveBalancesData(balancesData);

        const embed = new EmbedBuilder()
            .setTitle('Job Selected')
            .setDescription(`You have chosen to be a ${job}. Use /work every 60 minutes to earn money.`)
            .setColor('#37115a');

        await interaction.followUp({ embeds: [embed] });
    }
};
