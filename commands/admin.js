const { SlashCommandBuilder, MessageFlags, PermissionsBitField } = require('discord.js');
const { sendRconCommand } = require('../utils/rcon.js');
const { isAdmin } = require('../utils/adminCheck.js'); // Import admin check

// Generic reply function
async function replyResult(interaction, result, successMsg = 'Command executed successfully.') {
    if (result.success) {
        // Truncate potentially long responses (like whitelist list)
        const responseText = result.response ? result.response.substring(0, 1800) : '';
        await interaction.editReply(successMsg + (responseText ? `\n\`\`\`\n${responseText}\n\`\`\`` : ''));
    } else {
        await interaction.editReply(`❌ Error: ${result.message || 'Failed to execute command.'}`);
    }
}

// --- Subcommand RCON command builders ---
const subcommands = {
    say: (interaction) => `say ${interaction.options.getString('message')}`,
    unwhitelist: (interaction) => `whitelist remove ${interaction.options.getString('username')}`,
    listwhitelist: () => `whitelist list`,
    reloadwhitelist: () => `whitelist reload`,
    gamerule: (interaction) => `gamerule ${interaction.options.getString('rule')}`,
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mcadmin')
        .setDescription('[Admin] Admin commands for the Minecraft server.')
        // Subcommands for organization
        .addSubcommand(sub => sub
            .setName('say')
            .setDescription('Sends a message to the server chat.')
            .addStringOption(option => option.setName('message').setDescription('The message to send').setRequired(true))
        )
        .addSubcommand(sub => sub
            .setName('unwhitelist')
            .setDescription('Removes a user from the whitelist.')
            .addStringOption(option => option.setName('username').setDescription('The user to remove').setRequired(true))
        )
        .addSubcommand(sub => sub
            .setName('listwhitelist')
            .setDescription('Lists all whitelisted users.')
        )
        .addSubcommand(sub => sub
            .setName('reloadwhitelist')
            .setDescription('Reloads the whitelist file on the server.')
        )
        .addSubcommand(sub => sub
            .setName('gamerule')
            .setDescription('Gets the value of a specific gamerule.')
            .addStringOption(option => option.setName('rule').setDescription('The gamerule to query').setRequired(true))
        ),
    // Removed seed and difficulty as they are now public

    async execute(interaction) {
        if (!isAdmin(interaction)) {
            return interaction.reply({ content: '⛔ You do not have permission to use this command.', ephemeral: true });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const subcommandName = interaction.options.getSubcommand();
        let rconCommand = '';

        try {
            if (subcommands[subcommandName]) {
                rconCommand = subcommands[subcommandName](interaction);
            } else {
                return interaction.editReply('❌ Unknown admin subcommand.');
            }
        } catch (error) {
            console.error('Error building RCON command:', error);
            return interaction.editReply('❌ Error processing command options.');
        }

        if (rconCommand) {
            const result = await sendRconCommand(rconCommand);
            // Provide more context for listwhitelist
            let successMessage = 'Command executed successfully.';
            if(subcommandName === 'listwhitelist') {
                successMessage = 'Whitelisted Players:';
            }
            await replyResult(interaction, result, successMessage);
        } else {
            await interaction.editReply('❌ Could not determine RCON command.');
        }
    },
}; 