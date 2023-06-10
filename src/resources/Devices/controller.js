import DeviceModel from './model.js'
import UserModel from '../User/model.js'
import logger from '../../common/logger.js';


const createDevice = async (req, res) => {
    try {
        if (!req.isAdmin) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const {deviceName, capacity} = req.body;

        const device = await DeviceModel.create({
            name: deviceName,
            feedingCapacity: capacity
        });

        const response = {
            device_id: device._id,
            device_name: device.name,
            capacity: device.feedingCapacity
        }

        logger.info('Device created successfully')
        return res.status(201).json({ message: 'Device created successfully', response });
    } catch (error) {
        return res.status(500).json({ error: true, message: 'Error with Device' });
    }
}



const getAllDevices = async (req, res) => {
    try {
        if (!req.isAdmin) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const data  = await DeviceModel.find({});
        logger.info('Devices fetched successfully')
        return res.status(200).json({ data });
    } catch (error) {
        return res.status(404).json({ error: true, message: 'Error with Devices' });
    }
}

const getDeviceDataById = async (req, res) => {
    try {
        const data = await DeviceModel.findById(req.params.id);
        if (!data) {
            return res.status(404).json({ error: true, message: 'Device not found' });
        }
        logger.info('Device fetched successfully')
        return res.status(200).json({ message: 'Device successfully fetched', data });
    } catch (e) {
        return res.status(e.status).json({ error: true, message: 'Error with Device' });
    }
}

const deleteDeviceDataById = async (req, res) => {
    try {
        if (!req.isAdmin) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const data = await DeviceModel.findById(req.params.id);
        if (!data) {
            return res.status(404).json({ error: true, message: 'Device not found' });
        }

        await DeviceModel.findByIdAndRemove(req.params.id);
        logger.info('Device deleted successfully')
        return res.status(200).json({ message: 'Device deleted successfully' });

    } catch (e) {
        return res.status(e.status).json({ error: true, message: 'Error with Device' });
    }

}

const updateDevice = async (req, res) => {
    try {
        if (!req.isAdmin) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { name, feedingCapacity, currentCapacity } = req.body;
        const data = await DeviceModel.findById(req.params.id);
        if (!data) {
            return res.status(404).json({ error: true, message: 'Device not found' });
        }
        const device = await DeviceModel.findByIdAndUpdate(req.params.id, {
            name,
            feedingCapacity,
            currentCapacity
        }, { new: true });
        logger.info('Device updated successfully')
        return res.status(200).json({ message: 'Device updated successfully', device });
    } catch (e) {
        return res.status(e.status).json({ error: true, message: 'Error with Device' });
    }
}

const getDashboardData = async (req, res) => {
    try {
        const pipeline = [
            {
              $sort: { createdAt: -1 },
            },
            {
              $limit: 10,
            },
            {
              $project: {
                _id: 0,
                deviceId: '$_id',
                name: 1,
                feedingCapacity: 1,
              },
            },
          ];
          
            const recentDevices = await DeviceModel.aggregate(pipeline).exec();
            const totalDevices = await DeviceModel.countDocuments();
        
            const users = await UserModel.find({ isAdmin: false });
            const totalUsers = users.length;


        const response = {
            totalDevices,
            totalUsers,
            recentDevices
        }

        // logger.info('dashboard data successfully fetched')
        return res.status(200).json({ message: 'dashboard data successfully fetched', response });
    } catch (e) {
        return res.status(e.status).json({ error: true, message: 'Error with dashboard data fetch' });
    }
}

export default {
    getAllDevices,
    getDeviceDataById,
    deleteDeviceDataById,
    updateDevice,
    createDevice,
    getDashboardData

}