const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'mute',
    description: 'Mute a user in the server.',
    options: [
        {
            name: 'target',
            description: 'The user you want to mute.',
            type: 6, // USER type
            required: true,
        },
        {
            name: 'duration',
            description: 'Duration of the mute (e.g., 10m, 2h).',
            type: 3, // STRING type
            required: true,
        },
        {
            name: 'reason',
            description: 'Reason for muting the user.',
            type: 3, // STRING type
            required: false,
        }
    ],
    run: async (client, interaction) => {
        const targetUser = interaction.options.getUser('target');
        const durationInput = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const guild = interaction.guild;

        // Check for permissions
        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.followUp({ content: 'You do not have permission to mute members.', ephemeral: true });
        }

        if (!guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.followUp({ content: 'I do not have permission to mute members.', ephemeral: true });
        }

        // Fetch the target member
        const member = guild.members.cache.get(targetUser.id);
        if (!member) {
            return interaction.followUp({ content: 'User not found in the server.', ephemeral: true });
        }

        // Check if the user is manageable
        if (!member.moderatable) {
            return interaction.followUp({ content: 'I cannot mute this user. They may have higher permissions or roles.', ephemeral: true });
        }

        // Parse duration
        const durationMatch = durationInput.match(/^(\d+)([mh])$/);
        if (!durationMatch) {
            return interaction.followUp({ content: 'Invalid duration format. Use numbers followed by "m" for minutes or "h" for hours (e.g., 10m, 2h).', ephemeral: true });
        }

        const durationValue = parseInt(durationMatch[1], 10);
        const durationUnit = durationMatch[2];
        const durationMs = durationUnit === 'm' ? durationValue * 60 * 1000 : durationValue * 60 * 60 * 1000;

        try {
            // Apply the mute (timeout)
            await member.timeout(durationMs, reason);

            // Create and send an embed
            const embed = new EmbedBuilder()
                .setTitle('User Muted')
                .setDescription(`${targetUser.username} has been muted.`)
                .addFields(
                    { name: 'Reason', value: reason, inline: true },
                    { name: 'Duration', value: durationInput, inline: true }
                )
                .setColor('#37115a')
                .setTimestamp();

            return interaction.followUp({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            return interaction.followUp({ content: 'An error occurred while trying to mute the user.', ephemeral: true });
        }
    },
};