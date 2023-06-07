import FeedingData from "./model.js";
import ScheduleModel from "../Schedule/model.js";
import DeviceModel from "../Devices/model.js";
import client from "../../services/mqtt.js";
import create from "../Schedule/controller.js";
import logger from "../../common/logger.js";

const createFeedingData = async (req, res) => {
    const { startDate, endDate, amount, chickens, recurrence } = req.body;
    // recurrence is value like once, daily
    const user = req._id;
    const device = req.device_id;
    const dateTime = new Date(startDate);

    const data = await ScheduleModel.findOne({ date: dateTime });

    if (data){
        data.entries.push({ user: user, device: device ,amount: amount , chickens: chickens });
        await data.save();
    }
    else{
        const date = startDate;
        const dateformat = dateTime;
        const dayOfWeek = dateformat.getDay();
        const dayOfMonth = dateformat.getDate();
        const hour = dateformat.getHours();
        const minute = dateformat.getMinutes();
        const second = dateformat.getSeconds();
        //schedule the job
        const dateString = `${second} ${minute} ${hour} ${dayOfMonth} * ${dayOfWeek}`;

        await ScheduleModel.create({
            date: dateTime,
            entries: [{ user : user , device: device  ,amount: amount , chickens: chickens }],
            scheduleString: dateString
        });

        const response = create(date, dateString, chickens, amount, device);
        
    }
        const newEndDate = endDate ? new Date(endDate) : "";
        const newData = new FeedingData({
            user: user,
            device: device,
            startDate: dateTime,
            endDate: newEndDate ,
            amount: amount,
            chickens: chickens,
            recurrence: recurrence
        });
        
        try {
            await newData.save();
            return res.status(201).json({ message: 'FeedingData created successfully' });
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
        
}

const getAllFeedingData = async (req, res) => {
    try {
        const currentDate = new Date();

        const data = await FeedingData.find({ startDate: { $gte: currentDate }});
        return res.status(200).json({ data });
    } catch (error) {
        return res.status(404).json({ error: true, message: 'Error with FeedingData' });
    }
}

const getFeedingDataById = async (req, res) => {
    try {
        const data = await FeedingData.findById(req.params.id);
        if (!data) {
            return res.status(404).json({ error: true, message: 'FeedingData not found' });
        }
        return res.status(200).json({ message: 'FeedingData successfully fetched', data });
    } catch (e) {
        return res.status(e.status).json({ error: true, message: 'Error with FeedingData' });
    }
}


const deleteFeedingDataById = async (req, res) => {
    
    try {

        const data = await FeedingData.findById(req.params.id);
        if (!data) {
            return res.status(404).json({ error: true, message: 'FeedingData not found' });
        }

        const jobObject = CircularJSON.parse(data.job);
        jobObject.cancel();

        await FeedingData.findByIdAndRemove(req.params.id);
        return res.status(200).json({ message: 'FeedingData deleted successfully' });

    } catch (e) {
        return res.status(e.status).json({ error: true, message: 'Error with FeedingData' });
    }
}


const getCapacity = async (req, res) => {
        // Publish message to MQTT broker
        const device = req.device_id;

        client.publish(`capacityRequest/${device}`, "get capacity", function (err) {
            if (err) {
              console.error('Error publishing message:', err)
            }
          });

        // Set timeout for capacity response message
        const timeout = new Promise((resolve, reject) => {
            setTimeout(() => {
            reject(new Error('Timeout'));
            }, 50000); // 20-second timeout
        });

        // Wait for capacity response message or timeout
        const message = await Promise.race([
            new Promise(resolve => {
            client.on('message', (topic, payload) => {
                logger.info("getting message from topic: ", topic, "message :", payload.toString())
                if (topic === `capacityResponse/${device}`) {
                resolve(payload.toString());
                }
            });
            }),
            timeout
        ]).catch(error => {
            logger.info(error.message); // Print timeout error message
        });
        // If message is undefined, then the timeout occurred
        if (!message) {
            return res.status(500).json({ error: true, message: 'Error Getting Capacity' });
        }
        
        const updateDevice = await DeviceModel.findOneAndUpdate({ device_id: device }, { capacity: message });
        return res.status(200).json({ message: 'Capacity successfully fetched', data: {device, message } });
}


const updateFeedingData = async (req, res) => {
    const { previousDate, startDate, endDate, amount, chickens, recurrence } = req.body;

    try {
        const dateTime  = new Date(previousDate);
        const prev_data = await FeedingData.findOne({ startDate: dateTime });
        if (!prev_data) {
            return res.status(404).json({ error: true, message: 'FeedingData not found' });
        }
        console.log(prev_data);
        const previousAmount = prev_data.amount;
        const previousChickens =  prev_data.chickens;
        const newEndDate = endDate ? new Date(endDate) : "";
        prev_data.startDate = new Date(startDate);
        prev_data.endDate = newEndDate;
        prev_data.amount = amount;
        prev_data.chickens = chickens;
        prev_data.recurrence = recurrence;
        
        await prev_data.save();
        
        const user = req._id;
        const device = req.device_id;
        
        const deleteFeed = { user, device, previousAmount, previousChickens };

        const data = await ScheduleModel.findOne({ date: dateTime });
        if (!data) {
            return res.status(404).json({ error: true, message: 'Schedule not found' });
        }
        await ScheduleModel.updateOne({ _id: data._id }, { $pull: { entries: deleteFeed } });

        const updateFeed = [user, device ,amount, chickens];
        
        data.entries.push(updateFeed);
        await data.save();

        return res.status(200).json({ message: 'FeedingData updated successfully', data: prev_data });

    } catch (e) {
        return res.status(404).json({ error: true, message: 'Error with FeedingData' });
    }
}


const deleteSingle = async (req, res ) => {
    const { startDate } = req.body;
    const user = req._id;
    const device = req.device_id;
    const dateTime = new Date(startDate);
    try {
        const delete_data = await FeedingData.findOneAndRemove({ startDate: dateTime });
        if (!delete_data) {
        return res.status(404).json({ error: true, message: 'FeedingData not found' });
        }
        const amount = delete_data.amount;
        const chickens = delete_data.chickens;
        
        const schedule = await ScheduleModel.findOneAndUpdate(
            { date: dateTime },
            { $pull: { entries: { user: user, device: device, amount: amount, chickens: chickens } } },
            { new: true }
          );
          if (!schedule) {
            return res.status(404).json({ error: true, message: 'FeedingSchedule not found' });
          }
          return res.json({ message: 'Feeding event deleted successfully' });
    }
    catch (e) {
            return res.status(404).json({ error: true, message: 'Error with FeedingData' });
    }

}




export default {
    createFeedingData,
    getAllFeedingData,
    getFeedingDataById,
    deleteFeedingDataById,
    getCapacity,
    updateFeedingData,
    deleteSingle
}
