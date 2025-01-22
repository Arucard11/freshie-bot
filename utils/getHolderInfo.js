import { Connection,PublicKey } from '@solana/web3.js'
import * as dotenv from "dotenv"
dotenv.config()
import { getBondingCurves } from './getBondingCurve.js'

const connection = new Connection(`https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`)

export async function getHolderInfo(mint) {
  await new Promise(resolve => setTimeout(resolve, 5000)) 
  let {bondingCurve,associatedBondingCurve} = getBondingCurves(new PublicKey(mint))
  console.log("Mint largest holders: ",mint)
  const largestHolders = (await connection.getTokenLargestAccounts(new PublicKey(mint))).value
  let owners = []
  let amountOfSupply = 0
  
  if(largestHolders.length >= 3){
    for(let account of largestHolders){
      await new Promise(resolve => setTimeout(resolve, 1000))
      let accountData = await connection.getParsedAccountInfo(account.address)
      if(accountData && accountData.value &&  accountData.value.data){
      let owner = accountData.value.data.parsed.info.owner
      await new Promise(resolve => setTimeout(resolve, 1000))
      let signatures = await connection.getSignaturesForAddress(new PublicKey(owner), {limit: 20})
      
      if(signatures.length < 20 && owner !== bondingCurve.toBase58() && owner !== associatedBondingCurve.toBase58() && owner !== owners[owners.length-1] ){
        console.log("Owner: ",owner)
        owners.push(owner)
        amountOfSupply += account.uiAmount      
      }
    }
    if(owners.length >= 10){
      console.log("Owners: ",owners.length)
      console.log("Amount of supply: ",amountOfSupply)
      return {owners,amountOfSupply}
    }
  }
  }
  if(owners.length >= 3){
    console.log("Owners: ",owners.length)
    console.log("Amount of supply: ",amountOfSupply)
    return {owners,amountOfSupply}

  }else return null
}