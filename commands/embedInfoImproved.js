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
        if (!user) {
            return await interaction.reply('User not found.');
        }
        const createdDate = user.createdAt ? user.createdAt.toDateString() : 'Unable to get user information.';
        const joinedDate = user.joinedAt ? user.joinedAt.toDateString() : 'Unable to get user information.';

        await interaction.reply({ embeds: [{
            color: '3447003',
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
        }] });
    },
};
