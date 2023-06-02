import mongoose from "mongoose";

const feedingreportSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String,
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
    capacity: {  
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true
    },
},
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }

}); 

const FeedingReport = mongoose.model('FeedingReport', feedingreportSchema);

export default FeedingReport;