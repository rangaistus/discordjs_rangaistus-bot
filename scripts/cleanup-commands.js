#!/usr/bin/env node
/**
 * cleanup-commands.js
 * Usage:
 *  - Dry run (list duplicates): node scripts/cleanup-commands.js
 *  - Delete global duplicates (keep guild copies): DELETE=true node scripts/cleanup-commands.js
 * Environment: DISCORD_TOKEN, CLIENT_ID, optional GUILD_IDS (comma-separated) or GUILD_ID
 */
require('dotenv').config();
const { REST, Routes } = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_IDS_ENV = process.env.GUILD_IDS || process.env.GUILD_ID || '';
const GUILD_IDS = String(GUILD_IDS_ENV).split(',').map(s => s.trim()).filter(Boolean);
const DO_DELETE = String(process.env.DELETE) === 'true';

if (!TOKEN || !CLIENT_ID) {
    console.error('Please set DISCORD_TOKEN and CLIENT_ID in your environment (.env).');
    process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('Fetching global commands...');
        const globalCmds = await rest.get(Routes.applicationCommands(CLIENT_ID));
        const entries = globalCmds.map(c => ({ id: c.id, name: c.name, scope: 'global' }));

        for (const gid of GUILD_IDS) {
            console.log(`Fetching commands for guild ${gid}...`);
            try {
                const guildCmds = await rest.get(Routes.applicationGuildCommands(CLIENT_ID, gid));
                guildCmds.forEach(c => entries.push({ id: c.id, name: c.name, scope: `guild:${gid}`, guildId: gid }));
            } catch (err) {
                console.warn(`Warning: failed to fetch guild ${gid}: ${err.message}`);
            }
        }

        const byName = entries.reduce((acc, e) => { (acc[e.name] = acc[e.name] || []).push(e); return acc; }, {});
        const dups = Object.entries(byName).filter(([, arr]) => arr.length > 1);

        if (dups.length === 0) {
            console.log('No duplicate command names found across scopes.');
            return;
        }

        console.log('Found duplicates across scopes:');
        for (const [name, arr] of dups) {
            console.log(`\nCommand "${name}" appears in:`);
            arr.forEach(a => console.log(` - ${a.scope} (id=${a.id})`));

            if (DO_DELETE) {
                const globalEntry = arr.find(x => x.scope === 'global');
                if (globalEntry) {
                    try {
                        console.log(`Deleting global command "${name}" (id=${globalEntry.id}) ...`);
                        await rest.delete(Routes.applicationCommand(CLIENT_ID, globalEntry.id));
                        console.log('Deleted.');
                    } catch (err) {
                        console.error('Failed to delete:', err);
                    }
                } else {
                    console.log('No global instance to delete for this name; skipping.');
                }
            } else {
                console.log('Dry run: not deleting. Set DELETE=true to actually delete global duplicates.');
            }
        }
    } catch (err) {
        console.error('Error while listing/deleting commands:', err);
        process.exit(1);
    }
})();
