import { Schema, model } from 'mongoose';

const signatureSchema = new Schema({
    signature: {
        type: String,
        required: true
    },
    
});

const Signature = model('Signature', signatureSchema);

export default Signature;