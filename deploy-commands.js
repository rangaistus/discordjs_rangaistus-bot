require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const logger = require('./utils/logger');

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_IDS = process.env.GUILD_IDS;
const DEPLOY_SCOPE = process.env.DEPLOY_SCOPE; // 'global' to force global deploy

// debug info (avoid logging token)
console.log("CLIENT_ID: " + CLIENT_ID);
console.log("GUILD_IDS: " + GUILD_IDS);
console.log("DEPLOY_SCOPE: " + DEPLOY_SCOPE);

if (!TOKEN) {
	logger.error('DISCORD_TOKEN is not set. Aborting deploy-commands.');
	process.exit(1);
}

const commands = [];
module.exports = { commands };

// Load commands
const foldersPath = path.join(__dirname, 'commands');
if (fs.existsSync(foldersPath)) {
	const commandFolders = fs.readdirSync(foldersPath);
	for (const folder of commandFolders) {
		const commandsPath = path.join(foldersPath, folder);
		if (!fs.existsSync(commandsPath)) continue;
		const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			const command = require(filePath);
			if ('data' in command && 'execute' in command) {
				if (typeof command.data.toJSON === 'function') commands.push(command.data.toJSON());
			} else {
				logger.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
			}
		}
	}
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
	try {
		logger.info(`Started refreshing ${commands.length} application (/) commands.`);

		if (GUILD_IDS) {
			// support comma-separated list of guild IDs
			const guildIds = String(GUILD_IDS).split(',').map(g => g.trim()).filter(Boolean);
			for (const gid of guildIds) {
				try {
					logger.info(`Deploying ${commands.length} commands to guild ${gid}...`);
					await rest.put(Routes.applicationGuildCommands(CLIENT_ID, gid), { body: commands });
					logger.info(`Successfully reloaded ${commands.length} guild (/) commands for ${gid}.`);
				} catch (err) {
					logger.error(`Failed to deploy to guild ${gid}: ${err.stack || err}`);
				}
				// small delay between guild deploys to reduce rate limit pressure
				await new Promise(resolve => setTimeout(resolve, 1000));
			}
		} else if (DEPLOY_SCOPE === 'global') {
			// explicit global deploy
			logger.info('No GUILD_IDS provided; DEPLOY_SCOPE=global set — deploying global commands.');
			await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
			logger.info(`Successfully reloaded ${commands.length} global (/) commands.`);
		} else {
			// safety: do not deploy globally by default
			logger.warn('No GUILD_IDS set and DEPLOY_SCOPE!=global — skipping global deployment. To force global deploy set DEPLOY_SCOPE=global in your environment.');
		}
	} catch (error) {
		logger.error('Failed to deploy commands: ' + (error.stack || error));
		process.exit(1);
	}
})();