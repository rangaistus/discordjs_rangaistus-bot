const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("love-meter")
    .setDescription("Measures the love between two users")
    .addUserOption((option) =>
      option
        .setName("user1")
        .setDescription("Select the first user.")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("user2")
        .setDescription("Select the second user.")
        .setRequired(true)
    ),

  async execute(interaction) {
    const user1 = interaction.options.getUser("user1");
    const user2 = interaction.options.getUser("user2");

    const love = Math.floor(Math.random() * 101);

    const loveBarFull = "█".repeat(10);

    const loveBar = "█".repeat(Math.floor(love / 10));
    const emptyBar = "░".repeat(10 - Math.floor(love / 10));

    if (user1.bot || user2.bot) {
      await interaction.reply("Bots cannot fall in love.");
      return;
    }

    await interaction.reply(
      `:sparkling_heart:  ${user1.toString()} and ${user2.toString()}'s love meter: ${love}%\n\n[${loveBar}${emptyBar}]`
    );

  },
};
