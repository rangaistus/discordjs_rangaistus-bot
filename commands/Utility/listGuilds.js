require('dotenv').config();
const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');

const OWNER_ID = process.env.OWNER_ID

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list-guilds')
        .setDescription('List guilds the bot is in (owner only)'),

    async execute(interaction) {
        // owner-only guard
        if (String(interaction.user.id) !== String(OWNER_ID)) {
            return interaction.reply({ content: 'Only the bot owner can use this command.', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        const guilds = interaction.client.guilds.cache.map(g => `${g.name} — ${g.id}`).join('\n');
        const count = interaction.client.guilds.cache.size;

        // If output too long for a message, send as attachment
        if (guilds.length > 1900) {
            const buffer = Buffer.from(guilds, 'utf8');
            const attachment = new AttachmentBuilder(buffer, { name: 'guilds.txt' });
            await interaction.followUp({ content: `I am in ${count} guilds. See attached list.`, files: [attachment], ephemeral: true });
        } else {
            await interaction.followUp({ content: `I am in ${count} guilds:\n${guilds}`, ephemeral: true });
        }
    },
};
