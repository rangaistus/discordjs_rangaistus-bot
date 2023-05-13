const { SlashCommandBuilder, GuildMember } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server-info')
        .setDescription('Provides information about the server.'),
    async execute(interaction) {

        const guild = interaction.guild;
        const guildOwner = await guild.members.fetch(guild.ownerId);
        const guildOwnerTag = guildOwner.user.tag;
        const guildOwnerAvatar = guildOwner.user.avatarURL({ format: 'png', dynamic: true, size: 4096 });
        const guildOwnerID = guildOwner.user.id;
        const guildOwnerCreatedDate = guildOwner.user.createdAt.toLocaleString();
        const guildOwnerJoinedDate = guildOwner.joinedAt.toLocaleString();
        const guildCreatedDate = guild.createdAt.toLocaleString();
        const guildMemberCount = guild.memberCount - guild.members.cache.filter(member => member.user.bot).size;
        const guildBotCount = guild.members.cache.filter(member => member.user.bot).size;
        const guildMemberCountTotal = guild.memberCount;
        const guildName = guild.name;

        const randomColor = Math.floor(Math.random() * 16777215);

        await interaction.reply({
            embeds: [{
                color: randomColor,
                author: {
                    name: guildName,
                    icon_url: guild.iconURL({ format: 'png', dynamic: true, size: 4096 })
                },
                thumbnail: {
                    url: guild.iconURL({ format: 'png', dynamic: true, size: 4096 })
                },
                fields: [
                    {
                        name: 'Owner',
                        value: `${guildOwnerTag} (${guildOwnerID})`,
                    },
                    {
                        name: `Owner's Account Created At`,
                        value: guildOwnerCreatedDate,
                    },
                    {
                        name: 'Guild Created At',
                        value: guildCreatedDate,
                    },
                    {
                        name: 'Member Count',
                        value: `${guildMemberCount} members (${guildMemberCountTotal} total)`,
                    },
                    {
                        name: 'Bot Count',
                        value: guildBotCount,
                    },
                    {
                        name: 'Total member count',
                        value: guildMemberCountTotal,
                    },
                ],
            }],
        });

    }
};
