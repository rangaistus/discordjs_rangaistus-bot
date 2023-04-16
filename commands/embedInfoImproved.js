const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed-info')
        .setDescription('Displays user information with a embed.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Select a user.')
                .setRequired(true)
        ),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const bot = interaction.client.user;

        if (!user) {
            return await interaction.reply('User not found.');
        }

        const guildMember = await interaction.guild.members.fetch(user.id);
        if (!guildMember) {
            return await interaction.reply('User not found in the server.');
        }

        if (bot) {
            if (user.id === bot.id) {
                return await interaction.reply('I am not a user.');
            }
        }

        const createdDate = user.createdAt ? user.createdAt.toLocaleString() : 'Unable to get user information.';
        const joinedDate = guildMember.joinedAt ? guildMember.joinedAt.toLocaleString() : 'Not available (user has not joined the server)';


        const randomColor = Math.floor(Math.random() * 16777215);

        await interaction.reply({
            embeds: [{
                color: randomColor,
                author: {
                    name: user.tag,
                    icon_url: user.avatarURL()
                },
                thumbnail: {
                    url: user.avatarURL()
                },
                fields: [
                    {
                        name: 'ID',
                        value: user.id,
                    },
                    {
                        name: 'Account Created At',
                        value: createdDate,
                    },
                    {
                        name: 'Joined Server At',
                        value: joinedDate,
                    }
                ]
            }]
        });
    },
};