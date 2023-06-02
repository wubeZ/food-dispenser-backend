import {Router} from 'express';


const router = Router();

import FeedingRoute from '../resources/feedingData/router.js'
import UserRoute from '../resources/User/routes.js'
import DeviceRoute from '../resources/Devices/routes.js'


router.use('/feeding', FeedingRoute);
router.use('/user', UserRoute);
router.use('/device', DeviceRoute);

export default router;