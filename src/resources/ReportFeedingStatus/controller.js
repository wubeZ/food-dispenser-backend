import FeedingReport from './model.js';
import mongoose from 'mongoose';
import logger from '../../common/logger.js';



const dailyReport = async (req, res) => {
    try {
        const startDate = req.body.startDate ? new Date(req.body.startDate) : new Date();
        const user = req._id;

        const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1, 0, 0, 0, 0);
        const end = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1, 23, 59, 59, 999);

        const reportData = await FeedingReport.aggregate([
            {
                $match: {
                    date: { $gte: start, $lt: end },
                    user: new mongoose.Types.ObjectId(user),
                },
            },
            {
                $group: {
                    _id: null,
                    totalFoodConsumption: { $sum: '$amount' },
                    averageFoodConsumptionPerFeeding: { $avg: '$amount' },
                    numFeedings: { $sum: 1 },
                    numSuccess: {
                        $sum: { 
                            $cond: [{ $eq: ['$status', 'success'] }, 1, 0],
                        },
                    },
                    numFailed: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'failed'] }, 1, 0],
                        },
                    },
                    dataPoints: {
                        $push: {
                                date: '$date',
                                amount: '$amount',
                                status: '$status',
                                chickens: '$chickens',
                              },
                      },
               },
            },
        ]);

        const { totalFoodConsumption, averageFoodConsumptionPerFeeding, numFeedings, numSuccess, numFailed, dataPoints } = reportData[0] || {};
        const report = {
            date: startDate,
            totalFoodConsumption: totalFoodConsumption || 0,
            averageFoodConsumptionPerFeeding: String(averageFoodConsumptionPerFeeding) || String(0.0),
            numFeedings: numFeedings || 0,
            numSuccess: numSuccess || 0,
            numFailed: numFailed || 0,
            successRate: numFeedings > 0 ? String(((numSuccess / numFeedings) * 100) + 0.00) : String(0.00),
            failureRate: numFeedings > 0 ? String(((numFailed / numFeedings) * 100) + 0.00) : String(0.00),
            dataPoints: dataPoints || [],
        };

        logger.info('Daily report generated successfully');
        res.status(200).json({message: 'Daily report generated successfully', report: report});
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const weeklyReport = async (req, res) => {
    try {
        const endDate = req.body.endDate ? new Date(req.body.endDate) : new Date();
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
                totalFoodConsumption: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, { $multiply: ['$amount', '$chickens'] }, 0], },
                numFeedings: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0], }, },
                numSuccess: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0], }, },
                numFailed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0], }, },
              },
            },
          },
          ]);
        
        const succesDailyData = await FeedingReport.aggregate([
            {
              $match: {
                date: { $gte: startDate, $lte: endDate },
                user: new mongoose.Types.ObjectId(user),
                status: 'success',
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: '%Y-%m-%d', date: '$date' },
                },
                dailyTotalFoodConsumption: { $sum: { $multiply: ['$amount', '$chickens'] }, },
                dailyNumFeedings: { $sum: 1 },
                averageChickens: { $avg: '$chickens' },
              },
            },
            {
              $project: {
                date: '$_id',
                dailyTotalFoodConsumption: 1,
                dailyAverageFoodConsumptionPerFeeding: { $divide: ['$dailyTotalFoodConsumption', '$dailyNumFeedings'] },
                dailyAverageChickens: 1,
                dailyNumFeedings: 1,
              },
            },
            {
              $sort: { date: 1 },
            },
          ]);

          const failureDailyData = await FeedingReport.aggregate([
            {
              $match: {
                date: { $gte: startDate, $lte: endDate },
                user: new mongoose.Types.ObjectId(user),
                status: 'failed',
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: '%Y-%m-%d', date: '$date' },
                },
                dailyTotalFoodConsumption: { $sum: { $multiply: ['$amount', '$chickens'] }, },
                dailyNumFeedings: { $sum: 1 },
                averageChickens: { $avg: '$chickens' },
              },
            },
            {
              $project: {
                date: '$_id',
                dailyTotalFoodConsumption: 1,
                dailyAverageFoodConsumptionPerFeeding: { $divide: ['$dailyTotalFoodConsumption', '$dailyNumFeedings'] },
                dailyAverageChickens: 1,
                dailyNumFeedings: 1,
              },
            },
            {
              $sort: { date: 1 },
            },
          ]);

          const successDataPoints = succesDailyData.map(({ date, dailyTotalFoodConsumption, dailyAverageFoodConsumptionPerFeeding, dailyNumFeedings, dailyAverageChickens }) => ({
            date,
            amount : dailyTotalFoodConsumption || 0,
            averageFoodConsumptionPerFeeding: String(dailyAverageFoodConsumptionPerFeeding) || String(0.0),
            numFeedings: dailyNumFeedings || 0,
            chickens : dailyAverageChickens || 0,
          }));

          const failureDataPoints = failureDailyData.map(({ date, dailyTotalFoodConsumption, dailyAverageFoodConsumptionPerFeeding, dailyNumFeedings, dailyAverageChickens }) => ({
            date,
            amount : dailyTotalFoodConsumption || 0,
            averageFoodConsumptionPerFeeding: String(dailyAverageFoodConsumptionPerFeeding) || String(0.0),
            numFeedings: dailyNumFeedings || 0,
            chickens : dailyAverageChickens || 0,
          }));

          const { totalFoodConsumption, numFeedings, numSuccess, numFailed } = reportData[0] || {};
          
          const response = {
              startDate,
              endDate,
              totalFoodConsumption: totalFoodConsumption || 0,
              averageFoodConsumptionPerFeeding: String((totalFoodConsumption / numFeedings )) || String(0.0),
              numFeedings: numFeedings || 0,
              successRate: numFeedings > 0 ? String(((numSuccess / numFeedings) * 100) + 0.00) : String(0.00),
              failureRate: numFeedings > 0 ? String(((numFailed / numFeedings) * 100) + 0.00) : String(0.00),
              successDataPoints: successDataPoints || {},
              failureDataPoints: failureDataPoints || {}
          };

        logger.info("successfully got weekly report");
        res.status(200).json({ message: "successfully got weekly report", report : response });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

