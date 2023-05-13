const { SlashCommandBuilder } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('random-joke')
        .setDescription('Provides a random joke.'),
    async execute(interaction) {
        // get random joke
        const joke = await getJoke();

        // use try and catch method for error handling and replying to the user
        try {
            // reply to the user with the jok
            await interaction.reply(`${joke.setup}\n||${joke.punchline}||`);
        } catch (error) {
            // if there is an error, reply to the user with the error message
            await interaction.reply({
                content: `Error: ${error.message}`,
                ephemeral: true
            });
        }
    },
};

async function getJoke() {
    const fetch = await import('node-fetch');
    const response = await fetch.default('https://official-joke-api.appspot.com/random_joke');
    const joke = await response.json();
    return joke;
}
