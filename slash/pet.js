const { CommandInteraction, Client, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
// const db = require('quick.db'); // Using quick.db to store pet data

module.exports = {
    name: 'pet',
    description: 'Interact with your pet or buy a new one.',
    options: [{
        name: 'action',
        description: 'Select an action: buy, pet, play, feed.',
        type: 3,
        required: true,
        choices: [
            { name: 'buy', value: 'buy' },
            { name: 'pet', value: 'pet' },
            { name: 'play', value: 'play' },
            { name: 'feed', value: 'feed' }
        ]
    }],
    run: async (client, interaction) => {
        const action = interaction.options.getString('action');
        const userId = interaction.user.id;
        
        // Fetch the user's pet data
        let pet = db.get(`pet_${userId}`);

        // Define pet options for purchasing
        const petOptions = ['Dog', 'Cat', 'Bird'];

        if (action === 'buy') {
            // If user doesn't have a pet
            if (pet) {
                return interaction.followUp(`You already have a pet (${pet.name}). Use /pet to interact with it.`);
            }

            // Pet buying buttons
            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('buy_dog')
                        .setLabel('Buy Dog')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('buy_cat')
                        .setLabel('Buy Cat')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('buy_bird')
                        .setLabel('Buy Bird')
                        .setStyle('PRIMARY')
                );

            return interaction.followUp({ content: 'Select a pet to buy:', components: [row] });

        } else {
            if (!pet) {
                return interaction.followUp('You don\'t have a pet yet! Use /pet buy to purchase one.');
            }

            // Pet interaction buttons
            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('pet_pet')
                        .setLabel('Pet')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('pet_play')
                        .setLabel('Play')
                        .setStyle('SUCCESS'),
                    new MessageButton()
                        .setCustomId('pet_feed')
                        .setLabel('Feed')
                        .setStyle('SECONDARY')
                );

            return interaction.followUp({ content: `Interact with your pet ${pet.name}:`, components: [row] });
        }
    }
};
