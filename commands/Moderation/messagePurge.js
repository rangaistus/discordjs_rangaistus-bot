const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Bulk deletes a specified number of messages.")
    .addStringOption((option) =>
      option
        .setName("amount")
        .setDescription("How much you want to delete")
        .setRequired(true)
    ),

  async execute(interaction) {
    const randomColor = Math.floor(Math.random() * 16777215);
    const count = interaction.options.getString("amount");

    if (!interaction.member.permissions.has("MANAGE_MESSAGES"))
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(randomColor)
            .setDescription("You do not have permission to use this command.")
            .build(),
        ],
      });

    await interaction.deferReply({ ephemeral: true });
    if (count > 200 || count < 1)
      return interaction.editReply({
        embeds: [
          {
            color: randomColor,
            description: "You can only delete between 1 and 200 messages.",
          },
        ],
      });
    await interaction.channel.bulkDelete(count);
    await interaction.editReply({
      embeds: [
        {
          color: randomColor,
          description: `Deleted ${count} messages.`,
        },
      ],
    });
  },
};
