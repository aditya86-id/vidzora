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
        "http://localhost:5000/api/v1/video/",
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
    <div className="bg-black h-screen fixed inset-0 mb-5">
      <div className="mt-[71px] flex justify-center">
        <div className="Video-upload flex flex-col items-center justify-center border-[2px] w-[500px] sm:w-[700px] shadow-[0.5px_0.5px_8px_white] mt-10 p-6">
          <div className="Video-tag flex items-center">
            <YouTubeIcon sx={{ color: "red", fontSize: "54px" }} />
            <h1 className="font-medium text-2xl text-white mt-2">
              Upload Video
            </h1>
          </div>
          <div class="mt-6 flex flex-col gap-4 w-[400px] sm:w-[500px]">
            <input
              type="text"
              placeholder="Title of Video"
              className="bg-[#222222] text-white p-2 rounded-lg"
              value={videoUpload.title}
              onChange={(e) => handleVideoUpload(e, "title")}
            ></input>
            <input
              type="text"
              placeholder="Description"
              className="bg-[#222222] text-white p-2 rounded-lg"
              value={videoUpload.description}
              onChange={(e) => handleVideoUpload(e, "description")}
            ></input>
          </div>
          <div className="flex flex-col gap-6 mt-7">
            <div class="flex gap-2 items-center">
              <h2 className="text-white font-medium">Thumbnail</h2>
              <input
                type="file"
                accept="image/*"
                className="text-white cursor-pointer"
                onChange={(e) => setThumbnailFile(e.target.files[0])}
              ></input>
            </div>
            <div class="flex gap-2 items-center">
              <h2 className="text-white font-medium">Video</h2>
              <input
                type="file"
                accept="video/mp4, video/webm, video/*"
                className="text-white cursor-pointer"
                onChange={(e) => setVideoFile(e.target.files[0])}
              ></input>
            </div>
          </div>
          <div>
            <div className="flex gap-6 mt-7">
              <h2
                className="text-white font-medium border-[1px] px-3 py-2 rounded-lg cursor-pointer hover:bg-white hover:text-black"
                onClick={handleUpload}
              >
                Upload
              </h2>
              <Link
                to="/"
                className="text-white font-medium border-[1px] px-3 py-2 rounded-lg cursor-pointer hover:bg-white hover:text-black"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>
      {progress && (
                  <Box sx={{ width: "100%" }}>
                    <LinearProgress />
                  </Box>
                )}
    </div>
  );
}

export default VideoUpload;
