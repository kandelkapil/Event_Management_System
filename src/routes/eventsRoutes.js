import express from "express";
import * as eventController from "../controllers/eventsController.js";
import { verifyJWT } from "../middlewares/verifyJwt.js";


const router = express.Router();

router.route("/").get(eventController.eventsList);

router.use(verifyJWT);

router.route("/:id").get(eventController.getEventById);
router.route("/").post(eventController.createEvent);
router.route("/:id").patch(eventController.updateUserById);
router.route("/:id").delete(eventController.deleteEventById);
router.route("/:id/register").post(eventController.registerEvent);

export default router;