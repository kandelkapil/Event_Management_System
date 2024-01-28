import express from "express";
import * as userController from "../controllers/userController.js";
import { verifyJWT } from "../middlewares/verifyJwt.js";

const router = express.Router();
router.use(verifyJWT);

router.route("/").get(userController.usersList);
router.route("/").post(userController.getUserById);
router.route("/").patch(userController.updateUserById);

//   .delete(userController.deleteUser);

export default router;
