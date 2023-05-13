const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays all commands with description.'),
    async execute(interaction) {

        let randomColor = Math.floor(Math.random() * 16777215);

        const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
        const embed = new EmbedBuilder()
            .setColor(randomColor)
            .setTitle('Available Commands')
            .setDescription('Here is a list of all commands:')
            .setTimestamp();


        for (const file of commandFiles) {
            const command = require(`./${file}`);
            if (!command.data) {
                console.error(`Command ${file} is missing the 'data' property.`);
                continue;
            }
            embed.addFields({ name: command.data.name, value: command.data.description });
        }


        await interaction.reply({
            content: 'Here is a list of all commands:',
            ephemeral: true,
            embeds: [embed]
        });
    }
}