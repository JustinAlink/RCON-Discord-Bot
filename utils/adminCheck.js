function isAdmin(interaction) {
    const adminRoleId = process.env.ADMIN_ROLE_ID;
    if (!adminRoleId) {
        console.error('ADMIN_ROLE_ID is not set in .env! Cannot check admin permissions.');
        return false;
    }
    // Check if the interaction is in a guild and the member object exists
    if (!interaction.inGuild() || !interaction.member || !interaction.member.roles) {
        // This can happen with certain interaction types or if intents/cache are weird
        console.warn('isAdmin check called outside of a guild context or member roles unavailable.');
        return false;
    }
    return interaction.member.roles.cache.has(adminRoleId);
}

module.exports = { isAdmin };