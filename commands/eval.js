const { ownerId } = require('../config.json');



module.exports = {
    name: 'eval',
    description: 'Executes JavaScript code.',
    async execute(message, args) {
        // Only allow the owner to use this command
        if (message.author.id !== ownerId) {
            return message.reply('You do not have permission to use this command.');
        }

        try {
            const code = args.join(' ');
            let evaled = eval(code);

            if (typeof evaled !== 'string') {
                evaled = require('util').inspect(evaled);
            }

            message.channel.send(evaled, { code: 'xl' });
        } catch (err) {
            message.channel.send(`\`ERROR\` \`\`\`xl\n${err}\n\`\`\``);
        }
    },
};
