// Safer startup: use dotenv and environment variables for secrets
require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, ActivityType, Partials } = require('discord.js');
const logger = require('./utils/logger');

const TOKEN = process.env.DISCORD_TOKEN;
const PREFIX = process.env.PREFIX || require('./config.json').prefix || '!';

if (!TOKEN) {
	logger.error('DISCORD_TOKEN is not set. Please create a .env file or set the environment variable.');
	process.exit(1);
}

// Create a new client instance with recommended minimal intents
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();
const commands = [];
module.exports = { commands };

// Load commands dynamically
const foldersPath = path.join(__dirname, 'commands');
if (fs.existsSync(foldersPath)) {
	const commandFolders = fs.readdirSync(foldersPath);
	for (const folder of commandFolders) {
		const commandsPath = path.join(foldersPath, folder);
		if (!fs.existsSync(commandsPath)) continue;
		const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			try {
				const command = require(filePath);
				if (command && command.data && command.execute) {
					client.commands.set(command.data.name, command);
					// store for deploy-commands usage
					if (typeof command.data.toJSON === 'function') {
						command.data.filePath = filePath;
						commands.push(command.data.toJSON());
					}
				} else {
					logger.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
				}
			} catch (err) {
				logger.error(`Failed to load command at ${filePath}: ${err.message}`);
			}
		}
	}
}

// Ready
client.once(Events.ClientReady, bot => {
	logger.info(`Ready! Logged in as ${bot.user.tag}`);
	client.user.setPresence({
		activities: [{ name: 'Owner: rangaistus / Rangaistus#5847', type: ActivityType.Playing }],
		status: 'dnd'
	});
});

// Interaction handling with basic error boundary
client.on(Events.InteractionCreate, async interaction => {
	// handle slash commands
	if (interaction.isChatInputCommand()) {
		const command = interaction.client.commands.get(interaction.commandName);
		if (!command) {
			logger.warn(`No command matching ${interaction.commandName} was found.`);
			return;
		}
		try {
			await command.execute(interaction);
		} catch (error) {
			logger.error(`Command ${interaction.commandName} failed: ${error.stack || error}`);
			try {
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
				} else {
					await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
				}
			} catch (replyErr) {
				logger.error('Failed to send error reply to interaction: ' + (replyErr.stack || replyErr));
			}
		}
		return;
	}

	// Let command-level handlers deal with component interactions (selects/buttons).
	// Acknowledging components globally can conflict with command code that also
	// defers or updates the same interaction (causing Unknown interaction errors).
	if (interaction.isStringSelectMenu()) {
		logger.debug('StringSelectMenu interaction received: passing to command-level handler.');
		return;
	}
});

// Simple message command support (legacy)
client.on('messageCreate', async message => {
	if (message.author.bot) return;
	if (!message.content.startsWith(PREFIX)) return;

	const args = message.content.slice(PREFIX.length).trim().split(/ +/);
	const cmd = args.shift().toLowerCase();

	if (cmd === 'test') {
		try {
			await message.reply('Used the test command!');
		} catch (error) {
			logger.error('Error running test command: ' + (error.stack || error));
			try { await message.reply('There was an error trying to execute that command!'); } catch { };
		}
	}

	if (cmd === 'eval') {
		try {
			const evalCommand = require('./commands/Utility/eval.js');
			await evalCommand.execute(message, args);
		} catch (err) {
			logger.error('Eval command failed: ' + (err.stack || err));
		}
	}
});

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
	logger.error('Unhandled Rejection at:', reason);
});
process.on('uncaughtException', err => {
	logger.error('Uncaught Exception:', err.stack || err);
});

// Start login
client.login(TOKEN).catch(err => {
	logger.error('Failed to login: ' + (err.stack || err));
	process.exit(1);
});