import { Connection,PublicKey } from '@solana/web3.js'
import * as dotenv from "dotenv"
dotenv.config()
import { getBondingCurves } from './getBondingCurve.js'

const connection = new Connection(`https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`)

let validCoins = 0
export async function getHolderInfo(mint) {
  let largestHolders
  let owners = []
  let amountOfSupply = 0
  await new Promise(resolve => setTimeout(resolve, 1000)) 
  let {bondingCurve,associatedBondingCurve} = getBondingCurves(new PublicKey(mint))
  try{
     largestHolders = (await connection.getTokenLargestAccounts(new PublicKey(mint))).value
    if(largestHolders.length >= 3){
      for(let account of largestHolders){
        let accountData = await connection.getParsedAccountInfo(account.address)
        if(accountData && accountData.value &&  accountData.value.data){
          let owner = accountData.value.data.parsed.info.owner
          let signatures = await connection.getSignaturesForAddress(new PublicKey(owner), {limit: 20})
          if(signatures.length < 20 && owner !== bondingCurve.toBase58() && owner !== associatedBondingCurve.toBase58() && owner !== owners[owners.length-1] && account.uiAmount > 0){
            owners.push({owner,amount:account.uiAmount})
            amountOfSupply += account.uiAmount      
          }
        }
        if(owners.length >= 10){
          validCoins++
          console.log("valid coin found",validCoins)
          return {owners,amountOfSupply}
        }
      }
    }
  }catch(err){
    if(err.code === -32019) {
      largestHolders = (await connection.getTokenLargestAccounts(new PublicKey(mint))).value
      console.error('Failed to query long-term storage; retrying...');
    }
  }
  if(owners.length >= 3){
    validCoins++
    console.log("valid coin found",validCoins)
    return {owners,amountOfSupply}
  }else return null
}