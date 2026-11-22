import {Router} from "express";
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
} from "../controllers/subscription.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);
router.get("/c/:channelId",verifyJWT, getUserChannelSubscribers);
router.post("/c/:channelId", verifyJWT, toggleSubscription);
router.get("/u/:subscriberId",verifyJWT, getSubscribedChannels);

export default router;
    