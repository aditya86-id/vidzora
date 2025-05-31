import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //res.json(201, new ApiResponse(201, {}, "User registered successfully"));
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username,email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res
  const { fullName, email, username, password, about } = req.body;
  console.log("email:", email);
  console.log("Request body:", req.body);
  console.log("Uploaded files:", req.files);

  if (
    [fullName, email, username, password, about].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }
  console.log(req.files);

  const avatarLocalPath = req.files?.avatar[0]?.path;
  //const coverImageLocalPath=req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    about,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering the user");
  }

  console.log("Created User:", createdUser);

  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //req.body->data
  //check whether the details are correct
  //generate the access token and refresh token on sucessful login

  const { email, username, password } = req.body;
  console.log("hi");
  console.log(username);
  console.log(email);

  if (!(username || email)) {
    //it will throw error if either username or email is not inputted.its on us whether we want to use one or both
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }], //it will check for either username or email
  });

  console.log(user);

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Password is invalid");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  //The data which will be sending to the user
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  console.log(loggedInUser);

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in Successfully"
      )
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid Password");
  }
  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"));
});

import sendEmail from "../utils/sendEmail.js"; // Adjust path as needed

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const token = jwt.sign(
    { userId: user._id },
    process.env.FORGOT_PASSWORD_SECRET,
    { expiresIn: "15m" }
  );

  const resetUrl = `https://youtube-1-awig.onrender.com/reset-password/${token}`;
  const html = `
    <p>Hello ${user.name},</p>
    <p>Click the link below to reset your password:</p>
    <a href="${resetUrl}">Reset Password</a>
    <p>This link will expire in 10 minutes.</p>
  `;

  await sendEmail(user.email, "Password Reset", html);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Reset link sent to email"));
});

const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  console.log(token);

  try {
    // 1. Verify token (was sent via email)
    const decoded = jwt.verify(token, process.env.FORGOT_PASSWORD_SECRET);
    console.log(decoded);
    const userId = decoded.userId;

    // 2. Find user
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "Invalid token or user not found" });
    }

    // 3. Update password (assuming you hash it in pre-save hook)
    user.password = password;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    return res.status(400).json({ message: "Token expired or invalid" });
  }
};

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  console.log(fullName, email);

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName: fullName,
        email: email,
      },
    },
    { new: true }
  ).select("-password");

  //const deleteAvatar=await deleteFromCloudinary(user.avatar.public_id)

  if (req.file) {
    const avatarLocalPath = req.file.path;
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
      throw new ApiError(400, "Error while Uploading on cloudinary");
    }

    await User.findByIdAndUpdate(req.user.id, {
      $set: {
        avatar: avatar.url,
      },
    });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, user, "Account details are updated successfully")
    );
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file is missing");
  }

  const user1 = User.findById(req.user?._id);
  console.log(user1.avatar.public_id);
  if (!user1) {
    throw new ApiError(200, "user not found");
  }

  if (user1.avatar) {
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  console.log(avatar.public_id);

  if (!avatar.url) {
    throw new ApiError(400, "error while uploading on cloudinary");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res.status(200).json(200, user, "Avatar updated successfully");
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "CoverImage is missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "Error happened while uploading on cloudinary");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");

  return res.status(200).json(200, user, "coverImage updated successfully");
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username) {
    throw new ApiError(400, "username is missing");
  }
  const channel = await User.aggregate([
    {
      $match: {
        username: username,
      },
    },
    {
      $lookup: {
        from: "subscriptions", // converted into smaller letters and become plural
        localField: "_id",
        foreignField: "channel",
        as: "Subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "SubscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: { $ifNull: ["$Subscribers", []] }, // If Subscribers is missing, use an empty array
        },
        channelsSubscribedToCount: {
          $size: { $ifNull: ["$SubscribedTo", []] }, // If SubscribedTo is missing, use an empty array
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$Subscribers.subscriber"] }, // Check if the user is subscribed
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successFully")
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id).populate({
    path: "watchHistory",
    populate: {
      path: "owner",
      select: "avatar",
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user.watchHistory,
        "Watch history fetched successfully"
      )
    );
});

const getchannelProfile = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, "Channel id is missing");
  }

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid Channel Id");
  }

  const user = await User.findById(channelId).select("-password");

  if (!user) {
    throw new ApiError(404, "Channel not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, user, "channel Profile fetched successfully"));
});

export {
  changeCurrentPassword,
  forgotPassword,
  getchannelProfile,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logOutUser,
  refreshAccessToken,
  registerUser,
  resetPassword,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
};

