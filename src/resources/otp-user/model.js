import mongoose, { Schema } from "mongoose";


const otpUserSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    otp: { 
        type: String,
        required: true
    },
    expirationDate: {
        type: Date,
        default: Date.now,
        index:{
            expireAfterSeconds: 3600
        }
    }
});


const OtpUserModel = mongoose.model('OtpUser', otpUserSchema);

export default OtpUserModel;
