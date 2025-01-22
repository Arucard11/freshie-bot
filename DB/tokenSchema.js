import { Schema, model } from 'mongoose';

const tokenSchema = new Schema({
    name: {
        type: String,
    },
    symbol: {
        type: String,
    },
    uri: {
        type: String,
    },
    mintAddress: {
        type: String,
        unique: true,
        
    },
    bondingCurveAddress: {
        type: String,
    },
});

const Token = model('', tokenSchema);

export default Token;