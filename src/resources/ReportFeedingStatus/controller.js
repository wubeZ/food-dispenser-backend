import FeedingReport from './model.js';
import mongoose from 'mongoose';
import logger from '../../common/logger.js';

const weeklyReport = async (req, res) => {
    try {
        const endDate = req.params.endDate || new Date();
        // startDate is 7 days before endDate
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        const user = req._id;
        
        const reportData = await FeedingReport.aggregate([
            {
              $match: {
                date: { $gte: startDate, $lte: endDate },
                user: new mongoose.Types.ObjectId(user),
              },
            },
            {
              $group: {
                _id: null,
                totalFoodConsumption: { $sum: '$amount' },
                averageFoodConsumptionPerChicken: { $avg: '$amount' },
                numFeedings: { $sum: 1 },
                dataPoints: {
                  $push: {
                    date: '$date',
                    amount: '$amount',
                    chickens: '$chickens',
                  },
                },
              },
            },
          ]);

        const { totalFoodConsumption, averageFoodConsumptionPerChicken, numFeedings, dataPoints } = reportData[0] || {};
        
        const response = {
            startDate,
            endDate,
            totalFoodConsumption : totalFoodConsumption || 0,
            averageFoodConsumptionPerChicken: averageFoodConsumptionPerChicken || 0,
            numFeedings : numFeedings || 0,
            dataPoints: dataPoints || [],
        };
        logger.info("successfully got weekly report");
        res.status(200).json({ message: "successfully got weekly report", report : response });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const monthlyReport = async (req, res) => {
    try {
        const year = Number(req.query.year || new Date().getFullYear());
        const month = Number(req.query.month || new Date().getMonth()) + 1;
        
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        const user = req._id;

        const reportData = await FeedingReport.aggregate([
            {
                $match: {
                    date: { $gte: startDate, $lte: endDate },
                    user: new mongoose.Types.ObjectId(user),
                },
            },
            {
                $group: {
                    _id: null,
                    totalFoodConsumption: { $sum: '$amount' },
                    averageFoodConsumptionPerChicken: { $avg: '$amount' },
                    numFeedings: { $sum: 1 },
                    dataPoints: {
                        $push: {
                            date: '$date',
                            amount: '$amount',
                            chickens: '$chickens',
                        },
                    },
                },
            },
        ]);

        const { totalFoodConsumption, averageFoodConsumptionPerChicken, numFeedings, dataPoints } = reportData[0] || {};

        const response = {
            year, 
            month,
            startDate,
            endDate,
            totalFoodConsumption : totalFoodConsumption || 0,
            averageFoodConsumptionPerChicken: averageFoodConsumptionPerChicken || 0,
            numFeedings : numFeedings || 0,
            dataPoints: dataPoints || [],
        };
        logger.info("successfully got monthly report");
        res.status(200).json({ message: "successfully got monthly report", report : response });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}


export default {
    weeklyReport,
    monthlyReport
}

  