const registerUsers = asyncHandler(async (req, res) => {
  const { fullName, username, email, password } = req.body;

  if (!fullName || !username || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const details = await User.findOne(($or = [{ username }, { email }]));

  if (details) {
    throw new ApiError(409, "User withis mail or username already exist");
  }

  const user = await User.create({
    username: username,
    fullName: fullName,
    email: email,
    password: password,
  });

  const createdUser = await User.findById(user._id).select("-password");

  res
    .status(200)
    .json(new ApiResponse(200, createdUser, "userRegistered successfully"));
});

const getAllUsers = asyncHandler(async (req, res) => {
  const user = await User.find().select("-password");
  if (!user) {
    throw new ApiError(404, "No user found");
  }
  res.status(200).json({
    status: 200,
    data: user,
    message: "All users fetched successfully",
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new error(400, "userId is required");
  }
  if (!isValidObjectId(userId)) {
    throw new error(400, "userId is not valid");
  }

  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new error(404, "user not found");
  }

  res.statue(200).json({
    status: 200,
    data: user,
    message: "user fetched successfully",
  });
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.params;
  const { fullName, email, username } = req.body;
  if (!userId) {
    throw new error(400, "userId is required");
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new error(400, "userId is not valid");
  }

  const updatedUser = await User.findByIdAndUpdate(
    {
      userId,
    },
    {
      $set: {
        fullName: fullName,
        email: email,
        username: username,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  ).select("-password");

  if (!updatedUser) {
    throw new error(400, "error while updating user");
  }

  res.status(200).json({
    status: 200,
    data: updatedUser,
    message: "user profile updated successfully",
  });
});

//Hard delete user
const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new error(400, "userId is required");
  }
  if (!mongoose.types.objectId.isValid(userId)) {
    throw new error(400, "userId is not valid");
  }

  const deletedUser = await User.findByIdAndDelete(userId);

  if (!deletedUser) {
    throw new error(404, "user not found");
  }
  res
    .status(200)
    .json({ status: 200, data: {}, message: "user deeted successfully" });
});

//soft delete user

const softDeleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new error(400, "userId is required");
  }

  if (!mongoose.Types.objectId.isVlaid(userId)) {
    throw new error(400, "userId is not valid");
  }

  const updateUser = User.findByIdAndUpdate(
    userId,
    {
      $set: {
        isDeleted: true,
      },
    },
    {
      new: true,
    }
  );

  if (!updateUser) {
    throw new error(404, "error occured while deleting user");
  }

  res.status(200).json({
    status: 200,
    data: updateUser,
    message: "user soft deletd successfully",
  });
});

// To delete softly this should be in your schema
//     isDeleted: {
//   type: Boolean,
//   default: false,
// }

const subscribeToChannel = asyncHandler(async (req, res) => {
  const { subscriber, channel } = req.body;
  if (!subscriber || !channel) {
    throw new error(400, "subscriber and channel are required");
  }

  if (!mongoose.Types.objectId.isValid(subscriber)) {
    throw new error(400, "subscriber is not valid");
  }

  if (!mongoose.Types.objectId.isValid(channel)) {
    throw new error(400, "channel is not valid");
  }

  const existedSubscriber = Subscription.findOne({
    $or: [{ subscriber }, { channel }],
  });

  if (existedSubscriber) {
    throw new error(409, "User is alredy subscribed to this channel");
  }

  const newSubscription = await Subscription.create({
    subscriber: subscriber,
    channel: channel,
  });

  res.status(200).json({
    status: 200,
    data: newSubscription,
    message: "user succesfully subcribed to this channel",
  });
});

const listAllSubscribedChannels = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (!userId) {
    throw new error(500, "error occured while fetching userId");
  }

  if (!mongoose.Types.objectId.isValid(userId)) {
    throw new error(400, "userId is not valid");
  }

  const subcribedChannels = await Subscription.find({
    subsriber: userId,
  }).populate("channel");

  if (!subscribedChannels) {
    throw new error(404, "No subcribed channel found");
  }

  const subscribedChannelDetails = Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.objectId(userId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channelDetails",
      },
    },
    {
      $unwind: $channelDetails,
    },
    {
      $project: {
        _id: 1,
        avatar: 1,
        username: 1,
        fullName: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 200,
    data: subscribedChannelDetails,
    message: "All subcribrf fetched successfully",
  });
});

const listAllsubscriberschannels = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId) {
    throw new error(400, "channelId is required");
  }

  if (!mongoose.types.objectId.isValid(channelId)) {
    throw new error(400, "channelId is not valid");
  }

  const allSubscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.objectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriberDetails",
      },
    },
    {
      $unwind: "$subscriberDetails",
    },
    {
      $project: {
        _id: 1,
        avatar: 1,
        username: 1,
        fullname: 1,
        createdAt: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 200,
    data: allSubscribers,
    message: "All subscribers details of this channel fetched successfully",
  });
});

const listAllsubscriberschannel = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId) {
    throw new error(400, "channelId is required");
  }

  if (!mongoose.types.objectId.isValid(channelId)) {
    throw new error(400, "channelId is not valid");
  }

  const subscribers = await Subscription.find({ channel: channelId }).populate(
    "subscriber"
  );

  if (!subscribers) {
    throw new error(404, "No subscribers found");
  }

  const subscriberDetails = subscribers.map((s) => ({
    _id: s.subscriber._id,
    avatar: s.subscriber.avatar,
    fullName: s.subscriber.fullName,
  }));

  res.status(200).json({
    status: 200,
    data: subscriberDetails,
    message: "All subscribers detials fetched successfullly",
  });
});

const userSubscriptionStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (!mongoose.Types.objectId.isValid(userId)) {
    throw new error(400, "userId is not valid");
  }

  const subscribedChannels = await Subscribeription.countDocuments({
    subscriber: userId,
  });

  res.status(200).json({
    status: 200,
    data: subscribedChannels,
    message: "channel subscribed by this user fetched successfully",
  });

  const userSubscribers = await Subscription.countDocuments({
    channel: userId,
  });

  res.status(200).json({
    status: 200,
    data: userSubscribers,
    message: "total subscribers of this channel fetched successfully",
  });
});

const userSubscription = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.Types.objectId.isValid(userId)) {
    throw new error(400, "userId is not valid");
  }

  const userSubscribedTo = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.objectId(userId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "SubscribedTo",
      },
    },
    subscribe,
  ]);
});
