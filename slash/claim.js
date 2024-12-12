const { CommandInteraction, Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
    name: 'claim',
    description: 'Attempt to claim another user with their approval.',
    options: [
        {
            name: 'target',
            description: 'The user you want to claim.',
            type: 6,
            required: true,
        }
    ],

    run: async (client, interaction) => {
        const targetUser = interaction.options.getUser('target');
        const claimerId = interaction.user.id;

        if (targetUser.id === claimerId) {
            return interaction.followUp({ content: 'You cannot claim yourself!', ephemeral: true });
        }

        // Create the claim embed
        const claimEmbed = new EmbedBuilder()
            .setTitle('Claim Request')
            .setDescription(`${targetUser.username}, ${interaction.user.username} wants to claim you!`)
            .setColor('#37115a')
            .setTimestamp();

        // Create the claim button row
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('claim_accept')
                .setLabel('Accept Claim')
                .setStyle('Success')
                .setEmoji('✅'),
            new ButtonBuilder()
                .setCustomId('claim_decline')
                .setLabel('Decline Claim')
                .setStyle('Danger')
                .setEmoji('❌')
        );

        // Send the embed with buttons
        const claimMessage = await interaction.followUp({ embeds: [claimEmbed], components: [row] });

        // Button interaction collector for 5 minutes
        const filter = (i) => i.user.id === targetUser.id;
        const collector = claimMessage.createMessageComponentCollector({ filter, time: 300000 });

        collector.on('collect', async (buttonInteraction) => {
            try {
                if (buttonInteraction.customId === 'claim_accept') {
                    // Handle claim acceptance
                    const acceptedEmbed = new EmbedBuilder()
                        .setTitle('Claim Accepted')
                        .setDescription(`${targetUser.username} accepted the claim from ${interaction.user.username}!`)
                        .setColor('#00FF00')
                        .setTimestamp();

                    await buttonInteraction.update({ embeds: [acceptedEmbed], components: [] });
                    collector.stop();

                } else if (buttonInteraction.customId === 'claim_decline') {
                    // Handle claim decline
                    const declinedEmbed = new EmbedBuilder()
                        .setTitle('Claim Declined')
                        .setDescription(`${targetUser.username} declined the claim request from ${interaction.user.username}.`)
                        .setColor('#FF0000')
                        .setTimestamp();

                    await buttonInteraction.update({ embeds: [declinedEmbed], components: [] });
                    collector.stop();
                }
            } catch (error) {
                console.error('Error handling button interaction:', error);
            }
        });

        collector.on('end', async (collected, reason) => {
            // If the collector ended due to timeout, update the message to reflect that.
            if (reason === 'time' && claimMessage.editable) {
                const timedOutEmbed = new EmbedBuilder()
                    .setTitle('Claim Expired')
                    .setDescription(`${targetUser.username} did not respond in time.`)
                    .setColor('#808080')
                    .setTimestamp();

                await claimMessage.edit({ embeds: [timedOutEmbed], components: [] });
            }
        });
    }
};