const monthlyReport = async (req, res) => {
    try {
        const year = Number(req.body.year || new Date().getFullYear());
        const month = Number(req.body.month || new Date().getMonth()) + 1;
        
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
              totalFoodConsumption: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, { $multiply: ['$amount', '$chickens'] }, 0], },
              numFeedings: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0], }, },
              numSuccess: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0], }, },
              numFailed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0], }, },
            },
          },
        },
        ]);
      
      const succesDailyData = await FeedingReport.aggregate([
          {
            $match: {
              date: { $gte: startDate, $lte: endDate },
              user: new mongoose.Types.ObjectId(user),
              status: 'success',
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$date' },
              },
              dailyTotalFoodConsumption: { $sum: { $multiply: ['$amount', '$chickens'] }, },
              dailyNumFeedings: { $sum: 1 },
              averageChickens: { $avg: '$chickens' },
            },
          },
          {
            $project: {
              date: '$_id',
              dailyTotalFoodConsumption: 1,
              dailyAverageFoodConsumptionPerFeeding: { $divide: ['$dailyTotalFoodConsumption', '$dailyNumFeedings'] },
              dailyAverageChickens: 1,
              dailyNumFeedings: 1,
            },
          },
          {
            $sort: { date: 1 },
          },
        ]);

        const failureDailyData = await FeedingReport.aggregate([
          {
            $match: {
              date: { $gte: startDate, $lte: endDate },
              user: new mongoose.Types.ObjectId(user),
              status: 'failed',
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$date' },
              },
              dailyTotalFoodConsumption: { $sum: { $multiply: ['$amount', '$chickens'] }, },
              dailyNumFeedings: { $sum: 1 },
              averageChickens: { $avg: '$chickens' },
            },
          },
          {
            $project: {
              date: '$_id',
              dailyTotalFoodConsumption: 1,
              dailyAverageFoodConsumptionPerFeeding: { $divide: ['$dailyTotalFoodConsumption', '$dailyNumFeedings'] },
              dailyAverageChickens: 1,
              dailyNumFeedings: 1,
            },
          },
          {
            $sort: { date: 1 },
          },
        ]);

        const successDataPoints = succesDailyData.map(({ date, dailyTotalFoodConsumption, dailyAverageFoodConsumptionPerFeeding, dailyNumFeedings, dailyAverageChickens }) => ({
          date,
          amount : dailyTotalFoodConsumption || 0,
          averageFoodConsumptionPerFeeding: String(dailyAverageFoodConsumptionPerFeeding) || String(0.0),
          numFeedings: dailyNumFeedings || 0,
          chickens : dailyAverageChickens || 0,
        }));

        const failureDataPoints = failureDailyData.map(({ date, dailyTotalFoodConsumption, dailyAverageFoodConsumptionPerFeeding, dailyNumFeedings, dailyAverageChickens }) => ({
          date,
          amount : dailyTotalFoodConsumption || 0,
          averageFoodConsumptionPerFeeding: String(dailyAverageFoodConsumptionPerFeeding) || String(0.0),
          numFeedings: dailyNumFeedings || 0,
          chickens : dailyAverageChickens || 0,
        }));

        const { totalFoodConsumption, numFeedings, numSuccess, numFailed } = reportData[0] || {};
        
        const response = {
            year,
            month,
            startDate,
            endDate,
            totalFoodConsumption: totalFoodConsumption || 0,
            averageFoodConsumptionPerFeeding: String((totalFoodConsumption / numFeedings )) || String(0.0),
            numFeedings: numFeedings || 0,
            successRate: numFeedings > 0 ? String(((numSuccess / numFeedings) * 100) + 0.00) : String(0.00),
            failureRate: numFeedings > 0 ? String(((numFailed / numFeedings) * 100) + 0.00) : String(0.00),
            successDataPoints: successDataPoints || {},
            failureDataPoints: failureDataPoints || {}
        };

        logger.info("successfully got monthly report");
        res.status(200).json({ message: "successfully got monthly report", report : response });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};


export default {
    weeklyReport,
    monthlyReport,
    dailyReport
}

  