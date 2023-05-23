const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anime-quote')
        .setDescription('Displays a random anime quote.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('random')
                .setDescription('Displays a random anime quote.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('anime')
                .setDescription('Displays a random anime quote from an anime.')
                .addStringOption(option => option.setName('anime').setDescription('Select the anime.')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('character')
                .setDescription('Displays a random anime quote from a character.')
                .addStringOption(option => option.setName('character').setDescription('Select the character.')))
    // .addSubcommand(subcommand =>
    //     subcommand
    //         .setName('get-available-anime')
    //         .setDescription('Displays a list of available anime in the API.')),
    ,

    async execute(interaction) {
        const fetch = await import('node-fetch');
        const randomColor = Math.floor(Math.random() * 16777215);

        const subcommand = interaction.options.getSubcommand();


        switch (subcommand) {
            case 'random':
                const urlRandom = 'https://animechan.vercel.app/api/random';
                const responseRandom = await fetch.default(urlRandom);
                const dataRandom = await responseRandom.json();

                const embedRandom = new EmbedBuilder()
                    .setColor(randomColor)
                    .setTitle(dataRandom.anime)
                    .setDescription(dataRandom.quote)
                    .setFooter({ text: `Character: ${dataRandom.character}` })
                    .setTimestamp();

                await interaction.reply({ embeds: [embedRandom] });
                break;
            case 'anime':
                const queryAnime = interaction.options.getString('anime');
                const urlAnime = `https://animechan.vercel.app/api/random/anime?title=${encodeURIComponent(queryAnime)}`;
                const responseAnime = await fetch.default(urlAnime);
                const dataAnime = await responseAnime.json();

                const embedAnime = new EmbedBuilder()
                    .setColor(randomColor)
                    .setTitle(dataAnime.anime)
                    .setDescription(dataAnime.quote)
                    .setFooter({ text: `Character: ${dataAnime.character}` })
                    .setTimestamp();

                await interaction.reply({ embeds: [embedAnime] });
                break;
            case 'character':
                const queryCharacter = interaction.options.getString('character');
                const urlCharacter = `https://animechan.vercel.app/api/random/character?name=${encodeURIComponent(queryCharacter)}`;
                const responseCharacter = await fetch.default(urlCharacter);
                const dataCharacter = await responseCharacter.json();

                const embedCharacter = new EmbedBuilder()
                    .setColor(randomColor)
                    .setTitle(dataCharacter.anime)
                    .setDescription(dataCharacter.quote)
                    .setFooter({ text: `Character: ${dataCharacter.character}` })
                    .setTimestamp();

                await interaction.reply({ embeds: [embedCharacter] });
                break;
            // case 'get-available-anime':
            //     const urlAvailableAnime = 'https://animechan.vercel.app/api/available/anime';
            //     const responseAvailableAnime = await fetch.default(urlAvailableAnime);
            //     const dataAvailableAnime = await responseAvailableAnime.json();

            //     const chunkSize = 100; // Number of anime per embed
            //     const chunks = []; // Array to store the chunks

            //     // Split the available anime into chunks
            //     for (let i = 0; i < dataAvailableAnime.length; i += chunkSize) {
            //       const chunk = dataAvailableAnime.slice(i, i + chunkSize);
            //       chunks.push(chunk);
            //     }

            //     // Send multiple embeds for each chunk
            //     for (let i = 0; i < chunks.length; i++) {
            //       const chunk = chunks[i];
            //       const embedAvailableAnime = new EmbedBuilder()
            //         .setColor(randomColor)
            //         .setTitle('Available Anime')
            //         .setDescription(chunk.join('\n'));

            //       if (i === 0) {
            //         await interaction.reply({ embeds: [embedAvailableAnime] });
            //       } else {
            //         await interaction.followUp({ embeds: [embedAvailableAnime] });
            //       }
            //     }
            // break;


        }

    }
}