const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'spinthewheel',
    description: 'Spin the wheel....of DOOM',
    options: [
        {
            name: 'entries',
            description: 'Comma-separated list of entries (e.g., name1,name2,name3)',
            type: 3,
            required: true,
        }
    ],
    run: async (client, interaction) => {
        const entriesString = interaction.options.getString('entries');
        const entries = entriesString.split(',').map(entry => entry.trim());

        if (entries.length < 2) {
            return interaction.followUp({
                content: 'Please provide at least two entries for the wheel.',
                ephemeral: true,
            });
        }

        // Spin the wheel and select a random entry
        const randomIndex = Math.floor(Math.random() * entries.length);
        const selectedEntry = entries[randomIndex];

        // Create an embed to show the result
        const embed = new EmbedBuilder()
            .setTitle('🎡 Spin the Wheel!')
            .setDescription(`Entries: ${entries.join(', ')}

**🎉 The wheel landed on: \`${selectedEntry}\`!**`)
            .setColor('#37115a')
            .setFooter({ text: 'Thanks for spinning the wheel!' });

        await interaction.followUp({ embeds: [embed] });
    },
};
