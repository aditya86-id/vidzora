import axios from "axios"; // Optional if you use Redux to handle logged-in user
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

function UpdateVideo() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState({
    title: "",
    description: "",
    thumbnail: null,
  });
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch video details for editing
  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/video/v/${videoId}`
        );
        console.log(res);
        setVideo({
          title: res.data.data.title,
          description: res.data.data.description,
        });
      } catch (err) {
        setError("Failed to fetch video details.");
      }
    };

    fetchVideoDetails();
  }, [videoId]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setVideo((prevState) => ({ ...prevState, [name]: value }));
  };

  // Handle thumbnail preview
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailPreview(URL.createObjectURL(file));
      setVideo((prevState) => ({ ...prevState, thumbnail: file }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("title", video.title);
    formData.append("description", video.description);
    if (video.thumbnail) formData.append("thumbnail", video.thumbnail);

    try {
      const token = localStorage.getItem("accesstoken")?.trim();
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/video/v/${videoId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Video updated successfully!");
      navigate(`/user/${res.data.data.owner}`);
    } catch (err) {
      toast.error("Error updating the video.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-video-container bg-black h-screen flex flex-col items-center justify-center text-white">
      <h1 className="text-4xl font-bold mb-5">Update Video</h1>
      {error && <p className="text-red-600">{error}</p>}
      <form
        onSubmit={handleSubmit}
        className="w-1/2 bg-gray-800 p-6 rounded-lg shadow-md"
      >
        <div className="mb-4">
          <label htmlFor="title" className="block text-lg">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={video.title}
            onChange={handleChange}
            className="w-full p-2 mt-2 text-black rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-lg">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={video.description}
            onChange={handleChange}
            className="w-full p-2 mt-2 text-black rounded"
            rows="4"
            required
          ></textarea>
        </div>

        <div className="mb-4">
          <label htmlFor="thumbnail" className="block text-lg">
            Thumbnail
          </label>
          <input
            type="file"
            id="thumbnail"
            name="thumbnail"
            onChange={handleThumbnailChange}
            className="mt-2"
          />
          {thumbnailPreview && (
            <div className="mt-2">
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="w-32 h-32 object-cover rounded"
              />
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-end">
          <button
            type="submit"
            className="bg-blue-600 px-4 py-2 rounded-lg text-white"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Video"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UpdateVideo;
