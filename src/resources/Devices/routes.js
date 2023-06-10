import { Router } from "express";
import deviceController from './controller.js';
import auth from "../../middlewares/auth.js";

const router = Router();    

router
.route('/')
    .get(auth, deviceController.getAllDevices)
    .post(auth, deviceController.createDevice)

router
    .route('/dashboard')
    .get(auth, deviceController.getDashboardData)

router
    .route('/:id')
    .get(auth, deviceController.getDeviceDataById)
    .put(auth, deviceController.updateDevice)
    .delete(auth, deviceController.deleteDeviceDataById)

export default router;