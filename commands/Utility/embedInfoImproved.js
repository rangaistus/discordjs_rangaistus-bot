const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed-info')
        .setDescription('Displays user information with a embed.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Select a user.')
                .setRequired(false)
        ),
    async execute(interaction) {

        const randomColor = Math.floor(Math.random() * 16777215);

        let user = interaction.options.getUser('user') || interaction.user;
        if (!user) {
            user = interaction.user;
        } else if (!user && interaction.options.getMember('user')) {
            return await interaction.reply('User not found.');
        }
        const bot = interaction.client.user;
        const guildMember = user ? await interaction.guild.members.fetch(user.id) : null;
        const createdDate = user ? user.createdAt ? user.createdAt.toLocaleString() : 'Unable to get user information.' : 'User not found.';
        const joinedDate = guildMember ? guildMember.joinedAt ? guildMember.joinedAt.toLocaleString() : 'Not available (user has not joined the server)' : 'User not found in the server.';


        if (bot) {
            if (user && user.id === bot.id) {
                return await interaction.reply('I am not a user.');
            }
        }

        await interaction.reply({
            embeds: [{
                color: randomColor,
                author: {
                    name: user ? user.tag : 'User not found.',
                    icon_url: user ? user.avatarURL() : null
                },
                thumbnail: {
                    url: user ? user.displayAvatarURL({ format: 'png', dynamic: true, size: 4096 }) : null
                },
                fields: [
                    {
                        name: 'ID',
                        value: user ? user.id : 'User not found.',
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
