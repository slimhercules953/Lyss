const { Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const fs = require('fs');
const path = './pet.json'; // Path to the JSON file storing pet data

module.exports = {
    name: 'pet',
    description: 'Interact with your pet or buy a new one.',
    options: [
        {
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
        }
    ],
    run: async (client, interaction) => {
        const action = interaction.options.getString('action');
        const userId = interaction.user.id;

        // Read pet data from the JSON file
        let petsData = readPetsData();

        // Ensure the user is in the pets data
        if (!petsData[userId]) {
            petsData[userId] = {};
            savePetsData(petsData);
        }

        // Retrieve the user's pet data
        let pet = petsData[userId];

        if (action === 'buy') {
            if (pet.name) {
                return interaction.followUp({
                    content: `You already have a pet (${pet.name}). Use /pet to interact with it.`,
                    ephemeral: true
                });
            }

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('buy_dog')
                    .setLabel('Buy Dog')
                    .setStyle('Primary'),
                new ButtonBuilder()
                    .setCustomId('buy_cat')
                    .setLabel('Buy Cat')
                    .setStyle('Primary'),
                new ButtonBuilder()
                    .setCustomId('buy_bird')
                    .setLabel('Buy Bird')
                    .setStyle('Primary')
            );

            return interaction.followUp({ content: 'Select a pet to buy:', components: [row], ephemeral: true });
        } else {
            if (!pet.name) {
                return interaction.followUp({
                    content: "You don't have a pet yet! Use /pet buy to purchase one.",
                    ephemeral: true
                });
            }

            const embed = createPetEmbed(interaction, pet);
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('pet_pet')
                    .setLabel('Pet')
                    .setStyle('Primary'),
                new ButtonBuilder()
                    .setCustomId('pet_play')
                    .setLabel('Play')
                    .setStyle('Success'),
                new ButtonBuilder()
                    .setCustomId('pet_feed')
                    .setLabel('Feed')
                    .setStyle('Secondary')
            );

            return interaction.followUp({ embeds: [embed], components: [row], ephemeral: true });
        }
    }
};

// Function to create an embed for the pet
function createPetEmbed(interaction, pet) {
    return new EmbedBuilder()
        .setTitle(`${interaction.user.username}'s Pet: ${pet.name}`)
        .setColor('#37115a')
        .setDescription(`Here are the current stats for your pet ${pet.name}:`)
        .addFields(
            { name: 'Happiness', value: `${pet.happiness || 50}/100`, inline: true },
            { name: 'Hunger', value: `${pet.hunger || 50}/100`, inline: true }
        )
        .setFooter({ text: 'Interact with your pet using the buttons below!' });
}

// Function to read the pets data from the JSON file
function readPetsData() {
    if (fs.existsSync(path)) {
        return JSON.parse(fs.readFileSync(path, 'utf8'));
    } else {
        return {};
    }
}

// Function to save pet data to the JSON file
function savePetsData(petsData) {
    fs.writeFileSync(path, JSON.stringify(petsData, null, 2), 'utf8');
}

// Button interaction handler in your bot's event listener
module.exports.buttonHandler = async (interaction) => {
    if (!interaction.isButton()) return;

    const userId = interaction.user.id;
    let petsData = readPetsData();

    if (!petsData[userId] || !petsData[userId].name) {
        return interaction.followUp({
            content: "You don't have a pet yet! Use /pet buy to purchase one.",
            ephemeral: true
        });
    }

    const pet = petsData[userId];
    let response;

    // Handle button interactions
    switch (interaction.customId) {
        case 'pet_pet':
            pet.happiness = Math.min((pet.happiness || 50) + 10, 100);
            response = `You petted ${pet.name}. Their happiness increased to ${pet.happiness}.`;
            break;
        case 'pet_play':
            pet.happiness = Math.min((pet.happiness || 50) + 5, 100);
            pet.hunger = Math.min((pet.hunger || 50) + 5, 100);
            response = `You played with ${pet.name}. Their happiness is ${pet.happiness} but they're getting hungrier!`;
            break;
        case 'pet_feed':
            pet.hunger = Math.max((pet.hunger || 50) - 15, 0);
            response = `You fed ${pet.name}. Their hunger decreased to ${pet.hunger}.`;
            break;
        default:
            return;
    }

    savePetsData(petsData);

    // Update the embed with new stats
    const updatedEmbed = createPetEmbed(interaction, pet);

    return interaction.update({
        embeds: [updatedEmbed],
        content: response,
        components: interaction.message.components
    });
};
