import { PublicKey } from "@solana/web3.js";
import  {
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
  } from "@solana/spl-token"
  const PUMP_FUN_PROGRAM = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P");

 


  export const  getBondingCurves = (mint_account)=>{

    const [bondingCurve] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("bonding-curve"),  
        mint_account.toBuffer()
      ],  
      PUMP_FUN_PROGRAM);
    
    const [associatedBondingCurve] = PublicKey.findProgramAddressSync(
      [
        bondingCurve.toBuffer(), 
        TOKEN_PROGRAM_ID.toBuffer(),
        mint_account.toBuffer(), 
      ], 
      ASSOCIATED_TOKEN_PROGRAM_ID);
  
      return {bondingCurve,associatedBondingCurve}
  }