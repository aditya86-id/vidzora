import mongoose, { isValidObjectId } from "mongoose";
import { PlayList, Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name && !description) {
    throw new ApiError(400, "Both fields are required to fill");
  }

  const playlist = Playlist.create({
    name: name,
    description: description,
    owner: req.user?._id,
  });

  if (!playlist) {
    throw new ApiError(400, "error occurred while creating playlist");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist created successfully"));

  //TODO: create playlist
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!isValidObjectId(userId)) {
    throw new ApiError(404, "PlayList not found");
  }

  const userPlaylist = await PlayList.aggregate([
    {
      $match: {
        owner: mongoose.Types.ObjectId("userId"),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
      },
    },
    {
      $addFields: {
        totalVideos: {
          $size: "$videos",
        },
        totalViews: {
          $sum: "$videos.views",
        },
      },
    },
    {
      $project: {
        _id: 1,
        description: 1,
        totalVideos: 1,
        totalViews: 1,
        owner: {
          username: 1,
          "avatar.url": 1,
        },
        updatedAt: 1,
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userPlaylist,
        "User playlist is fetched successfully"
      )
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by _id
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "playlist not found");
  }

  const playList = await PlayList.findById(playlistId);

  if (!playList) {
    throw new ApiError(400, "Playlist not found");
  }

  const playListVideos = await PlayList.aggregate([
    {
      match: {
        _id: mongoose.Types.ObjectId(playlistId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
      },
    },
    {
      $match: {
        "videos.isPublished": true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $addFields: {
        totalVideos: {
          $size: "$videos",
        },
        totalViews: {
          $sum: "$videos.views",
        },
        owner: {
          $first: "$owner",
        },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        createdAt: 1,
        updatedAt: 1,
        totalVideos: 1,
        totalViews: 1,
        videos: {
          _id: 1,
          "videoFile.url": 1,
          "thumbnail.url": 1,
          title: 1,
          duration: 1,
          description: 1,
          views: 1,
          createdAt: 1,
        },
        owner: {
          _id: 1,
          username: 1,
          fullName: 1,
          "avatar.url": 1,
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, playListVideos[0], "PlayList fetched successfully")
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid PlayListId");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const playList = await PlayList.findById(playlistId);
  const video = await Video.findById(videoId);

  if (!playList) {
    throw new ApiError(404, "PlayList not found");
  }

  if (!video) {
    throw new ApiError(404, "video not found");
  }

  if (playList.owner?.toString() !== req.user?._id) {
    throw new ApiError(400, "only owner can add videos to its playlist");
  }

  const updatedPlayList = PlayList.findByIdAndUpdate(
    playList?._id,
    {
      $addToSet: {
        videos: videoId,
      },
    },
    {
      new: true,
    }
  );

  if (!updatedPlayList) {
    throw new ApiError(400, "Error which adding video to the playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlayList,
        "Added video to playList successfully"
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playList _id");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video _id");
  }

  const playList = await PlayList.findById(playlistId);
  const video = await Video.findById(videoId);

  if (!playList) {
    throw new ApiError(404, "PlayList not found");
  }
  if (!video) {
    throw new ApiError(404, "video not found");
  }

  if (playList.owner?.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "only owner can delete videos from their playlist");
  }

  const updatedPlaylist = PlayList.findByIdAndDelete(
    playlistId,
    {
      $pull: {
        videos: videoId,
      },
    },
    {
      new: true,
    }
  );

  if (!updatedPlaylist) {
    throw new ApiError(
      400,
      "Error occurred while deleting the video from the playlist"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatePlaylist,
        "Video is successfully removed from the playlist"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "invalid playlist _id");
  }

  const playList = await PlayList.findById(playlistId);

  if (playList) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playList.owner?.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "Only owner can delete its playList");
  }

  await PlayList.findByIdAndDelete(playList?._id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "PlayList successfully deleted"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "invalid playlist _id");
  }

  if (!name || !description) {
    throw new ApiError(400, "fields are required to fill");
  }
  const playList = await PlayList.findById(playlistId);

  if (!playList) {
    throw new ApiError(404, "PlayList not found");
  }

  if (playList.owner?.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "only owner can update the playlist");
  }

  const updatedPlayList = await PlayList.findByIdAndUpdate(
    playList?._id,
    {
      $set: {
        name: name,
        description: description,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(200, updatedPlayList, "Playlist updated successfully");
});

export {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
};
