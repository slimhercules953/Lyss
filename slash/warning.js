const { CommandInteraction, Client, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const warningFilePath = './warning.json';

// Helper function to read warning data
function getWarningData() {
    if (!fs.existsSync(warningFilePath)) {
        fs.writeFileSync(warningFilePath, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(warningFilePath, 'utf8'));
}

// Helper function to save warning data
function saveWarningData(data) {
    fs.writeFileSync(warningFilePath, JSON.stringify(data, null, 4));
}

module.exports = {
    name: 'warn',
    description: 'Warn a user and log the warning.',
    options: [
        {
            name: 'target',
            description: 'The user you want to warn.',
            type: 6, // User type
            required: true,
        },
        {
            name: 'reason',
            description: 'Reason for the warning.',
            type: 3, // String type
            required: false,
        }
    ],
    run: async (client, interaction) => {
        const targetUser = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const warner = interaction.user;
        const userId = targetUser.id;

        // Read the warning data
        const warningData = getWarningData();
        if (!warningData[userId]) {
            warningData[userId] = [];
        }

        // Add a new warning
        const warning = {
            warnedBy: warner.username,
            reason: reason,
            timestamp: Date.now()
        };
        warningData[userId].push(warning);

        // Save the updated warning data
        saveWarningData(warningData);

        // Respond with an embed
        const embed = new EmbedBuilder()
            .setTitle('User Warned')
            .setDescription(`**${targetUser.username}** has been warned.`)
            .addFields(
                { name: 'Warned By', value: warner.username, inline: true },
                { name: 'Reason', value: reason, inline: true },
                { name: 'Total Warnings', value: `${warningData[userId].length}`, inline: true }
            )
            .setColor('#37115a')
            .setTimestamp();

        await interaction.followUp({ embeds: [embed] });
    }
};
