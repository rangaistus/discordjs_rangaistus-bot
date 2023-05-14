const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');


// async function searchAnime(query) {
//     const fetch = await import('node-fetch');
//     const url = `https://api.jikan.moe/v4/anime?limit=1&q=${encodeURIComponent(query)}`;
//     const response = await fetch.default(url);
//     const data = await response.json();

//     if (!data.data || data.data.length === 0) {
//         throw new Error(`No anime found for query "${query}"`);
//     }

//     return data.data[0]; // Get the top result
// }


module.exports = {
    data: new SlashCommandBuilder()
        .setName('anime')
        .setDescription('Search for an anime on Jikan')
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
        const animeObj = JSON.parse(JSON.stringify(animeData));

        // console.log("Data: ", animeData, "\n", "Response:", response, "\n", "Query: ", query, "\n", "URL: ", url);

        if (!animeObj || !animeObj.data || !animeObj.data[0] || !animeObj.data[0].node || !animeObj.data[0].node.titles) {
            return interaction.reply({
                content: `No results found for "${query}"`,
            });
        }

        const anime = animeObj.data[0];
        const titles = anime.titles;
        const images = anime.images;


        console.log("Title ", titles[2] || titles[1]);

        const embed = new EmbedBuilder()
            .setTitle(anime.titles[2] || anime.titles[1])
            .setDescription(anime.synopsis)
            .setThumbnail(images.jpg.large_image_url)
            .addFields(
                { name: 'Type', value: anime.type, inline: true },
                { name: 'Episodes', value: anime.episodes, inline: true },
                { name: 'Score', value: anime.score, inline: true },
                { name: 'Rating', value: anime.rating, inline: true }
            );


        await interaction.reply({
            content: 'Here is the result of your search:',
            embeds: [embed]
        });
    }
};
