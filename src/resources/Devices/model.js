import mongoose, { Schema } from "mongoose";

const deviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    feedingCapacity : {
        type: String,
        required: true
    },
    currentCapacity : {
        type: Number,
        required: false
    }
},
    {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}
});

const deviceData = mongoose.model("Device", deviceSchema);

export default deviceData;
