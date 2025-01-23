import { parentPort } from "worker_threads";
import { signatureParse,signatureParseSecond,signatureParseThird } from "./utils/signatureParse.js";
import{checkTopHoldersFirst,checkTopHoldersMiddle,checkTopHoldersLast,checkTopHoldersAgainFirst,checkTopHoldersAgainSecond} from "./utils/checkData.js"
import { connectDB } from "./DB/connect.js";

connectDB();
// Start the appropriate loop based on the message from the parent
parentPort.on('message', async (task) => {
    try {
      console.log(`Worker received task: ${task}`);
      switch (task) {
        case 'first':
          await checkTopHoldersFirst();
          break;
        case 'middle':
          await checkTopHoldersMiddle();
          break;
        case 'last':
          await checkTopHoldersLast();
          break;
        case 'parseSignatures':
          await signatureParse();
          break;
        case 'parseSignaturesSecond':
          await signatureParseSecond();
          break;
        case 'parseSignaturesThird':
          await signatureParseThird();
          break;
        case 'checkAgainFirst':
          await checkTopHoldersAgainFirst();
          break;
        case 'checkAgainSecond':
          await checkTopHoldersAgainSecond();
          break;
        default:
          throw new Error(`Unknown task: ${task}`);
      }
  
      parentPort.postMessage(`Task "${task}" completed successfully.`);
    } catch (err) {
      console.error(`Error in task "${task}":`, err.message);
      parentPort.postMessage(`Error in task "${task}": ${err.message}`);
    }
  });