const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("waifu-pic")
    .setDescription(
      "Search for anime waifu pictures on Waifu Pics API. \n [**!WARNING! NSFW/SFW**]"
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("random")
        .setDescription("Displays a random waifu picture.")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("search")
        .setDescription("Select type [SFW/NSFW].")
        .addStringOption((option) =>
          option
            .setName("type")
            .setDescription("Select the type [SFW/NSFW]")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("category")
            .setDescription("Select the category.")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("help").setDescription("Displays the help menu.")
    ),

  async execute(interaction) {
    const sfwCat = [
      "waifu",
      "neko",
      "shinobu",
      "megumin",
      "bully",
      "cuddle",
      "cry",
      "hug",
      "awoo",
      "kiss",
      "lick",
      "pat",
      "smug",
      "bonk",
      "yeet",
      "blush",
      "smile",
      "wave",
      "highfive",
      "handhold",
      "nom",
      "bite",
      "glomp",
      "slap",
      "kill",
      "kick",
      "happy",
      "wink",
      "poke",
      "dance",
      "cringe",
    ];
    const nsfwCat = ["waifu", "neko", "blowjob"];

    const fetch = await import("node-fetch");
    const randomColor = Math.floor(Math.random() * 16777215);

    const { options } = interaction;
    const subcommand = options.getSubcommand();

    switch (subcommand) {
      case "random":
        const isNSFWChannel = interaction.channel.nsfw;
        const selectedType = isNSFWChannel
          ? getRandomType(["sfw", "nsfw"])
          : "sfw";
        const selectedCat =
          selectedType === "sfw"
            ? getRandomCategory(sfwCat)
            : getRandomCategory(nsfwCat);

        const randomUrl = `https://api.waifu.pics/${selectedType}/${selectedCat}`;

        const responseRandom = await fetch.default(randomUrl);
        const dataRandom = await responseRandom.json();

        const embedRandom = new EmbedBuilder()
          .setColor(randomColor)
          .setTitle(
            `Random ${selectedType.toUpperCase()} ${selectedCat.toUpperCase()} Picture`
          )
          .setImage(dataRandom.url)
          .setTimestamp();

        await interaction.reply({
          ephemeral: false,
          embeds: [embedRandom],
        });
        break;

      case "search":
        const selectedTypeOption = options.getString("type");
        const selectedCatOption = options.getString("category");

        if (!interaction.channel.nsfw && selectedTypeOption === "nsfw") {
          return await interaction.reply({
            content: "NSFW option is only available in NSFW channels.",
            ephemeral: true,
          });
        }

        if (!selectedCatOption) {
          return await interaction.reply({
            content:
              "You have to choose a category to be able to get an image.",
            ephemeral: true,
          });
        }

        if (!selectedTypeOption) {
          return await interaction.reply({
            content: "You have to choose a type to be able to get an image.",
            ephemeral: true,
          });
        }

        if (selectedCatOption === "trap") {
          return await interaction.reply({
            content: "The trap category is not available.",
            ephemeral: true,
          });
        }

        const urlSelected = `https://api.waifu.pics/${selectedTypeOption}/${selectedCatOption}`;

        const responseSelected = await fetch.default(urlSelected);
        const dataSelected = await responseSelected.json();

        const embedSelected = new EmbedBuilder()
          .setColor(randomColor)
          .setTitle(
            `Random ${selectedTypeOption.toUpperCase()} ${selectedCatOption.toUpperCase()} Picture`
          )
          .setImage(dataSelected.url)
          .setTimestamp();

        await interaction.reply({
          ephemeral: false,
          embeds: [embedSelected],
        });

        break;

      case "help":
        const embedHelp = new EmbedBuilder()
          .setColor(randomColor)
          .setTitle("Waifu Pics Help Menu")
          .setDescription("Search for anime waifu pictures on Waifu Pics API.")
          .addFields({
            name: "1st command",
            value: "**/waifu-pic random** | Displays a random waifu picture.",
          })
          .addFields({
            name: "2nd command",
            value:
              "**/waifu-pic search [type] [category]** | Select type SFW/NSFW and category.",
          })
          .addFields({
            name: "3rd command",
            value: "**/waifu-pic help** | Displays the help menu.",
          })
          .addFields({
            name: "Note for categories",
            value:
              "You can look for SFW/NSFW categories at (https://waifu.pics/more)\n [*SIDE NOTE: **Trap** category not available.*]",
          })
          .setTimestamp();

        await interaction.reply({
          ephemeral: true,
          embeds: [embedHelp],
        });
        break;
    }
  },
};

function getRandomType(types) {
  return types[Math.floor(Math.random() * types.length)];
}

function getRandomCategory(categories) {
  return categories[Math.floor(Math.random() * categories.length)];
}
