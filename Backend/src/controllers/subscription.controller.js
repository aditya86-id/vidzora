import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Channel is not valid");
  }

  const isSubscribed = await Subscription.findOne({
    channel: channelId,
    subscriber: req.user?._id,
  });

  if (isSubscribed) {
    await Subscription.findByIdAndDelete(isSubscribed?._id);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { isSubscribed: false },
          "unsubscibed successfully"
        )
      );
  }

  await Subscription.create({
    channel: channelId,
    subscriber: req.user?._id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { isSubscribed: true }, "subscribed successfully")
    );
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  console.log("channelId", channelId);

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscribers",
        pipeline: [
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribedToSubscribers",
            },
          },
          {
            $addFields: {
              subscribedToSubscriber: {
                $cond: {
                  if: {
                    $in: [
                      new mongoose.Types.ObjectId(channelId),
                      "$subscribedToSubscribers.subscriber",
                    ],
                  },
                  then: true,
                  else: false,
                },
              },
              subscribersCount: { $size: "$subscribedToSubscribers" },
            },
          },
        ],
      },
    },
    {
      $unwind: "$subscribers",
    },
    {
      $project: {
        _id: 0,
        subscriber: {
          _id: "$subscribers._id",
          fullName: "$subscribers.fullName",
          username: "$subscribers.username",
          avatar: "$subscribers.avatar.url",
          subscribedToSubscriber: "$subscribers.subscribedToSubscriber",
          subscribersCount: "$subscribers.subscribersCount",
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribers,
        "Subscribers detail fetched successfully"
      )
    );
});


const checkSubscriptionStatus = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const existing = await Subscription.findOne({
    channel: channelId,
    subscriber: req.user._id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isSubscribed: !!existing },
        "Subscription status fetched"
      )
    );
});


// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const subscriberId  = req.user?._id;

  console.log("subscriberId", subscriberId);

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "subscriberId is not valid");
  }

const subscribedChannels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "subscribedChannel",
        pipeline: [
          {
            $lookup: {
              from: "videos",
              localField: "_id",
              foreignField: "owner",
              as: "videos",
            },
          },
        ],
      },
    },
    {
      $addFields: {
        "subscribedChannel.latestVideo": {
          $last: "$subscribedChannel.videos",
        },
      },
    },
    {
      $unwind: "$subscribedChannel",
    },
    {
      $project: {
        _id: 1,
        subscribedChannel: {
          _id: 1,
          username: 1,
          fullName: 1,
          avatar: 1,
          latestVideo: {
            _id: 1,
            "videoFile.url": 1,
            thumbnail: 1,
            title: 1,
            description: 1,
            views: 1,
            duration: 1,
            createdAt: 1,
            owner: 1,
          },
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels,
        "Subscribed channels fetched successfully"
      )
    );
});

const getSubscriberCount = async (req, res) => {
  const { channelId } = req.params; // Get the channelId from the request parameters

  try {
    // Count the number of subscriptions where the channel is the given channelId
    const subscriberCount = await Subscription.countDocuments({ channel: channelId });

    // Return the subscriber count as a response
    res.json({ subscriberCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching subscriber count" });
  }
};

export { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription, checkSubscriptionStatus,getSubscriberCount };
