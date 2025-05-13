import React, { useState, useEffect } from "react";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {toast} from "react-toastify";
import { Box } from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";

function VideoUpload() {
  const [videoUpload, setVideoUpload] = useState({
    title: "",
    description: "",
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [progress, setProgress] = useState(false);
  const navigate = useNavigate();

  const handleVideoUpload = (event, name) => {
    setVideoUpload({ ...videoUpload, [name]: event.target.value });
  };

  useEffect(() => {
    const videoUpload = async () => {
      let userId = localStorage.getItem("userId");
      if (userId == null) {
        navigate("/");
      }
    };
    videoUpload();
  }, []);

  const handleUpload = async () => {
    try {
      setProgress(true);
      const formData = new FormData();
      formData.append("title", videoUpload.title);
      formData.append("description", videoUpload.description);
      formData.append("thumbnail", thumbnailFile);
      formData.append("videoFile", videoFile);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/video/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      toast.success("Video uploaded successfully!");  
      setProgress(false);
      navigate("/");
      console.log(res);
    } catch (err) {
      toast.error("Failed to upload video.");
      setProgress(false);
      console.log(err);
    }
  };

  console.log(videoUpload);
  return (
    <div className="bg-black min-h-screen fixed inset-0 overflow-y-auto">
      <div className="mt-[71px] flex justify-center px-4 sm:px-0">
        <div className="Video-upload flex flex-col items-center justify-center border-2 w-full max-w-xl sm:max-w-2xl shadow-[0.5px_0.5px_8px_white] mt-10 p-6">
          {/* Heading */}
          <div className="Video-tag flex items-center">
            <YouTubeIcon sx={{ color: "red", fontSize: "54px" }} />
            <h1 className="font-medium text-2xl text-white mt-2">
              Upload Video
            </h1>
          </div>

          {/* Input fields */}
          <div className="mt-6 flex flex-col gap-4 w-full px-2 sm:px-0">
            <input
              type="text"
              placeholder="Title of Video"
              className="bg-[#222222] text-white p-2 rounded-lg w-full"
              value={videoUpload.title}
              onChange={(e) => handleVideoUpload(e, "title")}
            />
            <input
              type="text"
              placeholder="Description"
              className="bg-[#222222] text-white p-2 rounded-lg w-full"
              value={videoUpload.description}
              onChange={(e) => handleVideoUpload(e, "description")}
            />
          </div>

          {/* File inputs */}
          <div className="flex flex-col gap-6 mt-7 w-full px-2 sm:px-0">
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <h2 className="text-white font-medium min-w-[90px]">Thumbnail</h2>
              <input
                type="file"
                accept="image/*"
                className="text-white cursor-pointer"
                onChange={(e) => setThumbnailFile(e.target.files[0])}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <h2 className="text-white font-medium min-w-[90px]">Video</h2>
              <input
                type="file"
                accept="video/mp4, video/webm, video/*"
                className="text-white cursor-pointer"
                onChange={(e) => setVideoFile(e.target.files[0])}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-6 mt-7">
            <h2
              className="text-white font-medium border px-4 py-2 rounded-lg cursor-pointer hover:bg-white hover:text-black"
              onClick={handleUpload}
            >
              Upload
            </h2>
            <Link
              to="/"
              className="text-white font-medium border px-4 py-2 rounded-lg cursor-pointer hover:bg-white hover:text-black"
            >
              Home
            </Link>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {progress && (
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
        </Box>
      )}
    </div>
  );
}

export default VideoUpload;
