# Discord Minecraft RCON Bot

> A Discord bot connecting to a Minecraft Java Edition server via the RCON protocol to enable server interaction and administration directly through Discord commands.

---

## Overview

This project demonstrates the integration between Discord and a Minecraft server using Node.js, the `discord.js` library (v14), and the RCON protocol. It provides a foundation for building custom server management tools within a Discord community.

The bot utilizes Discord's slash command interface and features a modular command structure, separating public and administrative functionalities.

## Features

*   **RCON Integration:** Securely connects to the Minecraft server using RCON credentials.
*   **Slash Commands:** Modern Discord interaction model using `discord.js`.
*   **Modular Command Handling:** Commands are organized into separate files for better maintainability.
*   **Subcommand Structure:** Uses subcommands (`/mc <subcommand>`, `/mcadmin <subcommand>`) for logical grouping.
*   **Role-Based Permissions:** Administrative commands are restricted to users with a specific, configurable Discord role.
*   **Environment Configuration:** Securely manages sensitive credentials using environment variables (`.env` file).
*   **Docker Support:** Includes `Dockerfile` and `.dockerignore` for easy containerized deployment.

### Implemented Commands

*   **`/mc`** (Public Commands):
    *   `whitelist <username>`: Adds a specified Minecraft user to the server whitelist.
    *   `status`: Checks the current server status and lists online players.
    *   `seed`: Displays the server's world seed (ephemeral reply; may require RCON user to have OP).
    *   `difficulty`: Displays the server's current difficulty (ephemeral reply; may require RCON user to have OP).
*   **`/mcadmin`** (Admin-Only Commands - Requires `ADMIN_ROLE_ID`):
    *   `say <message>`: Broadcasts a message to the in-game server chat.
    *   `unwhitelist <username>`: Removes a user from the server whitelist.
    *   `listwhitelist`: Lists all users currently on the whitelist.
    *   `reloadwhitelist`: Reloads the server's whitelist from file.
    *   `gamerule <rule>`: Shows the current value of a specific gamerule (may require RCON user to have OP).

## Technical Stack

*   **Language:** Node.js
*   **Discord API Library:** discord.js v14
*   **Minecraft Interaction:** RCON Protocol (`rcon-client` npm package)
*   **Configuration:** dotenv
*   **Containerization:** Docker (Optional)

## Setup and Installation

### Prerequisites

*   Node.js (v16.9.0 or newer)
*   npm
*   Access to a Minecraft Java Edition server with RCON configured.
*   A Discord Bot Application (Token, Client ID) from the Discord Developer Portal.

### 1. Server RCON Configuration

Ensure RCON is enabled and configured in your Minecraft server's `server.properties`:

```properties
enable-rcon=true
rcon.port=25575 # Or your custom RCON port
rcon.password=YOUR_SECURE_RCON_PASSWORD
# Ensure server-ip= is blank if running vanilla or in Docker/Pterodactyl
```
Remember to configure firewalls or Pterodactyl allocations to allow connections to the RCON port.

### 2. Bot Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure Environment Variables:**
    *   Copy the example file: `copy .env.example .env` (Windows) or `cp .env.example .env` (Linux/macOS)
    *   Edit the `.env` file and provide your specific values:
        ```dotenv
        DISCORD_TOKEN=YOUR_BOT_TOKEN_HERE
        CLIENT_ID=YOUR_BOT_CLIENT_ID_HERE
        RCON_HOST=YOUR_SERVER_IP_OR_DOMAIN # e.g., 192.168.1.100 or mc.yourdomain.com
        RCON_PORT=25575 # Your RCON port
        RCON_PASSWORD=YOUR_SECURE_RCON_PASSWORD # Must match server.properties
        ADMIN_ROLE_ID=YOUR_DISCORD_ADMIN_ROLE_ID_HERE # Role ID for /mcadmin commands
        ```

### 3. Deploy Slash Commands

Run this script once initially and whenever commands are added or changed:

```bash
npm run deploy
```
*(Note: Global command deployment can take up to an hour to propagate.)*

### 4. Invite Bot to Discord Server

Use the OAuth2 URL Generator in the Discord Developer Portal for your bot application. Select scopes `bot` and `application.commands`, grant necessary permissions (like `Send Messages`), and use the generated URL.

## Running the Bot

### Directly with Node.js

```bash
npm start
```

### Using Docker (Recommended for Deployment)

1.  **Build the image:**
    ```bash
    docker build -t discord-mc-bot .
    ```
2.  **Run the container:**
    ```bash
    # Ensure you are in the project directory
    docker run \
        --detach \
        --name discord-mc-bot-container \
        --restart always \
        --env-file .env \
        discord-mc-bot
    ```

## Project Structure

```
/
|-- commands/          # Command definition and execution logic
|   |-- public.js
|   `-- admin.js
|-- utils/             # Utility functions
|   |-- rcon.js
|   `-- adminCheck.js
|-- .env               # Environment variables (ignored by Git)
|-- .env.example       # Example environment variables
|-- .dockerignore      # Files ignored by Docker build
|-- .gitignore         # Files ignored by Git
|-- Dockerfile         # Docker build instructions
|-- index.js           # Main application entry point
|-- deploy-commands.js # Command deployment script
|-- package.json       # Project metadata and dependencies
|-- package-lock.json  # Dependency lock file
`-- README.md          # This file
```

## License

This project is licensed under the ISC License. See the `LICENSE` file (if included) for details.
