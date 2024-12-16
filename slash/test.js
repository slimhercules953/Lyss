const { CommandInteraction, Client, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = './balances.json'; // Path to the balances JSON file

module.exports = {
    name: 'test',
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

        // Fetch the balances data from the JSON file
        let balancesData = readBalances();

        // Ensure data exists for the creditor and debtor
        if (!balancesData[creditorId]) {
            balancesData[creditorId] = {};
        }
        if (!balancesData[creditorId][debtorId]) {
            balancesData[creditorId][debtorId] = 0;
        }

        let existingDebt = balancesData[creditorId][debtorId];

        if (debtAmount !== null) {
            // Update the debt amount
            const newDebtAmount = existingDebt + debtAmount;
            balancesData[creditorId][debtorId] = newDebtAmount;
            saveBalances(balancesData);

            // Create an embed to confirm the update
            const embed = new EmbedBuilder()
                .setTitle('Debt Updated')
                .setDescription(`${targetUser.username} now owes you ${newDebtAmount}.`)
                .setColor('#37115a');

            return interaction.followUp({ embeds: [embed] });
        } else {
            // Display the current debt
            const embed = new EmbedBuilder()
                .setTitle('Debt Information')
                .setDescription(`${targetUser.username} owes you ${existingDebt}.`)
                .setColor('#37115a');

            return interaction.followUp({ embeds: [embed] });
        }
    }
};

// Function to read balances data from the JSON file
function readBalances() {
    if (fs.existsSync(path)) {
        return JSON.parse(fs.readFileSync(path, 'utf8'));
    } else {
        return {}; // Initialize to an empty object if the file doesn't exist
    }
}

// Function to save balances data to the JSON file
function saveBalances(data) {
    fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
}
