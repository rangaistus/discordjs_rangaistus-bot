const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server-info')
        .setDescription('Displays information about the server.'),
    async execute(interaction) {
        const { guild } = interaction;
        const { members } = guild;
        const { name, ownerId, memberCount } = guild;
        const icon = guild.iconURL({ format: 'png', dynamic: true, size: 4096 }) || 'https://media.discordapp.net/attachments/978035586168418334/978304826351943800/unnamed.png';
        const roles = guild.roles.cache.size;
        const emojis = guild.emojis.cache.size;
        const id = guild.id;

        let baseVerification = guild.verificationLevel;

        if (baseVerification === 0) baseVerification = 'None';
        if (baseVerification === 1) baseVerification = 'Low';
        if (baseVerification === 2) baseVerification = 'Medium';
        if (baseVerification === 3) baseVerification = 'High';
        if (baseVerification === 4) baseVerification = 'Very High';

        const createdDateTemplate = `<t:${Math.floor(guild.createdTimestamp / 1000)}:R> (Hover for exact date)`;

        const randomColor = Math.floor(Math.random() * 16777215);

        const embed = new EmbedBuilder()
            .setColor(randomColor)
            .setThumbnail(icon)
            .setAuthor({ name: name, iconURL: icon })
            .setFooter({ text: `Server ID: ${id}` })
            .setTimestamp()
            .addFields({ name: "Name", value: `${name}`, inline: false })
            .addFields({ name: "Date Created", value: createdDateTemplate, inline: true })
            .addFields({ name: "Server Owner", value: `<@${ownerId}>`, inline: true })
            .addFields({ name: "Server Members", value: `${memberCount}`, inline: true })
            .addFields({ name: "Role Number", value: `${roles}`, inline: true })
            .addFields({ name: "Emoji Number", value: `${emojis}`, inline: true })
            .addFields({ name: "Verification Level", value: `${baseVerification}`, inline: true })
            .addFields({ name: "Server Boosts", value: `${guild.premiumSubscriptionCount}`, inline: true })

        await interaction.reply({ embeds: [embed] });

    }
}