import {Router} from 'express';
import reportController from './controller.js';
import auth from '../../middlewares/auth.js';

const router = Router();

router
    .route('/daily')
    .post(auth, reportController.dailyReport);


router
    .route('/weekly')
    .post(auth, reportController.weeklyReport);

router
    .route('/monthly')
    .post(auth, reportController.monthlyReport);

router
    .route('/dummy')
    .post(auth, reportController.createDummyData);


export default router;