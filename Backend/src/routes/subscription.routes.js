import { Router } from "express";

const router = Router();

import {
  checkSubscriptionStatus,
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
  getSubscriberCount,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

router.route("/:channelId").post(verifyJWT, toggleSubscription);
router.route("/").get(verifyJWT, getSubscribedChannels);
router.route("/channel/:channelId").get( verifyJWT, checkSubscriptionStatus); // ✅ Fixed
router.get("/channel/:channelId/subscribers", getSubscriberCount);


export default router;
