// controllers/watchController.js
import {asyncHandler} from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import {User} from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * POST /api/watch-progress
 * { videoId, currentTime, duration }
 * Adds videoId to watchHistory once user has watched
 * ≥10 seconds OR ≥10 % of the video.
 */
export const reportProgress = asyncHandler(async (req, res) => {
  const { videoId, duration } = req.body;
  const userId = req.user._id;
  console.log(userId)
  const currentTime = Math.floor(Date.now() / 1000);

  if (!videoId || !duration) {
    return res.status(400).json({ error: "videoId & duration required" });
  }

  // simple rule: 10s OR 10 %
  const passed = currentTime >= 10 || (currentTime / duration) * 100 >= 10;
  console.log(passed)

  if (!passed) return res.sendStatus(204); // ignore tiny plays

  await User.updateOne(
    { _id: new mongoose.Types.ObjectId(userId) },
    {
      $addToSet: {
        watchHistory: new mongoose.Types.ObjectId(videoId),
      },
    }
  );
  const user=User.findById(req.user?._id)
  console.log("updated")
  console.log(user)
  return res.sendStatus(204);
});

// controllers/watchController.js   (same file, lower down)
export const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("watchHistory") // keep just what we need
    .populate({
      path: "watchHistory",
      select:
        "videoFile thumbnail duration views description title", // include any fields you need
      populate: {
        path: "owner",
        select: "avatar",
      },
    });

  if (!user) throw new ApiError(404, "User not found");

  res.status(200).json(
    new ApiResponse(
      200,
      user.watchHistory, // now rich video docs
      "Watch history fetched successfully"
    )
  );
});
