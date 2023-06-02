import { Router } from "express";
import Feedingcontroller from './controller.js';
import auth from '../../middlewares/auth.js';
const router = Router();    

router
.route('/')
    .get(auth, Feedingcontroller.getAllFeedingData)
    .post(auth, Feedingcontroller.createFeedingData)
    .put(auth, Feedingcontroller.updateFeedingData)

router
    .route('/delete')
    .delete(auth, Feedingcontroller.deleteSingle)
router
.route('/capacity')
    .get(auth, Feedingcontroller.getCapacity)


router
    .route('/:id')
    .get(auth, Feedingcontroller.getFeedingDataById)

export default router;