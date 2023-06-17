import Feedback from "./model";
import logger from "../../common/logger";


const create = async (req, res) => {
    try {
        const { feedback, rating } = req.body;
        const user = req._id;
        const device = req.device_id;

        if (!feedback || !rating) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const response = await Feedback.create({    
            user,
            device,
            feedback,
            rating,
            });

        logger.info(`Feedback created for user ${user} and device ${device}`);
        return res.status(201).json({ message: "Feedback created successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getAllFeedback = async (req, res) => {
    try {
        const response = await Feedback.find().populate("user").populate("device").sort({date: -1});
        logger.info(`All feedbacks fetched`);
        return res.status(200).json({ message:"got all feedbacks successfully", response: response });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


const getFeedbackById = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await Feedback.findById(id).populate("user").populate("device");
        if (!response) {
            return res.status(404).json({message: "Feedback with the specified ID does not exists"});
        }
        return res.status(200).json({message: "got feedback by Id", response: response });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const updateFeedbackById = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const exits = await Feedback.findById(id);
        if (!exits) {
            return res.status(404).json({ message: "Feedback with the specified ID does not exists" });
        }

        if (!status) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const updateFeedback = await Feedback.findByIdAndUpdate({_id: id} , {status: status});
        logger.info(`Feedback updated with id ${id}`);
        return res.status(200).json({ message: "Feedback updated successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
    

export default {
    create,
    getAllFeedback,
    getFeedbackById,
    updateFeedbackById
};





