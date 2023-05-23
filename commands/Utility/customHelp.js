const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays all commands with description.'),
    async execute(interaction) {
        const { commands } = require('../../index.js');

        let randomColor = Math.floor(Math.random() * 16777215);

        const embed = new EmbedBuilder()
            .setColor(randomColor)
            .setTitle('Available Commands')
            .setDescription('Here is a list of all commands:')
            .setTimestamp();

        const folders = new Set();

        for (const command of commands) {
            const split = command.filePath.split('\\');
            const folderName = split[split.length - 2];
            folders.add(folderName);
        }

        for (const folderName of folders) {
            const folder = fs.readdirSync(`./commands/${folderName}`).filter(file => file.endsWith('.js'));

            const commandsInSection = [];

            for (const file of folder) {
                const commandFile = require(`../${folderName}/${file}`);
                if (!commandFile.data) {
                    if(commandFile.name === "eval") continue;
                    console.error(`Command ${file} is missing the 'data' property.`);
                    continue;
                }

                commandsInSection.push({
                    name: commandFile.data.name,
                    description: commandFile.data.description
                });
            }

            embed.addFields({ name: `${folderName}:`, value: commandsInSection.map(cmd => `${cmd.name} - ${cmd.description}`).join('\n') });
        }

        await interaction.reply({
            content: 'Here is a list of all commands:',
            ephemeral: true,
            embeds: [embed]
        });
    }
}
