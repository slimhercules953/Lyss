const { CommandInteraction, Client, MessageEmbed } = require('discord.js');
// const db = require('quick.db');

module.exports = {
    name: 'debt',
    description: 'Edit or view the debt that a user owes you.',
    options: [
        {
            name: 'target',
            description: 'The user whose debt you want to edit or view.',
            type: 6,
            required: true,
        },
        {
            name: 'amount',
            description: 'The debt amount to add. Leave blank to just view the current debt.',
            type: 10,
            required: false,
        }
    ],
    run: async (client, interaction) => {
        const targetUser = interaction.options.getUser('target');
        const debtAmount = interaction.options.getNumber('amount');
        const creditorId = interaction.user.id;
        const debtorId = targetUser.id;

        if (creditorId === debtorId) {
            return interaction.followUp({ content: 'You cannot manage debt for yourself!', ephemeral: true });
        }

        // Fetch existing debt, or initialize to 0 if not found
        let existingDebt = db.get(`debt.${creditorId}.${debtorId}`) || 0;

        if (debtAmount !== null) {
            // Add the new debt amount to the existing debt
            const newDebtAmount = existingDebt + debtAmount;
            db.set(`debt.${creditorId}.${debtorId}`, newDebtAmount);

            // Confirm the debt update with an embed
            const embed = new MessageEmbed()
                .setTitle('Debt Updated')
                .setDescription(`${targetUser.username} now owes you ${newDebtAmount}.`)
                .setColor('#FF0000');

            return interaction.followUp({ embeds: [embed] });
        } else {
            // If no amount is specified, display the existing debt
            const embed = new MessageEmbed()
                .setTitle('Debt Information')
                .setDescription(`${targetUser.username} owes you ${existingDebt}.`)
                .setColor('#FF9900');

            return interaction.followUp({ embeds: [embed] });
        }
    }
};
