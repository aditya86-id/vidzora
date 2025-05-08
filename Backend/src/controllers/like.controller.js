import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { Tweet } from "../models/tweet.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const likeAlready = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });
  const likeCount = await Like.countDocuments({ video: videoId });

  if (likeAlready) {
    await Like.findByIdAndDelete(likeAlready._id);
    return res.status(200).json({ isLiked: false,likeCount:likeCount-1 });
  }

  await Like.create({
    video: videoId,
    likedBy: req.user._id,
  });

  return res.status(200).json({ isLiked: true,likeCount:likeCount+1 });
});


const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const likeAlready = Like.findOne({
    comment: commentId,
    likedBy: req.user?._id,
  });

  if (likeAlready) {
    await Like.findByIdAndDelete(likeAlready?._id);

    return res.status(200).json(200, { isLiked: false });
  }

  await Like.create({
    comment: commentId,
    likedBy: req.user?._id,
  });

  return res.status(200).json(200, { isLiked: true });
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  const tweet = Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(200, "Tweet not found");
  }

  const likeAlready = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user?._id,
  });

  if (likeAlready) {
    await Like.findByIdAndDelete(likeAlready?._id);

    return res.status(200).json(200, { isLiked: false });
  }

  Like.create({
    tweet: tweetId,
    likedBy: req.user?._id,
  });

  return res.status(200).json(200, { isLiked: true });
});

const getLikedVideos = asyncHandler(async (req, res) => {

const likeAggregateVideos = await Like.aggregate([
  {
    $match: {
      likedBy: new mongoose.Types.ObjectId(req.user?._id),
    },
  },
  {
    $lookup: {
      from: "videos",
      localField: "video",
      foreignField: "_id",
      as: "likedVideo",
    },
  },
  {
    $unwind: "$likedVideo",
  },
  {
    $lookup: {
      from: "users",
      localField: "likedVideo.owner",
      foreignField: "_id",
      as: "ownerDetails",
    },
  },
  {
    $unwind: "$ownerDetails",
  },
  {
    $sort: {
      createdAt: -1,
    },
  },
  {
    $project: {
      _id: 1,
      likedVideos: {
        _id: "$likedVideo._id",
        "videoFile.url": "$likedVideo.videoFile.url",
        "thumbnail.url": "$likedVideo.thumbnail.url",
        title: "$likedVideo.title",
        description: "$likedVideo.description",
        views: "$likedVideo.views",
        createdAt: "$likedVideo.createdAt",
        isPublished: "$likedVideo.isPublished",
        ownerDetails: {
          username: "$ownerDetails.username",
          fullName: "$ownerDetails.fullName",
          avatar: "$ownerDetails.avatar",
        },
      },
    },
  },
])



  console.log(likeAggregateVideos);

  return res
    .status(200)
    .json(new ApiResponse(200,likeAggregateVideos, "Liked videos fetched successfully"));
})

const getLikeStatus = asyncHandler(async (req, res) => {
  const { videoId, tweetId, commentId } = req.query;

  const filter = { likedBy: req.user._id };

  if (videoId) filter.video = videoId;
  else if (tweetId) filter.tweet = tweetId;
  else if (commentId) filter.comment = commentId;
  else throw new ApiError(400, "No valid target ID provided");

  const like = await Like.findOne(filter);

  return res.status(200).json({
    isLiked: !!like,
  });
});




export { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike,getLikeStatus };
