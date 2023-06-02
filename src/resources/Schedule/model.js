import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
  date: {
      type: Date,
      required: true,
      unique: true
  },
  entries: {
      type: [{
          user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User',
              required: true
          },
          device: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Device',
              required: true
          },
          amount: {
              type: Number,
              required: true
          },
          chickens: {
              type: Number,
              required: true
          }
      }],
      required: true
  },
  scheduleString: {
      type: String,
      required: true
  }
});

const Schedule = mongoose.model('Schedule', scheduleSchema);

export default Schedule;