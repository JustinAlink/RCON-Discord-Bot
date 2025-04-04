const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Events, InteractionType, MessageFlags, PermissionsBitField } = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();

// Environment variable validation (basic check)
const requiredEnv = ['DISCORD_TOKEN', 'RCON_HOST', 'RCON_PORT', 'RCON_PASSWORD', 'ADMIN_ROLE_ID'];
for (const envVar of requiredEnv) {
    if (!process.env[envVar]) {
        console.error(`Error: Missing required environment variable ${envVar} in .env file. Exiting.`);
        process.exit(1);
    }
}

const token = process.env.DISCORD_TOKEN;
// RCON and Admin details are used in the utils files now, no need to store them here
// const rconHost = process.env.RCON_HOST;
// const rconPort = parseInt(process.env.RCON_PORT, 10);
// const rconPassword = process.env.RCON_PASSWORD;
// const adminRoleId = process.env.ADMIN_ROLE_ID;

// Create a new client instance with necessary intents
// Guilds: Needed for basic guild info and slash commands
// GuildMembers: Needed by adminCheck to access member roles
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
// const client = new Client({ intents: [GatewayIntentBits.Guilds] }); // Only requesting Guilds intent now

// Load commands dynamically
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    try {
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            console.log(`[INFO] Loaded command: /${command.data.name}`);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required \"data\" or \"execute\" property.`);
        }
    } catch (error) {
        console.error(`[ERROR] Failed to load command at ${filePath}:`, error);
    }
}

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    // Optional: Set bot presence
    // You might want different activity types: PLAYING, STREAMING, LISTENING, WATCHING, COMPETING
    readyClient.user.setActivity('Minecraft Server', { type: 'WATCHING' });
});

// Listen for interactions (slash commands)
client.on(Events.InteractionCreate, async interaction => {
    // Handle only chat input commands (slash commands)
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        try {
            // Use ephemeral reply for unknown commands
            await interaction.reply({ content: 'Error: This command does not exist!', ephemeral: true });
        } catch (replyError) {
            console.error('Error replying to unknown command:', replyError);
        }
        return;
    }

    try {
        // Execute the command's logic
        await command.execute(interaction);
    } catch (error) {
        console.error(`Error executing command: ${interaction.commandName}`);
        console.error(error);
        // Attempt to inform the user about the error, replying or following up as needed
        const errorReplyOptions = { content: 'There was an error while executing this command! Please notify the admin.', ephemeral: true };
        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorReplyOptions);
            } else {
                await interaction.reply(errorReplyOptions);
            }
        } catch (replyError) {
            console.error('Error sending command execution error reply:', replyError);
        }
    }
});

// Log in to Discord with your client's token
client.login(token); 