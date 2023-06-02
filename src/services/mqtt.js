import mqtt from 'mqtt'
import '../common/env.js'
import FeedingReport from '../resources/reportStatus/model.js'
import mongoose from 'mongoose'


const options = {
    host: process.env.MQTTHOST,
    port: 8883,
    protocol: 'mqtts',
    username: process.env.MQTTUSERNAME,
    password: process.env.MQTTPASSWORD,
}

const client = mqtt.connect(options)

client.on('connect', () => {
    console.log('MQTT connected')
    
})


client.subscribe('capacityResponse', { qos: 1 }, function (err) {
        if (err) {
          console.error('Error subscribing to capcaityResponse', err)
        } else {
          console.log('Subscribed capacityResponse successfully!')
        }
      })


client.subscribe('feedingResponse', { qos: 1 }, function (err) {
    if (err) {
        console.error('Error subscribing to feedingResponse', err)
    } else {
        console.log('Subscribed feedingResponse successfully!')
    }
})

client.on('message', async (topic, message) => { 
    console.log('MQTT message received:', topic, message.toString())
    if (topic == 'feedingResponse1222'){ // change the topic to the topic you want to subscribe to
        message = message.toString()
        message = message.split(',')

        const amount = message[1]
        const chickens = message[2]
        const capacity = message[3]
        const user = mongoose.Types.ObjectId(message[4])
        const newdate = new Date();
        const hour = newdate.getHours();
        const minute = newdate.getMinutes();
        const second = newdate.getSeconds();
        const year = newdate.getFullYear();
        const month = newdate.getMonth() + 1;
        const day = newdate.getDate();
        const date = year + '-' + month + '-' + day;
        const time = hour + ':' + minute + ':' + second;

        const data = new FeedingReport({  
            user,
            date, 
            time, 
            amount,
            chickens,
            capacity
        });
        await data.save();
        console.log(`MQTT response: OK, ${amount} grams of food for ${chickens} chickens, capacity: ${capacity} on ${date} at ${time}`);
    }    

})

client.on('error', function (error) {
    console.log('MQTT Error:', error);
});

client.on('close', function () {
    console.log('Disconnected from MQTT broker');
});


export default client;

