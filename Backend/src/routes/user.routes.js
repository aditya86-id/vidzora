import { Router } from "express";
import {
  loginUser,
  logOutUser,
  registerUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
  forgotPassword,
  resetPassword,
  getchannelProfile,
} from "../controllers/user.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// ✅ Debug route (only use during development)
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

// ✅ Register User (with avatar and optional cover image)
router.post(
  "/register",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

// ✅ Auth routes
router.post("/login", loginUser);
router.post("/logout", logOutUser);
router.post("/refresh-token", refreshAccessToken);

// ✅ Profile / Account management
router.post("/change-password", verifyJWT, changeCurrentPassword);
router.get("/current-user", verifyJWT, getCurrentUser);
router.patch(
  "/update-account",
  verifyJWT,
  upload.single("avatar"),
  updateAccountDetails
);
router.patch("/avatar", verifyJWT, upload.single("avatar"), updateUserAvatar);
router.patch(
  "/cover-image",
  verifyJWT,
  upload.single("coverImage"),
  updateUserCoverImage
);

// ✅ Channel/Profile routes
router.get("/c/:username", verifyJWT, getUserChannelProfile);
router.get("/channel-profile/:channelId", getchannelProfile);

// ✅ Watch History
router.get("/history", verifyJWT, getWatchHistory);

// ✅ Password Reset
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
