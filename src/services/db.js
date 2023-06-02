import mongoose from 'mongoose';
import '../common/env.js';
import ScheduleModel from '../resources/Schedule/model.js';
import client from './mqtt.js';
import nodeScheduler from 'node-schedule';
import FeedingData from '../resources/feedingData/model.js';
import create from '../resources/Schedule/controller.js';

const MONGO_URI = process.env.MONGO_URI;

const connection = mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  });

mongoose.Promise = global.Promise

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async function() {
    console.log('MongoDB connected');
    // reschedule the jobs on server restart
    try {
      currentTime = new Date();
      const schedules = await ScheduleModel.find({date: {$gte: currentTime}});
      for( const one_schedule of schedules ){
          const dateformat = one_schedule.date;
          const dayOfWeek = dateformat.getDay();
          const dayOfMonth = dateformat.getDate();
          const hour = dateformat.getHours();
          const minute = dateformat.getMinutes();
          const second = dateformat.getSeconds();
          //schedule the job
          const dateString = `${second} ${minute} ${hour} ${dayOfMonth} * ${dayOfWeek}`;
          const entries = one_schedule.entries;
          for (const entry of entries){
            const date = one_schedule.date;
            const dateString = dateString;
            const chickens = entry.chickens;
            const amount = entry.amount;
            const device = entry.device;

            const response = create(date, dateString, chickens, amount, device);
            
          }
      }
    } catch (err) {
      return err
    }

});


export default connection;