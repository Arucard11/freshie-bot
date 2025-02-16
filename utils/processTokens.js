import { getHolderInfo} from "./getHolderInfo.js";
import TelegramBot from 'node-telegram-bot-api'
import User from '../DB/userSchema.js';
import { BN } from "bn.js";
import * as borsh from 'borsh';
import { Connection, PublicKey} from "@solana/web3.js";
import dotenv from "dotenv"
dotenv.config()
//"https://frontend-api-v3.pump.fun/sol-price"
const connection = new Connection(`https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`,"confirmed");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

async function getMarketCap(bondingCurveAddress){
    const schema = { 'struct': { 
        'discriminator': 'u64',
        'virtualTokenReserves': 'u64', 
        'virtualSolReserves': "u64", 
        'realTokenReserves': 'u64', 
        'realSolReserves': 'u64',
        'tokenTotalSupply':'u64',
                'complete':'bool'
            } };
            
            try {
                if (!bondingCurveAddress) return 0;
            
                // Get current SOL price
                const { solPrice } = await (await fetch("https://frontend-api-v3.pump.fun/sol-price")).json();
                
                // Fetch bonding curve account data
                const accountInfo = await connection.getAccountInfo(new PublicKey(bondingCurveAddress));
                if (!accountInfo?.data) return 0;
            
                // Deserialize account data
                const bondingCurve = borsh.deserialize(
                  schema,
                  accountInfo.data
                );
            
                // Convert reserves to numbers
                let virtualSolReserves = new BN(bondingCurve.virtualSolReserves)
                let virtualTokenReserves = new BN(bondingCurve.virtualTokenReserves)
                let tokenTotalSupply = new BN(bondingCurve.tokenTotalSupply)

                let marketCapInSol = (tokenTotalSupply.mul(virtualSolReserves)).div(virtualTokenReserves)
                let marketCap = ((marketCapInSol.toNumber()/10**9) * solPrice).toFixed(0)
                console.log("Market Cap: ",Number(marketCap).toLocaleString("en-US"))
                return marketCap
              } catch (error) {
                console.error('Market cap calculation error:', error);
                return 0;
              }
}

export async function checkTokens(tokens, workerName) {
    let marketCapIncrease = false;
    let holderIncrease = false;
    let walletLinks
    if (tokens.length > 1) {
        console.log(workerName);
        for (let token of tokens) {
            let marketCap = await getMarketCap(token.mintAddress);
            let holderInfo = await getHolderInfo(token.mintAddress);

            if (marketCap >= token.marketCap * 1.1) {
                marketCapIncrease = true;
            }

            if (holderInfo && holderInfo.owners.length > token.owners) {
                holderIncrease = true;
                walletLinks = holderInfo.owners
                .map(
                    (wallet) =>
                        `👛 <b>Balance:</b> ${wallet.amount.toFixed(0)} - <a href="https://solscan.io/account/${wallet.owner}">View Wallet (${wallet.owner.slice(0, 10)}...)</a>\n`
                )
                .join('');
            }

            let image;
            let uri = await (await fetch(token.uri)).json();
            if (uri.image && uri.image.includes("ipfs")) {
                image = uri.image.replace("https://ipfs.io/", "https://pump.mypinata.cloud/");
            } else if (uri.image) {
                image = uri.image;
            }

            console.log("Image: ", image);
            const MESSAGE = `<b> Wallets are buying this coin!\n\n ${
                marketCapIncrease
                    ? `<b>There has been a Market Cap increase</b>\n<b>📈 New Market Cap:</b> $${marketCap}\n<b>📈 Old Market Cap:</b> $${token.marketCap}\n`
                    : `\n`
            } 🪙<b>Token Name: ${token.name}</b>\n\n🔗 <b>Symbol: </b> <a href="https://t.me/share/url?url=$${token.symbol}">$${token.symbol}</a></b>\n\n<b>Mint Address: </b><code>${token.mintAddress}</code>\n\n${
                holderIncrease
                    ? ` There has been an increase in fresh/aged wallets\n💰 <b>Fresh Wallets hold: ${(
                          (holderInfo.amountOfSupply / 10 ** 9) *
                          100
                      ).toFixed(2)}% of the total supply</b>\n <b>New wallet count:</b> ${holderInfo.owners.length} \n<b>Old wallet count:</b> ${token.owners} \n<b>🔥Fresh Wallets:</b>\n${walletLinks}`
                    : ``
            }`;

            if (marketCapIncrease || holderIncrease) {
                let users = await User.find({ monitor: true });
                for (let user of users) {
                    bot.sendPhoto(user.chatId, image, {
                        parse_mode: 'HTML',
                        caption: MESSAGE,
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: 'Snipe on Photon 💥',
                                        url: `https://photon-sol.tinyastro.io/en/lp/${token.mintAddress}`
                                    }
                                ],
                                [
                                    {
                                        text: 'Buy on pumpFun 🎲',
                                        url: `https://pump.fun/coin/${token.mintAddress}`
                                    }
                                ]
                            ]
                        }
                    });
                }
            }

            token.marketCap = marketCap;
            token.owners = holderInfo.owners.length;
            await token.save();
        }
    }
}

export async function processTokens(tokens){
    if(tokens.length > 1){
        for(let token of tokens){
                let marketCap = await getMarketCap(token.bondingCurveAddress) 
                let holderInfo = await getHolderInfo(token.mintAddress)
                token.owners = holderInfo?.owners?.length || 0
                token.marketCap = marketCap
                token.checked = true
                await token.save()
                if(marketCap >= 6000 && holderInfo){
                    let users = await User.find({monitor: true})
                    for(let user of users){
                        console.log("sending notifs boss")
                                    const walletLinks = holderInfo.owners
                                    .map(
                                        (wallet) =>
                                            `👛 <b>Balance:</b> ${wallet.amount.toFixed(0)} - <a href="https://solscan.io/account/${wallet.owner}">View Wallet (${wallet.owner.slice(0, 10)}...)</a>\n`
                                    )
                                    .join('');
                                    let image
                                    let uri = await (await fetch(token.uri)).json()
                                    if(uri.image  && uri.image.includes("ipfs")){
                                            image = uri.image.replace("https://ipfs.io/","https://pump.mypinata.cloud/")    
                                    }else if(uri.image){
                                            image = uri.image
                                    }
                                    console.log("Image: ",image)
                                    const MESSAGE = `<b> Fresh/Aged Wallets are buying 💎</b>\n\n🪙<b>Token Name: ${token.name}</b>\n🔗 <b>Symbol: </b> <a href="https://t.me/share/url?url=$${token.symbol}">$${token.symbol}</a>\n<b>📈 Market Cap:</b> $${Number(marketCap).toLocaleString("en-US")}\n<b>Mint Address: </b><code>${token.mintAddress}</code>\n\n💰 <b>Fresh Wallets hold: ${((holderInfo.amountOfSupply /10**9)*100).toFixed(2)}% of the total supply</b>\n\n<b>🔥 Fresh Wallets:</b>\n${walletLinks}`;
                                
                                    bot.sendPhoto(user.chatId, image, {
                                        parse_mode: 'HTML',
                                        caption: MESSAGE,
                                        reply_markup: {
                                            inline_keyboard: [
                                                [
                                                    { text: 'Snipe on Photon 💥', url: `https://photon-sol.tinyastro.io/en/lp/${token.mintAddress}` }
                                                ],
                                                [
                                                    { text: 'Buy on pumpFun 🎲', url: `https://pump.fun/coin/${token.mintAddress}` }
                                                ]
                                            ]
                                        }
                                    });
                            
                    }         
                
                }
               
                
        }
    
    }
}