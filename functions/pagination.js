const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

async function buttonPages(interaction, pages, time = 60000) {
    // errors
    if (!interaction) throw new Error('Missing argument: interaction');
    if (!pages) throw new Error('Missing argument: pages');
    if (!Array.isArray(pages)) throw new Error('Pages must be an array');

    if (typeof time !== 'number') throw new Error('Time must be a number');
    if (parseInt(time) < 30000) throw new Error('Time must be at least 30 seconds');


    // defer reply 
    await interaction.deferReply();

    // no buttons if there is only one page
    if (pages.length === 1) {
        const page = await interaction.editReply({
            embeds: pages,
            components: [],
            fetchReply: true,
        });
        return page;
    }

    // adding buttons
    const prev = new ButtonBuilder()
        .setCustomId('prev')
        .setEmoji('⬅️')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true);

    const next = new ButtonBuilder()
        .setCustomId('next')
        .setEmoji('➡️')
        .setStyle(ButtonStyle.Primary);

    const home = new ButtonBuilder()
        .setCustomId('home')
        .setEmoji('🏠')
        .setStyle(ButtonStyle.Danger)
        .setDisabled(true);

    const buttonRow = new ActionRowBuilder().addComponents(prev, next, home);
    let index = 0;

    const currentPage = await interaction.editReply({
        embeds: [pages[index]],
        components: [buttonRow],
        fetchReply: true,
    });

    // creating collector
    const collector = currentPage.createMessageComponentCollector({
        conponentType: ComponentType.Button,
        time,
    });

    collector.on("collect", async (i) => {
        if (i.user.id !== interaction.user.id) {
            await i.reply({
                content: 'You cannot interact with this menu.',
                ephemeral: true,
            });
        }

        await i.deferUpdate();

        if (i.customId === 'prev') {
            if (index > 0) index--;
        } else if (i.customId === 'home') {
            index = 0;
        } else if (i.customId === 'next') {
            if (index < pages.length - 1) index++;
        }

        if (index === 0) prev.setDisabled(true);
        else prev.setDisabled(false);

        if (index === 0) home.setDisabled(true);
        else home.setDisabled(false);

        if (index === pages.length - 1) next.setDisabled(true);
        else next.setDisabled(false);

        await currentPage.edit({
            embeds: [pages[index]],
            components: [buttonRow],
        });

        collector.resetTimer();
    });

    // ending collector
    collector.on("end", async (i) => {
        await currentPage.edit({
            embeds: [pages[index]],
            components: [],
        });
    });

    return currentPage;
}

module.exports = buttonPages;