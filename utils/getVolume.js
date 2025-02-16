import { Connection, PublicKey } from "@solana/web3.js";
import "dotenv/config"; // Load environment variables

// Use Helius RPC for better rate limits & reliability
const connection = new Connection(`https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`);
//https://frontend-api-v3.pump.fun/sol-price
const tokenMint = new PublicKey("So11111111111111111111111111111111111111112"); // Replace with actual token mint

 // Replace with actual token mint
 function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getCoinPriceUsd(){

}

async function getTokenVolumeLastHour() {
    const now = Math.floor(Date.now() / 1000); // Current timestamp (seconds)
    const oneHourAgo = now - 3600; // 1 hour ago

    try {
        const signatures = await connection.getSignaturesForAddress(tokenMint, { limit: 200 });
        let totalVolume = 0;

        for (const sig of signatures) {
            if (sig.blockTime < oneHourAgo) break; // Stop if transaction is older than 1 hour
            delay(500)
            // ✅ Use `maxSupportedTransactionVersion`
            const tx = await connection.getTransaction(sig.signature, {
                maxSupportedTransactionVersion: 0,
                commitment: "confirmed"
            });

            if (tx && tx.meta) {
                const preBalances = tx.meta.preTokenBalances || [];
                const postBalances = tx.meta.postTokenBalances || [];

                preBalances.forEach((preBalance, index) => {
                    const postBalance = postBalances[index];

                    // ✅ Check if postBalance exists before accessing it
                    if (!postBalance || !preBalance) return;

                    // ✅ Ensure `uiTokenAmount` exists before accessing it
                    const preAmount = preBalance.uiTokenAmount?.uiAmount || 0;
                    const postAmount = postBalance.uiTokenAmount?.uiAmount || 0;

                    if (preBalance.owner !== postBalance.owner) {
                        const change = Math.abs(postAmount - preAmount);
                        totalVolume += change;
                    }
                });
            }
        }

        console.log(`Estimated Volume in Last Hour: ${totalVolume} tokens`);
        return totalVolume;
    } catch (error) {
        console.error("Error fetching token volume:", error);
    }
}

getTokenVolumeLastHour();