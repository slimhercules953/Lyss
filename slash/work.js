const { CommandInteraction, Client, MessageEmbed } = require('discord.js');
// const db = require('quick.db');

module.exports = {
    name: 'work',
    description: 'Use your job to earn money.',
    run: async (client, interaction) => {
        const userId = interaction.user.id;

        // Check if the user has a job
        const job = db.get(`job_${userId}`);
        if (!job) {
            return interaction.followUp('You need to pick a job first! Use /pickjob to select one.');
        }

        const cooldown = 60 * 60 * 1000; // 60 minutes in milliseconds
        const lastWorked = db.get(`jobCooldown_${userId}`) || 0;
        const currentTime = Date.now();

        // Check if the user is still on cooldown
        if (currentTime - lastWorked < cooldown) {
            const timeLeft = Math.ceil((cooldown - (currentTime - lastWorked)) / 60000); // Time left in minutes
            return interaction.followUp(`You need to wait ${timeLeft} more minutes before working again.`);
        }

        // Update the cooldown timer
        db.set(`jobCooldown_${userId}`, currentTime);

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
        }

        // Add earnings to the user's wallet
        db.add(`coins_${userId}`, earnings);

        // Fetch the updated balance
        const newBalance = db.get(`coins_${userId}`);

        const embed = new MessageEmbed()
            .setTitle('Work Successful')
            .setDescription(`You worked as a ${job} and earned ${earnings} coins!`)
            .addField('New Wallet Balance', newBalance.toString(), true)
            .setColor('#37115a');

        await interaction.followUp({ embeds: [embed] });
    }
};
