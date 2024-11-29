const { CommandInteraction, Client, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'roll',
    description: 'Roll a custom dice by specifying the minimum and maximum values!',
    options: [
        {
            name: 'minimum',
            description: 'The minimum number of the roll.',
            type: '4',
            required: true,
        },
        {
            name: 'maximum',
            description: 'The maximum number of the roll.',
            type: '4',
            required: true,
        },
    ],
    run: async (client, interaction) => {
        const min = interaction.options.getInteger('minimum');
        const max = interaction.options.getInteger('maximum');

        if (min >= max) {
            return interaction.followUp({
                content: 'The minimum value must be less than the maximum value!',
                ephemeral: true,
            });
        }

        // Generate a random number between min and max (inclusive)
        const rolledNumber = Math.floor(Math.random() * (max - min + 1)) + min;

        // Create an embed for the result
        const embed = new EmbedBuilder()
            .setTitle('🎲 Custom Dice Roll 🎲')
            .setDescription(
                `${interaction.user.username}, you rolled a number between **${min}** and **${max}**.\nYou got: **${rolledNumber}**! https://www.animatedimages.org/data/media/710/animated-dice-image-0103.gif`
            )
            .setColor('#00FF00')
            .setTimestamp();

        // Respond to the interaction
        interaction.followUp({ embeds: [embed] });
    },
};
