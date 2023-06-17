import {Router} from 'express';


const router = Router();

import FeedingRoute from '../resources/feedingData/router.js'
import UserRoute from '../resources/User/routes.js'
import DeviceRoute from '../resources/Devices/routes.js'
import ReportRoute from '../resources/ReportFeedingStatus/routes.js'
import FeedbackRoute from '../resources/Feedback/routes.js'


router.use('/feeding', FeedingRoute);
router.use('/user', UserRoute);
router.use('/device', DeviceRoute);
router.use('/report', ReportRoute);
router.use('/feedback', FeedbackRoute);

export default router;