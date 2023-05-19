const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anime')
        .setDescription('Search for an anime using Jikan API.')
        .addStringOption((option) =>
            option
                .setName('search')
                .setDescription('Enter the name of the anime you want to search for')
                .setRequired(true)
        ),
    async execute(interaction) {
        const fetch = await import('node-fetch');
        const query = interaction.options.getString('search');
        const url = `https://api.jikan.moe/v4/anime?limit=1&q=${encodeURIComponent(query)}`;
        const response = await fetch.default(url);
        const animeData = await response.json();

        if (!animeData || animeData.data.length === 0) {
            return interaction.reply({
                content: `No results found for "${query}"`,
            });
        }

        const anime = animeData.data[0];
        const titles = anime.titles;
        const images = anime.images;

        console.log("Anime titles:", titles);
        console.log("Themes: ", anime.themes, anime.demographics, anime.genres);

        const embed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
            .setTitle(titles[0]?.title)
            .setURL(anime.url)
            .setDescription(anime.synopsis)
            .setThumbnail(images.jpg.large_image_url)
            .addFields(
                { name: 'Type', value: anime.type ? anime.type : 'Not available', inline: true },
                { name: 'Episodes', value: anime.episodes ? anime.episodes.toString() : 'Not available', inline: true },
                { name: 'Score', value: anime.score ? anime.score.toString() : 'Not available', inline: true },
                { name: 'Rating', value: anime.rating ? anime.rating : 'Not available', inline: true },
                { name: 'Demographic', value: anime.demographics[0]?.name || anime.themes[0]?.name || 'Not Available', inline: true },
                { name: 'Genres', value: anime.genres.map((genre) => genre.name).join(', ') ? anime.genres.map((genre) => genre.name).join(', ') : 'Not Available', inline: true }
            );

        // console.log("Anime title eng:", titles[0]?.title);

        await interaction.reply({
            content: 'Here is the result of your search:',
            embeds: [embed]
        });
    }
};
