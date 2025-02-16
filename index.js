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
  
  // Task assignments for workers
  const tasks = [
    'first',
    'middle',
    'last',
    'final',
    'end',
    'complete',
    'parseSignatures',
    'parseSignaturesSecond',
    'parseSignaturesThird',
    'checkTopHoldersAgainFirst',
    'checkTopHoldersAgainSecond',
    'checkTopHoldersAgainThird',
    'checkTopHoldersAgainFourth',
    'checkTopHoldersAgainFifth',
    'checkTopHoldersAgainSixth'
];

// Function to create a new worker and assign the appropriate task
function createWorker(index) {
    const worker = new Worker('./worker.js'); // Ensure correct path
    worker.postMessage(tasks[index]);
    console.log(`Worker ${index + 1} assigned task: "${tasks[index]}"`);
    setupWorkerListeners(worker, index);
    return worker;
}

// Initialize all workers
let workers = tasks.map((_, index) => createWorker(index));

// Function to restart a worker **only if it failed**
function restartWorker(index, force = false) {
    if (!force) {
        console.log(`✅ Worker ${index + 1} completed successfully. Not restarting.`);
        return;
    }
    console.log(`🔄 Restarting Worker ${index + 1}...`);
    workers[index] = createWorker(index); // Create a new worker
}

// Set up event listeners for each worker
function setupWorkerListeners(worker, index) {
    worker.on('message', (msg) => {
        console.log(`📩 Message from Worker ${index + 1}:`, msg);

        // ✅ Only restart the worker if it **failed**, not if it completed successfully
        if (msg.includes("Error")) {
            console.log(`⚠️ Worker ${index + 1} encountered an error. Restarting...`);
            restartWorker(index, true);
        }
    });

    worker.on('error', (err) => {
        console.error(`❌ Error in Worker ${index + 1}:`, err);
        console.log("Restarting worker due to error...");
        restartWorker(index, true);
    });

    worker.on('exit', (code) => {
        if (code === 0) {
            console.log(`✅ Worker ${index + 1} exited successfully.`);
        } else {
            console.log(`⚠️ Worker ${index + 1} exited with error code ${code}. Restarting...`);
            restartWorker(index, true);
        }
    });
}

// Ensure all initial workers have event listeners
workers.forEach((worker, index) => setupWorkerListeners(worker, index));

// ✅ Graceful shutdown on CTRL + C
process.on('SIGINT', () => {
    console.log("\n🛑 Gracefully shutting down workers...");

    workers.forEach((worker, index) => {
        console.log(`🛑 Stopping Worker ${index + 1}...`);
        worker.terminate();
    });

    console.log("✅ All workers stopped. Exiting process.");
    process.exit(0);
});
  // console.log('Main thread is running...');
cron.schedule('0 */6 * * *', async () => {
          try {
              const SIX_HOURS_AGO = new Date(Date.now() - 6 * 60 * 60 * 1000); // 6 hours ago
              
              // Delete tokens checked more than 6 hours ago
              const result = await Token.deleteMany({
                  checked: true, // Match items where checked is true
                  createdAt: { $lte: SIX_HOURS_AGO }, // Match items created more than 6 hours ago
              });
              
              let notChecked = await Token.find({ checked: false });
              console.log(`Deleted ${result.deletedCount} tokens checked more than 6 hours ago. ${notChecked.length} not checked`);
              bot.sendMessage(1767667773, `Deleted ${result.deletedCount} tokens checked more than 6 hours ago. ${notChecked.length} not checked`);
          } catch (error) {
              console.error('Error deleting old tokens:', error);                
          }
});