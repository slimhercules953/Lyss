const { CommandInteraction, Client, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'kick',
    description: 'Kick a user from the server with a custom message.',
    options: [
        {
            name: 'target',
            description: 'The user you want to kick.',
            type: 6,
            required: true,
        },
        {
            name: 'reason',
            description: 'The reason for kicking the user.',
            type: 3,
            required: false,
        }
    ],
    run: async (client, interaction) => {
        const targetUser = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = interaction.guild.members.cache.get(targetUser.id);

        if (!interaction.member.permissions.has('KICK_MEMBERS')) {
            return interaction.followUp({ content: 'You do not have permission to kick members.', ephemeral: true });
        }

        if (!member) {
            return interaction.followUp({ content: 'The specified user is not in this server.', ephemeral: true });
        }

        if (!member.kickable) {
            return interaction.followUp({ content: 'I cannot kick this user. They might have higher permissions than me.', ephemeral: true });
        }

        // Attempt to kick the user
        try {
            const kickMessage = `You have been kicked from ${interaction.guild.name}.\nReason: ${reason}\nModerator taking action: ${interaction.user.tag}`;
            await targetUser.send(kickMessage).catch(() => {
                console.log('Unable to send DM to the user.');
            });

            await member.kick(reason);

            const embed = new EmbedBuilder()
                .setTitle('User Kicked')
                .setDescription(`${targetUser.tag} has been kicked from the server.`)
                .addField('Reason', reason)
                .setColor('#37115a')
                .setTimestamp();

            return interaction.followUp({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            return interaction.followUp({ content: 'There was an error while trying to kick the user.', ephemeral: true });
        }
    }
};
