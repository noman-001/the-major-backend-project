import {Router} from "express";
import {
    createTweet,
    deleteTweet,
    getUserTweet,
    updateTweet
} from "../controllers/tweet.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);
router.use("/").post(createTweet);
router.use("/user/:userId").get(getUserTweet);
router.use("/:tweetId")
    .patch(updateTweet)
    .delete(deleteTweet);

export default router;