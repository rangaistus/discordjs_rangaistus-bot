// Require the ncessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, ActivityType, MessageManager, Partials } = require('discord.js');
const evalCommand = require('./commands/Utility/eval.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages], partials: [Partials.MessageContent, Partials.Message] });

client.commands = new Collection();
const commands = [];
module.exports = {commands};
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
            command.data["filePath"] = filePath;
            commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, discordBot => {
    console.log(`Ready! Logged in as ${discordBot.user.tag}`);

    // console.log("Bot latency: ", Date.now() - discordBot.readyTimestamp, "ms");

    client.user.setPresence({
        activities: [{ name: `Rangaistus#5847`, type: ActivityType.Listening }],
        status: 'dnd',
    })
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});


// server command without slashcommands 
// make a test command that returns the server name and member count
client.on('messageCreate', async message => {

    var { prefix } = require('./config.json');

    if (message.author.bot) return;

    if (message.content.startsWith(prefix) || message.author.bot) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (command === `test`) {
            try {
                await message.reply('Used the test command!');
            } catch (error) {
                await message.reply('There was an error trying to execute that command!');
                console.error(error);
            }
        }

        if (command === `eval`) {
            evalCommand.execute(message, args);
        }

    }
});

// Log in to Discord with your client's token
client.login(token);