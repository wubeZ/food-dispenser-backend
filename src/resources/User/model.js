import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema({
    full_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin:{
        type: Boolean,
        default: false
    },
    device_id: {
        type: Schema.Types.ObjectId,
        ref: 'Device',
        required: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: Schema.Types.ObjectId,
        ref: 'Address',
        required: true
    },
}, {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}
});

const User = mongoose.model('User', userSchema);

export default User;

