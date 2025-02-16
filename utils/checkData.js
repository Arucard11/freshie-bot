import Token from '../DB/tokenSchema.js';
import { processTokens,checkTokens } from './processTokens.js';

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function checkTopHoldersFirst(){
    
    try{  
        while(true){
            let allTokens = await Token.find({checked:false})
            let first = Math.floor(allTokens.length/6)
            let tokens = allTokens.slice(0,first-1)
            console.log("Tokens First: ",tokens.length)
            await processTokens(tokens)
            await delay(5000)
        }
    }catch(e){
        console.log(e)
        
    }  
}

export async function checkTopHoldersMiddle(){
    
    try{
        while(true){
        let allTokens = await Token.find({checked:false})
        let second = Math.floor(allTokens.length/6)
        let tokens = allTokens.slice(second, (2 * second)-1)
        console.log("Tokens Middle: ",tokens.length)
        await processTokens(tokens)
        await delay(5000)
        }

    }catch(e){
        console.log(e)
    }
}

export async function checkTopHoldersLast(){
   
    try{
        while(true){
            let allTokens = await Token.find({checked:false})
            let last = Math.floor(allTokens.length/6)
            let tokens = allTokens.slice(2*last, (last*3)-1)
            console.log("Tokens Last: ",tokens.length)
            await processTokens(tokens)
            await delay(5000)
        }
    }catch(e){
        console.log(e)
    }    
}
export async function checkTopHoldersFinal(){
   
    try{
        while(true){
            let allTokens = await Token.find({checked:false})
            let last = Math.floor(allTokens.length/6)
            let tokens = allTokens.slice( 3*last, (last*4)-1)
            console.log("Tokens Final: ",tokens.length)
            await processTokens(tokens)
            await delay(5000)
        }
    }catch(e){
        console.log(e)
    }    
}
export async function checkTopHoldersEnd(){
    
    try{
        while(true){
            let allTokens = await Token.find({checked:false})
            let last = Math.floor(allTokens.length/6)
            let tokens = allTokens.slice( (4*last), (5*last)-1)
            console.log("Tokens End: ",tokens.length)
            await processTokens(tokens)
            await delay(5000)
        }
    }catch(e){
        console.log(e)
    }    
}
export async function checkTopHoldersComplete(){
    
    try{
        while(true){
            let allTokens = await Token.find({checked:false})
            let last = Math.floor(allTokens.length/6)
            let remainder = allTokens.length % 6
            let tokens = allTokens.slice( (5*last) +remainder)
            console.log("Tokens Complete: ",tokens.length)
            await processTokens(tokens)
            await delay(5000)
        }
    }catch(e){
        console.log(e)
    }    
}

export async function checkTopHoldersAgainFirst() {
   
    await delay(30 * 60 * 1000)

    const FIFTEEN_MINUTES_AGO = new Date(Date.now() - 15 * 60 * 1000);
    const ONE_HOUR_AGO = new Date(Date.now() - 60 * 60 * 1000);
    while (true) {
        let allTokens = await Token.find({ checked: true, createdAt: { $gte: ONE_HOUR_AGO, $lte: FIFTEEN_MINUTES_AGO } });
        let first = Math.floor(allTokens.length / 2);
        let tokens = allTokens.slice(0, first);
        await checkTokens(tokens, "First check worker one");
    }
}

export async function checkTopHoldersAgainSecond() {
    await delay(30 * 60 * 1000)
    const FIFTEEN_MINUTES_AGO = new Date(Date.now() - 15 * 60 * 1000);
    const ONE_HOUR_AGO = new Date(Date.now() - 60 * 60 * 1000);
    while (true) {
        let allTokens = await Token.find({ checked: true, createdAt: { $gte: ONE_HOUR_AGO, $lte: FIFTEEN_MINUTES_AGO } });
        let first = Math.floor(allTokens.length / 2);
        let tokens = allTokens.slice(first);
        await checkTokens(tokens, "First check worker two");
    }
}

export async function checkTopHoldersAgainThird() {
    await delay(150 * 60 * 1000)
    const ONE_HOUR_THIRTY_MINUTES_AGO = new Date(Date.now() - 90 * 60 * 1000);
    const TWO_HOURS_AGO = new Date(Date.now() - 120 * 60 * 1000);
    while (true) {
        let allTokens = await Token.find({ checked: true, createdAt: { $gte: TWO_HOURS_AGO, $lte: ONE_HOUR_THIRTY_MINUTES_AGO } });
        let first = Math.floor(allTokens.length / 2);
        let tokens = allTokens.slice(0, first);
        await checkTokens(tokens, "Second check worker one");
    }
}

export async function checkTopHoldersAgainFourth() {
    await delay(150 * 60 * 1000)
    const ONE_HOUR_THIRTY_MINUTES_AGO = new Date(Date.now() - 90 * 60 * 1000);
    const TWO_HOURS_AGO = new Date(Date.now() - 120 * 60 * 1000);
    while (true) {
        let allTokens = await Token.find({ checked: true, createdAt: { $gte: TWO_HOURS_AGO, $lte: ONE_HOUR_THIRTY_MINUTES_AGO } });
        let first = Math.floor(allTokens.length / 2);
        let tokens = allTokens.slice(first);
        await checkTokens(tokens, "Second check worker two");
    }
}

export async function checkTopHoldersAgainFifth() {
    await delay(280 * 60 * 1000)
    const TWO_HOURS_THIRTY_MINUTES_AGO = new Date(Date.now() - 150 * 60 * 1000);
    const THREE_HOURS_AGO = new Date(Date.now() - 180 * 60 * 1000);
    while (true) {
        let allTokens = await Token.find({ checked: true, createdAt: { $gte: THREE_HOURS_AGO, $lte: TWO_HOURS_THIRTY_MINUTES_AGO } });
        let first = Math.floor(allTokens.length / 2);
        let tokens = allTokens.slice(0, first);
        await checkTokens(tokens, "Third check worker one");
    }
}

export async function checkTopHoldersAgainSixth() {
    await delay(280 * 60 * 1000)
    const TWO_HOURS_THIRTY_MINUTES_AGO = new Date(Date.now() - 150 * 60 * 1000);
    const THREE_HOURS_AGO = new Date(Date.now() - 180 * 60 * 1000);
    while (true) {
        let allTokens = await Token.find({ checked: true, createdAt: { $gte: THREE_HOURS_AGO, $lte: TWO_HOURS_THIRTY_MINUTES_AGO } });
        let first = Math.floor(allTokens.length / 2);
        let tokens = allTokens.slice(first);
        await checkTokens(tokens, "Third check worker two");
    }
}