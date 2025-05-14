import { Router } from "express";
import express from "express";
import {loginUser,logOutUser,registerUser,refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, resetPassword ,getchannelProfile} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { getWatchHistory } from "../controllers/user.controller.js";
import { forgotPassword } from "../controllers/user.controller.js";


const router=Router()
const app = express()

router.post(
  "/debug-upload",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  (req, res) => {
    console.log("DEBUG FILES:", req.files);
    console.log("DEBUG BODY:", req.body);
    res.json({ status: "OK", files: req.files });
  }
);

router.post(
  "/register",
  upload.fields([{ name: "avatar" }, { name: "coverImage" }]),
  async (req, res) => {
    try {
      const { username, email, fullName, password, about } = req.body;
      const avatar = req.files?.avatar?.[0]?.filename || null;

      // Perform DB registration logic...

      res.status(201).json({ success: true, message: "User registered" });
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);



router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(logOutUser)
router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)

router.route("/update-account").patch(verifyJWT,upload.single("avatar"),updateAccountDetails)

router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)

router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)

router.route("/c/:username").get(verifyJWT,getUserChannelProfile)

router.route("/history").get(verifyJWT,getWatchHistory)
router.route("/forgot-password").post(forgotPassword)
router.route("/reset-password").post(resetPassword)
router.route("/channel-profile/:channelId").get(getchannelProfile)

export default router