import * as dotenv from "dotenv"
dotenv.config({override: true})
import { Connection, PublicKey} from "@solana/web3.js";
import { deserializeToken } from "./utils/testDeserialize.js";
import Token from "./DB/tokenSchema.js"
import { connectDB } from "./DB/connect.js";
import { getBondingCurves } from "./utils/getBondingCurve.js";
import { checkTopHolders } from "./utils/checkData.js";
import TelegramBot from 'node-telegram-bot-api'
import User from "./DB/userSchema.js";

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

const connection = new Connection(`https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`,"confirmed");
const pumpFunProgramId = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P");  // replace with the program ID you want to track
connectDB()

async function delay(ms){
  return new Promise(resolve=>setTimeout(resolve, ms))
}
bot.onText(/\/start/, async(msg) => {
  const chatId = msg.chat.id;
  let user = await User.findOne({chatId: chatId})
  if(!user){
    user = new User({chatId})
    user.save().then(()=>{console.log("User saved")})
  }
  bot.sendMessage(chatId, 'Welcome to the Freshie Bot! I will notify you when a new token is created on pumpfun with new fresh wallets buying. Enjoy!', {
    reply_markup: {
        inline_keyboard: [
            [
                { text: 'Start Monitoring', callback_data: 'start_monitoring' } // Row 1
            ],
            [
                { text: 'Stop Monitoring', callback_data: 'stop_monitoring' } // Row 2
            ]
        ]
    }
});
});

bot.onText(/\/menu/, async(msg) => {
  bot.sendMessage(msg.chat.id, 'Press start monitoring to get notifs from me :)', {  
    reply_markup: {
      inline_keyboard:  [
        [
            { text: 'Start Monitoring', callback_data: 'start_monitoring' } // Row 1
        ],
        [
            { text: 'Stop Monitoring', callback_data: 'stop_monitoring' } // Row 2
        ]
    ]
    }
  });
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  if(query.data === 'start_monitoring'){
    bot.sendMessage(chatId, 'Monitoring started! You will be notified when a new token is created on pumpfun with new fresh wallets buying. Enjoy!');
    let user = await User.findOne({chatId: chatId})
    user.monitor = true
    user.save().then(()=>{console.log("User saved")})
  }else if(query.data === 'stop_monitoring'){ 
    bot.sendMessage(chatId, 'Monitoring stopped! You will no longer be notified when a new token is created on pumpfun with new fresh wallets buying.');
    let user = await User.findOne({ chatId: chatId })
    user.monitor = false
    user.save().then(()=>{console.log("User saved")})
  }
});
let coinsAdded = 0
connection.onLogs(pumpFunProgramId, async(log) => {
    const {signature,logs} = log
    if(logs.some(sentence => sentence.includes('Program log: Instruction: Create'))){
      await delay(1000)
      let tx = await connection.getParsedTransaction(signature,{maxSupportedTransactionVersion: 0})
        if(tx && tx.transaction){
          for(let instruction  of tx.transaction.message.instructions) {
            if(instruction.programId.toBase58() === pumpFunProgramId.toBase58() && instruction.accounts?.length === 14){
              let mint = instruction.accounts[0].toBase58()
              let deserialize = deserializeToken(instruction.data)
              let {bondingCurve} = getBondingCurves(new PublicKey(mint))
              try{
                  let usedToken = await Token.findOne({mintAddress: mint})
                  if(!usedToken){
                    let token = new Token({
                      name: deserialize.name,
                      symbol: deserialize.symbol,
                      uri: deserialize.uri,
                      mintAddress: mint,
                      bondingCurveAddress: bondingCurve.toBase58()
                    })
                    console.log("Mint Address: ",mint)
                    console.log("token info: ",deserialize)
                    await token.save()
                    coinsAdded++
                    console.log("Coins Added: ", coinsAdded)
                  }
              }catch(e){
                  console.error(e)
                  return
              }
            }
          }
        }
          
          
    }
    
});


checkTopHolders()