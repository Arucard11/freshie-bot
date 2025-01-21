# Freshie Bot

Freshie Bot is a Telegram bot designed to assist in identifying promising coins (often referred to as pump-and-dump coins) and checking if associated wallets are fresh (newly created) and hold a good amount of tokens.

## Features
- Monitors coins to detect sudden increases in activity or value.
- Verifies if wallets associated with the coin are newly created (fresh).
- Checks if wallets hold significant token amounts, signaling potential activity.

## How It Works
1. **Token Monitoring**: The bot listens for token updates and calculates key metrics like percentage changes in token pools.
2. **Wallet Analysis**: It evaluates wallet activity and flags those with potential for pump-and-dump patterns.
3. **Easy Integration**: Simple commands to fetch real-time data.

## Stack
- **Node.js**: Backend logic.
- **Mongoose**: Database management with MongoDB.
- **Telegram Bot API**: Interaction with users on Telegram.
- **GitHub**: Version control and collaboration.

## Getting Started
1. Clone the repository:
   ```bash
   git clone https://github.com/arucard11/freshie-bot.git```

 ``` cd & npm install```
 ```node index.js```
