import mongoose, { Mongoose } from "mongoose";

const FeedbackSchema = new mongoose.Schema({
    user: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    device: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: "Device",
        required: true,
    },
    feedback: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        default: "pending",
    }
});

const Feedback = mongoose.model("Feedback", FeedbackSchema);

export default Feedback;