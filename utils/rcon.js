const { Rcon } = require('rcon-client');

const rconHost = process.env.RCON_HOST;
const rconPort = parseInt(process.env.RCON_PORT, 10);
const rconPassword = process.env.RCON_PASSWORD;

// RCON connection function (async)
async function sendRconCommand(command) {
    if (!rconHost || !rconPort || !rconPassword) {
        console.error('Missing RCON connection details in environment variables!');
        return { success: false, message: 'Bot RCON configuration error.' };
    }

    let rcon = null;
    try {
        // console.log(`Attempting RCON connection to ${rconHost}:${rconPort}`); // Verbose logging
        rcon = await Rcon.connect({
            host: rconHost,
            port: rconPort,
            password: rconPassword,
            timeout: 10000 // Added timeout (10 seconds)
        });
        // console.log('RCON connection successful.'); // Verbose logging
        const response = await rcon.send(command);
        // console.log(`RCON command "${command}" sent. Response: ${response}`); // Verbose logging
        await rcon.end();
        // console.log('RCON connection closed.'); // Verbose logging
        return { success: true, response: response };
    } catch (error) {
        console.error(`RCON Error (${command}):`, error.message); // Log specific error message
        if (rcon) {
            try { await rcon.end(); /* console.log('RCON connection closed after error.'); */ } catch (closeError) { console.error('Error closing RCON connection:', closeError.message); }
        }

        // Provide a more specific error message from RCON if possible
        let detail = error.message || 'Unknown RCON error';
        if (error.code === 'ECONNREFUSED') detail = 'Connection refused. Is server running & RCON enabled/port correct?';
        else if (error.code === 'ETIMEDOUT') detail = 'Connection timed out. Check firewall/port forwarding/server responsiveness.';
        else if (error.message?.includes('Authentication failed')) detail = 'Authentication failed. Check RCON password.';
        else if (error.code === 'ECONNRESET') detail = 'Connection reset by peer. Server might have stopped or RCON crashed.';
        // Add more specific checks if needed based on observed errors

        return { success: false, error: error, message: detail };
    }
}

module.exports = { sendRconCommand }; 