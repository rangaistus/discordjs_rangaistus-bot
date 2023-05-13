const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Provides information about the user.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Select a user.')
                .setRequired(false)
        ),
    async execute(interaction) {
        // if user is not provided, get the user who executed the command
        const user = interaction.options.getUser('user') || interaction.user;
        // if user is provided, get the user from the guild
        const guildMember = await interaction.guild.members.fetch(user.id);
        // if user is not found in the guild, reply with error message
        if (!guildMember) {
            return await interaction.reply('User not found in the server.');
        }

        if (!user) {
            return await interaction.reply('User not found.');
        }

        const avatarURL = user.displayAvatarURL({ format: 'png', dynamic: true, size: 4096 });

        await interaction.reply(
            `User: ${user.tag}\nID: ${user.id}\nAvatar: ${avatarURL}`
        );

    },
};