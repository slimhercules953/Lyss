const client = require("../index");
const fs = require('fs');

const playMessages = [
    'Your pet is super excited!',
    'You and your pet had a lot of fun!',
    'Your pet seems a bit tired after playing.',
    'What a great time playing with your pet!'
];

// Path to the JSON file
const petFilePath = './pet.json';

// Helper function to read pets data
function getPetsData() {
    if (!fs.existsSync(petFilePath)) {
        fs.writeFileSync(petFilePath, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(petFilePath, 'utf8'));
}

// Helper function to save pets data
function savePetsData(data) {
    fs.writeFileSync(petFilePath, JSON.stringify(data, null, 4));
}

client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
        await interaction.deferReply({ ephemeral: false }).catch(() => {});

        const cmd = client.slashCommands.get(interaction.commandName);
        if (!cmd)
            return interaction.followUp({ content: "An error has occured " });

        const args = [];

        for (let option of interaction.options.data) {
            if (option.type === "SUB_COMMAND") {
                if (option.name) args.push(option.name);
                option.options?.forEach((x) => {
                    if (x.value) args.push(x.value);
                });
            } else if (option.value) args.push(option.value);
        }
        //interaction.member = interaction.guild.members.cache.get(interaction.user.id) || interaction.member.id;

        cmd.run(client, interaction, args);
    }

    if (interaction.isButton()) {

        const userId = interaction.user.id;
        const petsData = getPetsData();
        let pet = petsData[userId];

        // Buying pets
        if (interaction.customId === 'buy_dog') {
            petsData[userId] = { name: 'Dog', happiness: 50, hunger: 50 };
            savePetsData(petsData);
            return interaction.reply({ content: 'You bought a Dog! 🐶', ephemeral: true });
        } else if (interaction.customId === 'buy_cat') {
            petsData[userId] = { name: 'Cat', happiness: 50, hunger: 50 };
            savePetsData(petsData);
            return interaction.reply({ content: 'You bought a Cat! 🐱', ephemeral: true });
        } else if (interaction.customId === 'buy_bird') {
            petsData[userId] = { name: 'Bird', happiness: 50, hunger: 50 };
            savePetsData(petsData);
            return interaction.reply({ content: 'You bought a Bird! 🐦', ephemeral: true });
        }

        if (!pet) {
            return interaction.reply({ content: 'You don\'t have a pet yet! Use /pet buy to purchase one.', ephemeral: true });
        }

        // Interacting with pets
        if (interaction.customId === 'pet_pet') {
            // Petting increases happiness
            pet.happiness = Math.min(pet.happiness + 10, 100);
            petsData[userId] = pet;
            savePetsData(petsData);
            return interaction.reply({ content: `You pet your ${pet.name}. Happiness: ${pet.happiness}/100 😊`, ephemeral: true });
        } else if (interaction.customId === 'pet_play') {
            // Playing increases happiness but also uses hunger
            const randomMessage = playMessages[Math.floor(Math.random() * playMessages.length)];
            pet.happiness = Math.min(pet.happiness + 15, 100);
            pet.hunger = Math.max(pet.hunger - 10, 0);
            petsData[userId] = pet;
            savePetsData(petsData);
            return interaction.reply({ content: `You played with your ${pet.name}. ${randomMessage} Happiness: ${pet.happiness}/100, Hunger: ${pet.hunger}/100 🎉`, ephemeral: true });
        } else if (interaction.customId === 'pet_feed') {
            // Feeding decreases hunger
            pet.hunger = Math.min(pet.hunger + 20, 100);
            petsData[userId] = pet;
            savePetsData(petsData);
            return interaction.reply({ content: `You fed your ${pet.name}. Hunger: ${pet.hunger}/100 🍖`, ephemeral: true });
        }
    }
    // // Context Menu Handling
    // if (interaction.isContextMenu()) {
    //     await interaction.deferReply({ ephemeral: false });
    //     const command = client.slashCommands.get(interaction.commandName);
    //     if (command) command.run(client, interaction);
    // }
});