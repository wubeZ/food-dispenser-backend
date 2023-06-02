import DeviceModel from './model.js'

const getAllDevices = async (req, res) => {
    try {
        if (!req.isAdmin) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const data  = await DeviceModel.find({});
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
        return res.status(200).json({ message: 'Device updated successfully', device });
    } catch (e) {
        return res.status(e.status).json({ error: true, message: 'Error with Device' });
    }
}



export default {
    getAllDevices,
    getDeviceDataById,
    deleteDeviceDataById,
    updateDevice

}