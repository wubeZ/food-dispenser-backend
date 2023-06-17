import { Router } from "express";
import Feedbackcontroller from "./controller.js";
import auth from "../../middlewares/auth.js";


const router = Router();


router
    .route("/")
    .get(auth, Feedbackcontroller.getAllFeedback)
    .post(auth, Feedbackcontroller.create);

router
    .route("/:id")
    .get(auth, Feedbackcontroller.getFeedbackById)
    .put(auth, Feedbackcontroller.updateFeedbackById)



export default router;