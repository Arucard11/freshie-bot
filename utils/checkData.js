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

let checkedCoins = 0

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
        
        await new Promise(resolve => setTimeout(resolve, 3000))
        const {marketcap} = await(await fetch(`https://advanced-api.pump.fun/coins/metadata/${mint}`)).json()
        return marketcap       
}
//0-25
export async function checkTopHoldersFirst(){
   while(true){
    let allTokens = await Token.find({})
    let first = Math.floor(allTokens.length/6)
    let tokens = allTokens.slice(0,first)
        if(tokens.length > 0){
            for(let token of tokens){
                let marketCap = await getMarketCap(token.mintAddress)
                console.log("Market Cap First: ",marketCap)
                if(marketCap >= 8000 && !token.checked){
                        // await new Promise(resolve => setTimeout(resolve, 1000))
                        let holderInfo = await getHolderInfo(token.mintAddress)
                        if(holderInfo){
                            let users = await User.find({monitor: true})
                            for(let user of users){
                                await new Promise(resolve => setTimeout(resolve, 1000))
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
                            const MESSAGE = `<b> Fresh/Aged Wallets are buying 💎</b>\n\n<b>Mint Address: </b><code>${token.mintAddress}</code>\n\n<b>📈 Market Cap:</b> $${marketCap}\n🪙<b>Token Name: ${token.name}</b>\n\n🔗 <b>Symbol: </b> <a href="https://t.me/share/url?url=$${token.symbol}">$${token.symbol}</a>\n💰 <b>Fresh Wallets hold: ${((holderInfo.amountOfSupply /10**9)*100).toFixed(2)}% of the total supply</b>\n\n<b>🔥 Fresh Wallets:</b>\n${walletLinks}`;
                            
                                bot.sendPhoto(user.chatId,image, {
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
                token.checked = true
                token.marketCap = marketCap
                await token.save()
                checkedCoins++
                console.log("Checked Coins: ",checkedCoins)
                console.log("Saved Market Cap: ",token.marketCap)
            }
        
        }
    }
}
//25-50
export async function checkTopHoldersMiddle(){
    while(true){
     let allTokens = await Token.find({})
     let second = Math.floor(allTokens.length/6)
     let remainder = allTokens.length % 6
     let tokens = allTokens.slice(second, (2 * second))
         if(tokens.length > 10){
             for(let token of tokens){
                 let marketCap = await getMarketCap(token.mintAddress)
                 console.log("Market Cap Middle: ",marketCap)
                 if(marketCap >= 8000 && !token.checked){
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
                             
                                 let image
                                 let uri = await (await fetch(token.uri)).json()
                                 if(uri.image  && uri.image.includes("ipfs")){
                                     image = uri.image.replace("https://ipfs.io/","https://pump.mypinata.cloud/")    
                                 }else if(uri.image){
                                     image = uri.image
                                 }
                            console.log("Image: ",image)
                             const MESSAGE = `<b> Fresh/Aged Wallets are buying 💎</b>\n\n<b>Mint Address: </b><code>${token.mintAddress}</code>\n\n<b>📈 Market Cap:</b> $${marketCap}\n🪙<b>Token Name: ${token.name}</b>\n\n🔗 <b>Symbol: </b> <a href="https://t.me/share/url?url=$${token.symbol}">$${token.symbol}</a>\n💰 <b>Fresh Wallets hold: ${((holderInfo.amountOfSupply /10**9)*100).toFixed(2)}% of the total supply</b>\n\n<b>🔥 Fresh Wallets:</b>\n${walletLinks}`;
                             
                                 bot.sendPhoto(user.chatId,image, {
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

                 token.checked = true
                 token.marketCap = marketCap
                 await token.save()
                 checkedCoins++
                 console.log("Checked Coins: ",checkedCoins)
                 console.log("Saved Market Cap: ",token.marketCap)
             }
         
         }
     }
}
//50-75
export async function checkTopHoldersLast(){
    while(true){
        let allTokens = await Token.find({})
        let last = Math.floor(allTokens.length/6)
        let remainder = allTokens.length % 6
        let tokens = allTokens.slice(2*last, (last*3))
         if(tokens.length > 10){
             for(let token of tokens){
                 let marketCap = await getMarketCap(token.mintAddress)
                 console.log("Market Cap Last: ",marketCap)
                 if(marketCap >= 8000 && !token.checked){
                         // await new Promise(resolve => setTimeout(resolve, 1000))
                         let holderInfo = await getHolderInfo(token.mintAddress)
                         if(holderInfo){
                             let users = await User.find({monitor: true})
                             for(let user of users){
                                 await new Promise(resolve => setTimeout(resolve, 1000))
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
                             const MESSAGE = `<b> Fresh/Aged Wallets are buying 💎</b>\n\n<b>Mint Address: </b><code>${token.mintAddress}</code>\n\n<b>📈 Market Cap:</b> $${marketCap}\n🪙<b>Token Name: ${token.name}</b>\n\n🔗 <b>Symbol: </b> <a href="https://t.me/share/url?url=$${token.symbol}">$${token.symbol}</a>\n💰 <b>Fresh Wallets hold: ${((holderInfo.amountOfSupply /10**9)*100).toFixed(2)}% of the total supply</b>\n\n<b>🔥 Fresh Wallets:</b>\n${walletLinks}`;
                             
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
                 token.checked = true
                 token.marketCap = marketCap
                 await token.save()
                 checkedCoins++
                 console.log("Checked Coins: ",checkedCoins)
                 console.log("Saved Market Cap: ",token.marketCap)
            }
         
        }
    }
}
export async function checkTopHoldersFinal(){
    while(true){
        let allTokens = await Token.find({})
        let last = Math.floor(allTokens.length/6)
        let remainder = allTokens.length % 6
        let tokens = allTokens.slice( 3*last, (last*4))
         if(tokens.length > 10){
             for(let token of tokens){
                 let marketCap = await getMarketCap(token.mintAddress)
                 console.log("Market Cap final: ",marketCap)
                 if(marketCap >= 8000 && !token.checked){
                         // await new Promise(resolve => setTimeout(resolve, 1000))
                         let holderInfo = await getHolderInfo(token.mintAddress)
                         if(holderInfo){
                             let users = await User.find({monitor: true})
                             for(let user of users){
                                 await new Promise(resolve => setTimeout(resolve, 1000))
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
                             const MESSAGE = `<b> Fresh/Aged Wallets are buying 💎</b>\n\n<b>Mint Address: </b><code>${token.mintAddress}</code>\n\n<b>📈 Market Cap:</b> $${marketCap}\n🪙<b>Token Name: ${token.name}</b>\n\n🔗 <b>Symbol: </b> <a href="https://t.me/share/url?url=$${token.symbol}">$${token.symbol}</a>\n💰 <b>Fresh Wallets hold: ${((holderInfo.amountOfSupply /10**9)*100).toFixed(2)}% of the total supply</b>\n\n<b>🔥 Fresh Wallets:</b>\n${walletLinks}`;
                             
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
                 token.checked = true
                 token.marketCap = marketCap
                 await token.save()
                 checkedCoins++
                 console.log("Checked Coins: ",checkedCoins)
                 console.log("Saved Market Cap: ",token.marketCap)
            }
         
        }
    }
}
export async function checkTopHoldersEnd(){
    while(true){
        let allTokens = await Token.find({})
        let last = Math.floor(allTokens.length/6)
        let remainder = allTokens.length % 6
        let tokens = allTokens.slice( (4*last), (5*last))
         if(tokens.length > 10){
             for(let token of tokens){
                 let marketCap = await getMarketCap(token.mintAddress)
                 console.log("Market Cap End: ",marketCap)
                 if(marketCap >= 8000 && !token.checked){
                         // await new Promise(resolve => setTimeout(resolve, 1000))
                         let holderInfo = await getHolderInfo(token.mintAddress)
                         if(holderInfo){
                             let users = await User.find({monitor: true})
                             for(let user of users){
                                 await new Promise(resolve => setTimeout(resolve, 1000))
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
                             const MESSAGE = `<b> Fresh/Aged Wallets are buying 💎</b>\n\n<b>Mint Address: </b><code>${token.mintAddress}</code>\n\n<b>📈 Market Cap:</b> $${marketCap}\n🪙<b>Token Name: ${token.name}</b>\n\n🔗 <b>Symbol: </b> <a href="https://t.me/share/url?url=$${token.symbol}">$${token.symbol}</a>\n💰 <b>Fresh Wallets hold: ${((holderInfo.amountOfSupply /10**9)*100).toFixed(2)}% of the total supply</b>\n\n<b>🔥 Fresh Wallets:</b>\n${walletLinks}`;
                             
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
                 token.checked = true
                 token.marketCap = marketCap
                 await token.save()
                 checkedCoins++
                 console.log("Checked Coins: ",checkedCoins)
                 console.log("Saved Market Cap: ",token.marketCap)
            }
         
        }
    }
}
export async function checkTopHoldersComplete(){
    while(true){
        let allTokens = await Token.find({})
        let last = Math.floor(allTokens.length/6)
        let remainder = allTokens.length % 6
        let tokens = allTokens.slice( (5*last),(5*last) + remainder)
         if(tokens.length > 10){
             for(let token of tokens){
                 let marketCap = await getMarketCap(token.mintAddress)
                 console.log("Market Cap Complete: ",marketCap)
                 if(marketCap >= 8000 && !token.checked){
                         // await new Promise(resolve => setTimeout(resolve, 1000))
                         let holderInfo = await getHolderInfo(token.mintAddress)
                         if(holderInfo){
                             let users = await User.find({monitor: true})
                             for(let user of users){
                                 await new Promise(resolve => setTimeout(resolve, 1000))
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
                             const MESSAGE = `<b> Fresh/Aged Wallets are buying 💎</b>\n\n<b>Mint Address: </b><code>${token.mintAddress}</code>\n\n<b>📈 Market Cap:</b> $${marketCap}\n🪙<b>Token Name: ${token.name}</b>\n\n🔗 <b>Symbol: </b> <a href="https://t.me/share/url?url=$${token.symbol}">$${token.symbol}</a>\n💰 <b>Fresh Wallets hold: ${((holderInfo.amountOfSupply /10**9)*100).toFixed(2)}% of the total supply</b>\n\n<b>🔥 Fresh Wallets:</b>\n${walletLinks}`;
                             
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
                 token.checked = true
                 token.marketCap = marketCap
                 await token.save()
                 checkedCoins++
                 console.log("Checked Coins: ",checkedCoins)
                 console.log("Saved Market Cap: ",token.marketCap)
            }
         
        }
    }
}

export async function checkTopHoldersAgainFirst(){
    const THIRTY_MINUTES_AGO = new Date(Date.now() - 30 * 60 * 1000);  

    while(true){
     let allTokens = await Token.find({checked:true, createdAt: { $lt: THIRTY_MINUTES_AGO }})
     let first = Math.floor(allTokens.length/2)
     let tokens = allTokens.slice(0,first)
         if(tokens.length > 0){
             for(let token of tokens){
                 let marketCap = await getMarketCap(token.mintAddress)
                 if(marketCap >= token.marketCap * 1.1){
                         // await new Promise(resolve => setTimeout(resolve, 1000))
                             let users = await User.find({monitor: true})
                             for(let user of users){
                                 await new Promise(resolve => setTimeout(resolve, 1000))
                            let image
                            let uri = await (await fetch(token.uri)).json()
                            if(uri.image  && uri.image.includes("ipfs")){
                                image = uri.image.replace("https://ipfs.io/","https://pump.mypinata.cloud/")    
                            }else if(uri.image){
                                image = uri.image
                            }
                            console.log("Image: ",image)
                             const MESSAGE = `<b> This coins Market Cap has increased! </b>\n\n<b>Mint Address: </b><code>${token.mintAddress}</code>\n\n<b>📈 New Market Cap:</b> $${marketCap}\n<b>📈 Old Market Cap:</b> $${token.marketCap}\n🪙<b>Token Name: ${token.name}</b>\n\n🔗 <b>Symbol: </b> <a href="https://t.me/share/url?url=$${token.symbol}">$${token.symbol}</a>\n`;
                             
                                 bot.sendPhoto(user.chatId,image, {
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
}
export async function checkTopHoldersAgainSecond(){
    const THIRTY_MINUTES_AGO = new Date(Date.now() - 30 * 60 * 1000);
    while(true){
        let allTokens = await Token.find({checked:true, createdAt: { $lt: THIRTY_MINUTES_AGO }})
        let first = Math.floor(allTokens.length/2)
        let tokens = allTokens.slice(first)
         if(tokens.length > 0){
             for(let token of tokens){
                 let marketCap = await getMarketCap(token.mintAddress)
                 if(marketCap >= token.marketCap * 1.1){
                         // await new Promise(resolve => setTimeout(resolve, 1000))
                        
                             let users = await User.find({monitor: true})
                             for(let user of users){
                                 await new Promise(resolve => setTimeout(resolve, 1000))
                            let image
                            let uri = await (await fetch(token.uri)).json()
                            if(uri.image  && uri.image.includes("ipfs")){
                                image = uri.image.replace("https://ipfs.io/","https://pump.mypinata.cloud/")    
                            }else if(uri.image){
                                image = uri.image
                            }
                            console.log("Image: ",image)
                             const MESSAGE = `<b> This coins Market Cap has increased! </b>\n\n<b>Mint Address: </b><code>${token.mintAddress}</code>\n\n<b>📈 New Market Cap:</b> $${marketCap}\n<b>📈 Old Market Cap:</b> $${token.marketCap}\n🪙<b>Token Name: ${token.name}</b>\n\n🔗 <b>Symbol: </b> <a href="https://t.me/share/url?url=$${token.symbol}">$${token.symbol}</a>\n`;
                             
                                 bot.sendPhoto(user.chatId,image, {
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
}
