const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('random-anime-quote')
        .setDescription('Displays a random anime quote using AnimeChan API.'),
    async execute(interaction) {
        const fetch = await import('node-fetch');
        const url = `https://animechan.vercel.app/api/random`;
        const response = await fetch.default(url);
        const data = await response.json();

        let randomColor = Math.floor(Math.random() * 16777215);

        const embed = new EmbedBuilder()
            .setColor(randomColor)
            .setTitle(data.anime)
            .setDescription(data.quote)
            .setFooter({ text: `Character: ${data.character}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

    }
};