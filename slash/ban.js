const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ban',
    description: 'Ban a member from the server.',
    options: [
        {
            name: 'target',
            description: 'The member to ban.',
            type: 6, // USER type
            required: true,
        },
        {
            name: 'reason',
            description: 'Reason for the ban.',
            type: 3, // STRING type
            required: false,
        },
    ],
    run: async (client, interaction) => {
        const targetUser = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided.';
        const guildMember = interaction.guild.members.cache.get(targetUser.id);

        // Check if the user is trying to ban themselves or the bot
        if (targetUser.id === interaction.user.id) {
            return interaction.followUp({ content: 'You cannot ban yourself!', ephemeral: true });
        }
        if (targetUser.id === client.user.id) {
            return interaction.followUp({ content: 'You cannot ban the bot!', ephemeral: true });
        }

        // Check if the target is a valid member of the guild
        if (!guildMember) {
            return interaction.followUp({ content: 'The specified user is not in this server.', ephemeral: true });
        }

        // Check if the bot has the required permissions
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.followUp({ content: 'I do not have permission to ban members.', ephemeral: true });
        }

        // Attempt to ban the member
        try {
            await guildMember.ban({ reason });
            const embed = new EmbedBuilder()
                .setTitle('Member Banned')
                .setDescription(`${targetUser.tag} has been banned.`)
                .addFields(
                    { name: 'Reason', value: reason },
                    { name: 'Banned By', value: interaction.user.tag }
                )
                .setColor('#37115a')
                .setTimestamp();

            return interaction.followUp({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            return interaction.followUp({ content: `Failed to ban ${targetUser.tag}.`, ephemeral: true });
        }
    },
};
