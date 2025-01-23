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
    marketCap: {
        type: Number,
        default: 0
    },

    checked: {
        type: Boolean,
        default: false
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Token = model('Token', tokenSchema);

export default Token;