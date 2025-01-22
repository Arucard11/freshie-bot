import { Schema, model } from 'mongoose';

const userSchema = new Schema({
    chatId: {
        type: String,
        unique: true,
    },
    monitor: {
        type: Boolean,
        default: false,
    },
});

const User = model('User', userSchema,"fresh");

export default User;
