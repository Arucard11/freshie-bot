import * as dotenv from "dotenv"
dotenv.config({override: true})
import { Connection, PublicKey} from "@solana/web3.js";
import { Worker }  from  'worker_threads'
import Token from "./DB/tokenSchema.js"
import Signature from "./DB/signatures.js"
import { connectDB } from "./DB/connect.js";
import TelegramBot from 'node-telegram-bot-api'
import cron from 'node-cron'
import User from "./DB/userSchema.js";

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

const connection = new Connection(`https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`,"confirmed");
const pumpFunProgramId = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P");  // replace with the program ID you want to track
connectDB()

bot.onText(/\/start/, async(msg) => {
  const chatId = msg.chat.id;
  let user = await User.findOne({chatId: chatId})
  if(!user){
    user = new User({chatId})
    user.save().then(()=>{console.log("User saved")})
  }
  bot.sendMessage(chatId, 'Welcome to the Freshie Bot! I will notify you when a new token is created on pumpfun with fresh wallets buying. Enjoy!', {
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


  connection.onLogs(pumpFunProgramId, async(log) => {
    const {signature,logs} = log
    if(logs.some(sentence => sentence.includes('Program log: Instruction: Create'))){
      let sig = await Signature.findOne({signature})
      if(!sig){
        let newSig = new Signature({signature})
        await newSig.save()
      }
      
    }
    
  });
  

  const worker1 = new Worker('./worker.js');
  worker1.postMessage('first'); // Assign task "loop1" to worker1
  // Start Worker for Loop 2
  const worker2 = new Worker('./worker.js');
  worker2.postMessage('middle'); // Assign task "loop2" to worker2
  // Start Worker for Loop 3
  const worker3 = new Worker('./worker.js');
  worker3.postMessage('last'); // Assign task "loop3" to worker3
  
  const worker4 = new Worker('./worker.js');
  worker4.postMessage('parseSignatures');

  const worker5 = new Worker('./worker.js');
  worker5.postMessage('parseSignaturesSecond');

  const worker6 = new Worker('./worker.js');
  worker6.postMessage('checkAgainFirst');
  
  const worker7 = new Worker('./worker.js');
  worker7.postMessage('checkAgainSecond');
  
  const worker8 = new Worker('./worker.js');
  worker8.postMessage('parseSignaturesThird');
  
  const worker9 = new Worker('./worker.js');
  worker9.postMessage('final');

  const worker10 = new Worker('./worker.js');
  worker10.postMessage('end');

  const worker11 = new Worker('./worker.js');
  worker11.postMessage('complete');

  const workers = [worker1, worker2, worker3, worker4, worker5, worker6, worker7,worker8,worker9,worker10,worker11];
  
  workers.forEach((worker, index) => {
    worker.on('message', (msg) => {
      console.log(`Message from Loop ${index + 1}:`, msg);
    });
  
    worker.on('error', (err) => {
      console.error(`Error in Loop ${index + 1}:`, err);
    });
  
    worker.on('exit', (code) => {
      console.log(`Loop ${index + 1} exited with code ${code}`);
    });
  });

  cron.schedule('0 */2 * * *', async() => {
    const TWO_HOURS_AGO = Date.now() - 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    await Token.deleteMany({
      checked: true, // Match items where checked is true
      createdAt: { $lt: TWO_HOURS_AGO }, // Match items created more than 6 hours ago
    });
    console.log('Deleted tokens checked more than 2 hours ago');
  });
  
  
 
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('SIGINT', () => {
    console.log('Shutting down workers...');
    workers.forEach((worker) => worker.terminate());
    process.exit(0);
  });
  // console.log('Main thread is running...');