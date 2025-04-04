const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { sendRconCommand } = require("../utils/rcon.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("mc")
        .setDescription("Public commands related to the Minecraft server.")
        .addSubcommand(sub => sub
            .setName("whitelist")
            .setDescription("Adds your Minecraft username to the server whitelist.")
            .addStringOption(option => option
                .setName("username")
                .setDescription("Your Minecraft username (case-sensitive!)")
                .setRequired(true)))
        .addSubcommand(sub => sub
            .setName("status")
            .setDescription("Checks the server status and lists online players."))
        .addSubcommand(sub => sub
            .setName("seed")
            .setDescription("Shows the Minecraft server seed (ephemeral)."))
        .addSubcommand(sub => sub
            .setName("difficulty")
            .setDescription("Shows the current Minecraft server difficulty (ephemeral).")),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "whitelist") {
            const minecraftUsername = interaction.options.getString("username");
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            const result = await sendRconCommand(`whitelist add ${minecraftUsername}`);
            if (result.success) {
                let feedback = `Attempted to add **${minecraftUsername}** to the whitelist.`;
                if (result.response?.includes("already whitelisted")) {
                    feedback = `**${minecraftUsername}** is already on the whitelist!`;
                } else if (result.response?.includes("Added")) {
                    feedback = `Successfully added **${minecraftUsername}** to the whitelist!`;
                }
                await interaction.editReply(`${feedback}\n*Server Response:*\n\`\`\`\n${result.response || "No specific response received."}\n\`\`\``);
            } else {
                await interaction.editReply(`❌ Error adding whitelist: ${result.message}`);
            }
        }
        else if (subcommand === "status") {
            await interaction.deferReply(); // Public status
            const result = await sendRconCommand("list");
            if (result.success && result.response) {
                const listRegex = /There are (\d+) of a max of (\d+) players online:(.*)/s;
                const match = result.response.match(listRegex);
                let replyContent = "✅ Server Online | Could not parse player list.";
                if (match) {
                    const onlineCount = match[1];
                    const maxPlayers = match[2];
                    const players = match[3].trim().split(",").map(p => p.trim()).filter(p => p.length > 0);
                    replyContent = `**Server Status:** Online ✅\n**Players (${onlineCount}/${maxPlayers}):**\n${players.length > 0 ? "- " + players.join("\n- ") : "*No players online*"}`;
                } else {
                    replyContent = `✅ Server Online | Raw list response:\n\`\`\`\n${result.response}\n\`\`\``;
                }
                await interaction.editReply(replyContent);
            } else {
                await interaction.editReply(`**Server Status:** Offline or RCON Error ❌\n*Reason:* ${result.message || "Could not connect to RCON."}`);
            }
        }
        else if (subcommand === "seed") {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            const result = await sendRconCommand("seed");
            if (result.success && result.response) {
                const seedMatch = result.response.match(/Seed: \[(-?\d+)\]/);
                if (seedMatch && seedMatch[1]) {
                    await interaction.editReply(`🗺️ Server Seed: \`${seedMatch[1]}\``);
                } else {
                    await interaction.editReply(`✅ Command sent, but couldn't parse seed.\n*Server Response:*\n\`\`\`\n${result.response}\n\`\`\``);
                }
            } else {
                await interaction.editReply(`❌ Error getting seed: ${result.message || "Failed command"}\n*(This command might require OP permissions)*`);
            }
        }
        else if (subcommand === "difficulty") {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            const result = await sendRconCommand("difficulty");
            if (result.success && result.response) {
                const diffMatch = result.response.match(/The difficulty is (\w+)/);
                if (diffMatch && diffMatch[1]) {
                    await interaction.editReply(`⚙️ Server Difficulty: **${diffMatch[1]}**`);
                } else {
                    await interaction.editReply(`✅ Command sent, but couldn't parse difficulty.\n*Server Response:*\n\`\`\`\n${result.response}\n\`\`\``);
                }
            } else {
                await interaction.editReply(`❌ Error getting difficulty: ${result.message || "Failed command"}\n*(This command might require OP permissions)*`);
            }
        }
    },
};