
/**
 * Calculates the buy price for a given token amount using bonding curve logic.
 */
function getBuyPrice(tokenAmount, bondingCurve) {
    if (!bondingCurve || tokenAmount.lte(new BN(0))) return new BN(0);

    let virtualSolReserves = bondingCurve.virtualSolReserves;
    let virtualTokenReserves = bondingCurve.virtualTokenReserves;
    let realTokenReserves = bondingCurve.realTokenReserves;

    let newSolReserves = virtualSolReserves.mul(virtualTokenReserves)
        .div(virtualSolReserves.add(tokenAmount))
        .add(new BN(1));

    let tokensToBuy = virtualTokenReserves.sub(newSolReserves);
    tokensToBuy = BN.min(tokensToBuy, realTokenReserves);

    return tokensToBuy;
}

/**
 * Calculates the sell price for a given token amount using bonding curve logic.
 */
function getSellPrice(tokenAmount, bondingCurve) {
    if (!bondingCurve || tokenAmount.lte(new BN(0))) return new BN(0);

    let virtualSolReserves = bondingCurve.virtualSolReserves;
    let virtualTokenReserves = bondingCurve.virtualTokenReserves;

    let solReceived = tokenAmount.mul(virtualSolReserves)
        .div(virtualTokenReserves.add(tokenAmount));

    return solReceived;
}

/**
 * Computes the market capitalization in USD.
 */
function getMarketCap(bondingCurve, solPrice) {
    if (!bondingCurve) return 0;

    let virtualSolReserves = bondingCurve.virtualSolReserves;
    let virtualTokenReserves = bondingCurve.virtualTokenReserves;
    let tokenTotalSupply = bondingCurve.tokenTotalSupply;

    if (virtualTokenReserves.eq(new BN(0))) return 0;

    let marketCap = tokenTotalSupply.mul(virtualSolReserves)
        .div(virtualTokenReserves)
        .toNumber() / 1e9 * solPrice;

    return marketCap.toLocaleString("en-US");
}

/**
 * Computes the final adjusted market capitalization.
 */
function getFinalMarketCap(bondingCurve, solPrice) {
    if (!bondingCurve) return 0;

    let virtualSolReserves = bondingCurve.virtualSolReserves;
    let virtualTokenReserves = bondingCurve.virtualTokenReserves;
    let tokenTotalSupply = bondingCurve.tokenTotalSupply;
    let realTokenReserves = bondingCurve.realTokenReserves;

    let adjustedSolReserves = virtualSolReserves.add(getBuyPrice(realTokenReserves, bondingCurve));
    let adjustedTokenReserves = virtualTokenReserves.sub(realTokenReserves);

    if (adjustedTokenReserves.eq(new BN(0))) return 0;

    let finalMarketCap = tokenTotalSupply.mul(adjustedSolReserves)
        .div(adjustedTokenReserves)
        .toNumber() / 1e9 * solPrice;

    return finalMarketCap.toLocaleString("en-US");
}

