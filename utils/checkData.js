import { getHolderInfo } from './getHolderInfo.js'
import Token from '../DB/tokenSchema.js';
import User from '../DB/userSchema.js';
import {Connection,PublicKey } from '@solana/web3.js'
import {BigNumber} from 'bignumber.js'
const connection = new Connection(`https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`);
import { connectDB } from '../DB/connect.js';
import * as borsh from 'borsh';
import TelegramBot from 'node-telegram-bot-api'

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

async function getSolPrice(){
    const solPrice = await(await fetch("https://frontend-api-v2.pump.fun/sol-price")).json()
    return solPrice.solPrice
  }

 async function getMarketCap(mint){
    // const LAMPORTS_PER_SOL = 10n ** 9n
    // const DECIMALS = 10n ** 6n
        // const schema = { 'struct': { 
        //         'virtualTokenReserves': 'u64', 
        //         'virtualSolReserves': "u64", 
        //         'realTokenReserves': 'u64', 
        //         'realSolReserves': 'u64',
        //         'tokenTotalSupply':'u64',
        //         'complete':'bool'
        //   } };
         
        //   const {virtualSolReserves,virtualTokenReserves,realTokenReserves,realSolReserves,tokenTotalSupply} = borsh.deserialize(schema,data);
        console.log("Mint: ",mint)
        await new Promise(resolve => setTimeout(resolve, 500))
        const {marketcap,num_holders} = await(await fetch(`https://advanced-api.pump.fun/coins/metadata/${mint}`)).json()
        console.log("Market Cap: ",marketcap)
        console.log("Number of holders: ",num_holders)
        return marketcap       
 }

export async function checkTopHolders(){
   while(true){
    let tokens = await Token.find({})
        if(tokens.length > 0){
            for(let token of tokens){
                let marketCap = await getMarketCap(token.mintAddress)
                if(marketCap >= 8000){
                        await new Promise(resolve => setTimeout(resolve, 1000))
                        let holderInfo = await getHolderInfo(token.mintAddress)
                        if(holderInfo){
                            let users = await User.find({monitor: true})
                            for(let user of users){
                                const walletLinks = holderInfo.owners
                                .map(
                                    (wallet) =>
                                        `👛 <b>Balance:</b> ${wallet.amount.toFixed(0)} - <a href="https://solscan.io/account/${wallet.owner}">View Wallet (${wallet.owner.slice(0, 10)}...)</a>\n`
                                )
                                .join('');
                            
                           let {image} = await (await fetch(token.uri)).json()
                           console.log("Image: ",image)
                            const MESSAGE = `<b> Fresh/Aged Wallets are buying 💎</b>\n\n<b>Mint Address: </b><code>${token.mintAddress}</code>\n\n<b>📈 Market Cap:</b> $${marketCap}\n🪙<b>Token Name: ${token.name}</b>\n\n🔗 <b>Symbol: </b> <a href="https://t.me/share/url?url=$${token.symbol}">$${token.symbol}</a>\n💰 <b>Fresh Wallets hold: ${((holderInfo.amountOfSupply /10**9)*100).toFixed(2)}% of the total supply</b>\n\n<b>🔥 Fresh Wallets:</b>\n${walletLinks}`;
                            
                                bot.sendPhoto(user.chatId,image.replace("https://ipfs.io/","https://pump.mypinata.cloud/"), {
                                    parse_mode: 'HTML',
                                    caption: MESSAGE,
                                    reply_markup: {
                                        inline_keyboard: [
                                            [
                                                { text: 'Snipe on Photon 💥', url: `https://photon-sol.tinyastro.io/en/lp/${token.mintAddress}` }
                                            ]
                                        ]
                                    }
                                });
                            
                        }
                        }
                
                    }
                
            await Token.findByIdAndDelete(token._id)
            console.log("Token deleted")
            }
        
        }
    }
}

