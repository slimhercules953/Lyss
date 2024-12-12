const { CommandInteraction, Client, MessageEmbed } = require('discord.js');
// const db = require('quick.db');

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

        // Check if the user already has a job
        const existingJob = db.get(`job_${userId}`);
        if (existingJob) {
            return interaction.followUp(`You already have a job as a ${existingJob}. Use /work to earn money.`);
        }

        // Save the selected job to the database
        db.set(`job_${userId}`, job);
        db.set(`jobCooldown_${userId}`, 0); // Initialize cooldown

        const embed = new MessageEmbed()
            .setTitle('Job Selected')
            .setDescription(`You have chosen to be a ${job}. Use /work every 60 minutes to earn money.`)
            .setColor('#37115a');

        await interaction.followUp({ embeds: [embed] });
    }
};
