import mongoose from 'mongoose';
const {Schema} = mongoose;

const userSchema = new Schema({
    username: { 
        type: String, 
        required: [true,"Username field is required"], unique: true },
    email: { 
        type: String, 
        required: [true, "Email field is required"], unique: true },
    password: { 
        type: String, 
        required: true },
    isConfirmed: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);
export default User;
