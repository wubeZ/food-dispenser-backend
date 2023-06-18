import FeedingData from "../feedingData/model.js";
import ScheduleModel from '../Schedule/model.js';
import DeviceModel from '../Devices/model.js';
import client from "../../services/mqtt.js";
import FeedingReport from "../ReportFeedingStatus/model.js";
import nodeScheduler from 'node-schedule';
import logger from "../../common/logger.js";


const create = async (date, dateString, chickens, amount, device) => {
    
    const job = nodeScheduler.scheduleJob(dateString, async () => {
        const schedules = await ScheduleModel.findOne({date: date});
        const feeding = await FeedingData.findOne({startDate: date});
        console.log("feeding is scheduled and it has gotten to this part "); // added this for debugging
        const entries = schedules.entries;
        const new_jobs = [];
        for (const entry of entries) {
          const feedingrepsonse = entry.amount.toString() + ',' + entry.chickens.toString();

          // check if the device has enough capacity
          const device = await DeviceModel.findById(entry.device);
          const newCapacity = entry.amount * entry.chickens;
          if (device.currentCapacity < newCapacity){
            const newdate = new Date();
            const hour = newdate.getHours();
            const minute = newdate.getMinutes();
            const second = newdate.getSeconds();
            const time = hour + ':' + minute + ':' + second;

            const newReport = new FeedingReport({
              user: entry.user,
              device: entry.device,
              chickens: entry.chickens,
              amount: entry.amount,
              status: 'failed',
              date: date,
              time: time,
              capacity: device.currentCapacity
            });
            await newReport.save();
            logger.info(`feeding ${entry.chickens} chickens ${entry.amount} grams of food failed`); 
          }
          else{
          client.publish(`feedingRequest/${entry.device}`, feedingrepsonse);
          logger.info(`feeding ${entry.chickens} chickens ${entry.amount} grams of food`);
          schedules.date.setDate(schedules.date.getDate() + 1)
          if ((feeding.endDate === null ) || ((feeding.endDate - schedules.date) >= 0) ){
            const dateformat = schedules.date;
            const dayOfWeek = dateformat.getDay();
            const dayOfMonth = dateformat.getDate();
            const hour = dateformat.getHours();
            const minute = dateformat.getMinutes();
            const second = dateformat.getSeconds();
            //schedule the job
            const dateString = `${second} ${minute} ${hour} ${dayOfMonth} * ${dayOfWeek}`;
            new_jobs.push([schedules.date, dateString, entry.chickens, entry.amount, entry.device])
            feeding.startDate = schedules.date;
            await feeding.save();
          } 
      }
      }
      for (const newData of new_jobs){
        try{
          const date = newData[0];
          const dateString = newData[1];
          const chickens = newData[2];
          const amount = newData[3];
          const device = newData[4];
          const user = feeding.user;
          const new_schedule = await ScheduleModel.findOne({date: date})
          if (new_schedule){
            new_schedule.entries.push({ user: user, device: device  ,amount: amount , chickens: chickens })
            await new_schedule.save();
          }
          else{
            const dateformat = date;
            const dayOfWeek = dateformat.getDay();
            const dayOfMonth = dateformat.getDate();
            const hour = dateformat.getHours();
            const minute = dateformat.getMinutes();
            const second = dateformat.getSeconds();
            //schedule the job
          const dateString = `${second} ${minute} ${hour} ${dayOfMonth} * ${dayOfWeek}`;

          await ScheduleModel.create({
              date: date,
              entries: [{ user: user , device: device  ,amount: amount , chickens: chickens }],
              scheduleString: dateString
          });
              return create(date, dateString, chickens, amount, device);
          }
        }
        catch(err){
          return err
        }
      }
          
    })
  
    return true;

}

export default create;