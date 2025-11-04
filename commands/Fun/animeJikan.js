const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');

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
        // fetch top 5 results
        const searchUrl = `https://api.jikan.moe/v4/anime?limit=5&q=${encodeURIComponent(query)}`;
        const response = await fetch.default(searchUrl);
        const animeData = await response.json();

        if (!animeData || !animeData.data || animeData.data.length === 0) {
            return interaction.reply({ content: `No results found for "${query}"`, ephemeral: true });
        }

        const results = animeData.data;

        // If only one result, show it directly
        if (results.length === 1) {
            const anime = results[0];
            const embed = buildAnimeEmbed(interaction, anime);
            return interaction.reply({ content: 'Here is the result of your search:', embeds: [embed] });
        }

        // Build select menu options
        const options = results.map((a) => ({
            label: (a.titles[0]?.title || a.title).slice(0, 100),
            description: (a.synopsis ? a.synopsis.substring(0, 80) : 'No synopsis').replace(/\n/g, ' '),
            value: String(a.mal_id),
        }));

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select_anime')
                .setPlaceholder('Select the anime you meant')
                .addOptions(options)
        );

        await interaction.reply({ content: `Multiple results found for "${query}" — please choose:`, components: [row] });

        // Wait for the user to pick one
        try {
            const reply = await interaction.fetchReply();
            const collected = await reply.awaitMessageComponent({ filter: (i) => i.user.id === interaction.user.id, componentType: ComponentType.StringSelect, time: 60_000 });
            const chosenId = collected.values[0];
            await collected.deferUpdate();

            // fetch details for chosen anime
            const detailRes = await fetch.default(`https://api.jikan.moe/v4/anime/${encodeURIComponent(chosenId)}`);
            const detailData = await detailRes.json();
            const anime = detailData.data;
            const embed = buildAnimeEmbed(interaction, anime);

            await interaction.editReply({ content: 'Here is the anime you selected:', embeds: [embed], components: [] });
        } catch (err) {
            // collector timeout or error
            await interaction.editReply({ content: 'No selection made in time or an error occurred.', components: [] }).catch(() => { });
        }

        // helper
        function buildAnimeEmbed(interaction, anime) {
            const titles = anime.titles || [];
            const images = anime.images || anime.images || (anime.image_url ? { jpg: { large_image_url: anime.image_url } } : {});
            const genres = (anime.genres || []).map((g) => g.name).join(', ') || 'Not Available';

            return new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                .setTitle(titles[0]?.title || anime.title)
                .setURL(anime.url)
                .setDescription(anime.synopsis || 'No synopsis available')
                .setThumbnail(images.jpg?.large_image_url || images.jpg?.image_url || null)
                .addFields(
                    { name: 'Type', value: anime.type ? String(anime.type) : 'Not available', inline: true },
                    { name: 'Episodes', value: anime.episodes ? String(anime.episodes) : 'Not available', inline: true },
                    { name: 'Score', value: anime.score ? String(anime.score) : 'Not available', inline: true },
                    { name: 'Rating', value: anime.rating ? String(anime.rating) : 'Not available', inline: true },
                    { name: 'Demographic', value: (anime.demographics?.[0]?.name) || (anime.themes?.[0]?.name) || 'Not Available', inline: true },
                    { name: 'Genres', value: genres, inline: true }
                );
        }
    }
};
