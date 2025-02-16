import { Connection, PublicKey } from "@solana/web3.js"
import Token from "../DB/tokenSchema.js"
import { deserializeToken } from "./testDeserialize.js"
import { getBondingCurves } from "./getBondingCurve.js"
import Signature from "../DB/signatures.js"

const connection = new Connection(`https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`,"confirmed");
const pumpFunProgramId = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P");


export async function signatureParse() {

    while(true){
        let allSignatures = await Signature.find({})
        let start = Math.floor(allSignatures.length/3)
        let signatures = allSignatures.slice(0,start)
        if(signatures.length > 0){
            for(let signature of signatures){
                try{
                
                let tx = await connection.getParsedTransaction(signature.signature,{maxSupportedTransactionVersion: 0})
                if(tx && tx.transaction){
                for(let instruction  of tx.transaction.message.instructions) {
                    if(instruction.programId.toBase58() === pumpFunProgramId.toBase58() && instruction.accounts?.length === 14){
                    let mint = instruction.accounts[0].toBase58()
                    let deserialize = deserializeToken(instruction.data)
                    let {bondingCurve} = getBondingCurves(new PublicKey(mint))
                        let usedToken = await Token.findOne({mintAddress: mint})
                        if(!usedToken){
                            let token = new Token({
                            name: deserialize.name,
                            symbol: deserialize.symbol,
                            uri: deserialize.uri,
                            mintAddress: mint,
                            bondingCurveAddress: bondingCurve.toBase58()
                            })
                            // console.log("Mint Address: ",mint)
                            // console.log("token info: ",deserialize)
                            await token.save()
                            
                        }
                    }
                }
            }
            
            await Signature.findByIdAndDelete(signature._id)
          

        }catch(e){
            console.error(e)
            await Signature.findByIdAndDelete(signature._id)
    
        }
        }            
        
    }
    }    
}
export async function signatureParseSecond() {

    while(true){
        let allSignatures = await Signature.find({})
        let start = Math.floor(allSignatures.length/3)
        let remainder = allSignatures.length%3
        let signatures = allSignatures.slice(start,2*start + remainder)
        if(signatures.length > 0){
            for(let signature of signatures){
                try{
               
            let tx = await connection.getParsedTransaction(signature.signature,{maxSupportedTransactionVersion: 0})
                if(tx && tx.transaction){
                for(let instruction  of tx.transaction.message.instructions) {
                    if(instruction.programId.toBase58() === pumpFunProgramId.toBase58() && instruction.accounts?.length === 14){
                    let mint = instruction.accounts[0].toBase58()
                    let deserialize = deserializeToken(instruction.data)
                    let {bondingCurve} = getBondingCurves(new PublicKey(mint))
                        let usedToken = await Token.findOne({mintAddress: mint})
                        if(!usedToken){
                            let token = new Token({
                            name: deserialize.name,
                            symbol: deserialize.symbol,
                            uri: deserialize.uri,
                            mintAddress: mint,
                            bondingCurveAddress: bondingCurve.toBase58()
                            })
                            // console.log("Mint Address: ",mint)
                            // console.log("token info: ",deserialize)
                            await token.save()
                          
                        }
                    }
                }
            }
            
            await Signature.findByIdAndDelete(signature._id)
        }catch(e){
            console.error(e)
            await Signature.findByIdAndDelete(signature._id)
                   
        }
        }            
        
    }
    }    
}
export async function signatureParseThird() {

    while(true){
        let allSignatures = await Signature.find({})
        let start = Math.floor(allSignatures.length/3)
        let remainder = allSignatures.length%3
        let signatures = allSignatures.slice(2*start + remainder)
        if(signatures.length > 0){
            for(let signature of signatures){
                try{
                let tx = await connection.getParsedTransaction(signature.signature,{maxSupportedTransactionVersion: 0})
                if(tx && tx.transaction){
                for(let instruction  of tx.transaction.message.instructions) {
                    if(instruction.programId.toBase58() === pumpFunProgramId.toBase58() && instruction.accounts?.length === 14){
                    let mint = instruction.accounts[0].toBase58()
                    let deserialize = deserializeToken(instruction.data)
                    let {bondingCurve} = getBondingCurves(new PublicKey(mint))
                        let usedToken = await Token.findOne({mintAddress: mint})
                        if(!usedToken){
                            let token = new Token({
                            name: deserialize.name,
                            symbol: deserialize.symbol,
                            uri: deserialize.uri,
                            mintAddress: mint,
                            bondingCurveAddress: bondingCurve.toBase58()
                            })
                            // console.log("Mint Address: ",mint)
                            // console.log("token info: ",deserialize)
                            await token.save()
                            
                        }
                    }
                }
                }
                    await Signature.findByIdAndDelete(signature._id)
            
            
                }catch(e){
                    console.error(e)
                    await Signature.findByIdAndDelete(signature._id)      
                }
            }            
        
        }
    }    
}
