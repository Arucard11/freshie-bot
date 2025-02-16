import { parentPort } from "worker_threads";
import { 
    signatureParse, 
    signatureParseSecond, 
    signatureParseThird 
} from "./utils/signatureParse.js";

import { 
    checkTopHoldersFirst, 
    checkTopHoldersMiddle, 
    checkTopHoldersLast, 
    checkTopHoldersFinal, 
    checkTopHoldersEnd, 
    checkTopHoldersComplete, 
    checkTopHoldersAgainFirst, 
    checkTopHoldersAgainSecond, 
    checkTopHoldersAgainThird, 
    checkTopHoldersAgainFourth, 
    checkTopHoldersAgainFifth, 
    checkTopHoldersAgainSixth 
} from "./utils/checkData.js";

import { connectDB } from "./DB/connect.js";
import dotenv from "dotenv"
dotenv.config()
// ✅ Connect to the database
connectDB();

// ✅ Function to execute a task in an infinite loop
async function executeTaskForever(task) {
    console.log(`🚀 Worker started task: ${task}`);
    
    try {
        while (true) {  // **Keeps the worker running forever**
            switch (task) {
                case 'first': await checkTopHoldersFirst(); break;
                case 'middle': await checkTopHoldersMiddle(); break;
                case 'last': await checkTopHoldersLast(); break;
                case 'final': await checkTopHoldersFinal(); break;
                case 'end': await checkTopHoldersEnd(); break;
                case 'complete': await checkTopHoldersComplete(); break;
                case 'parseSignatures': await signatureParse(); break;
                case 'parseSignaturesSecond': await signatureParseSecond(); break;
                case 'parseSignaturesThird': await signatureParseThird(); break;
                case 'checkTopHoldersAgainFirst': await checkTopHoldersAgainFirst(); break;
                case 'checkTopHoldersAgainSecond': await checkTopHoldersAgainSecond(); break;
                case 'checkTopHoldersAgainThird': await checkTopHoldersAgainThird(); break;
                case 'checkTopHoldersAgainFourth': await checkTopHoldersAgainFourth(); break;
                case 'checkTopHoldersAgainFifth': await checkTopHoldersAgainFifth(); break;
                case 'checkTopHoldersAgainSixth': await checkTopHoldersAgainSixth(); break;
                default:
                    throw new Error(`Unknown task: ${task}`);
            }

            console.log(`🔄 Task "${task}" completed, restarting...`);
            
            // 🔥 Prevent CPU overload: Small delay before restarting the task
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    } catch (err) {
        console.error(`❌ Worker error in task "${task}":`, err.message);
        parentPort.postMessage(`Error in task "${task}": ${err.message}`);
        process.exit(1); // Exit so the worker manager restarts it
    }
}

// ✅ Start listening for messages from the parent process
parentPort.on('message', async (task) => {
    executeTaskForever(task);
});

// ✅ Handle unexpected errors to prevent crashes
process.on('uncaughtException', (err) => {
    console.error(`❌ Uncaught Exception in worker:`, err);
    process.exit(1);
});
