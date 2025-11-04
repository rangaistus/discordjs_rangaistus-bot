const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  async execute(interaction) {
    // Reply with bot's latency
    await interaction.reply(`Pong! ${interaction.client.ws.ping}ms`);
  },
};
