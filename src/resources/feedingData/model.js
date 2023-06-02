import mongoose, { Schema } from "mongoose";


const feedingdataSchema = new mongoose.Schema({
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    device: {
      type: Date,
      type: Schema.Types.ObjectId,
      ref: 'Device',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    chickens: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: false
    },
    recurrence:{
      type: String,
      required: true
    }
    
},
    {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}
});

const FeedingData = mongoose.model('FeedingData', feedingdataSchema);

export default FeedingData;