import {Router} from 'express';
import reportController from './controller.js';
import auth from '../../middlewares/auth.js';

const router = Router();

router
    .route('/weekly')
    .get(auth, reportController.weeklyReport);

router
    .route('/monthly')
    .get(auth, reportController.monthlyReport);


export default router;