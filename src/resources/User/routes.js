import { Router } from "express";
import auth from "../../middlewares/auth.js";
import userController from "./controller.js";


const router = Router();

router
    .route("/")
    .get(auth, userController.getUserById)
    .post(auth, userController.createUser)
    .put(auth, userController.updateUserById)
    .delete(auth, userController.deleteUserById)

router
    .route('/admin/get-users')
    .get(auth, userController.getAllUsers)

router
    .route('/admin')
    .post(auth, userController.createAdmin)


router
    .route('/login').post(userController.login)

router
    .route('/change-password').post(auth, userController.changePassword)

router
    .route(":id")
    .get(auth, userController.getUser)

export default router;
