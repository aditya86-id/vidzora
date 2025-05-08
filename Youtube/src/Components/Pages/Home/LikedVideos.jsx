import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function LikedVideos({ sideNavBar }) {
  const [likedVideos, setLikedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLikedVideos = async () => {
    try {
      const token = localStorage.getItem("accesstoken")?.trim();
      if (!token) {
        setError("No access token found.");
        return;
      }

      const res = await axios.get("http://localhost:8000/api/v1/likes/videos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data && Array.isArray(res.data.data)) {
        setLikedVideos(res.data.data);
      } else {
        setLikedVideos([]);
        setError("Liked videos not available.");
      }

      setLoading(false);
    } catch (err) {
      setError("Failed to fetch liked videos.");
      setLoading(false);
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLikedVideos();
  }, []);

  if (loading) {
    return (
      <div className="text-white text-center mt-10">
        Loading liked videos...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  return (
    <div className="p-6">
      <div
        className={`${
          sideNavBar ? "sm:ml-[270px] mt-[40px]" : "ml-[0px] mt-[70px]"
        }`}
      >
        <h1 className="text-2xl font-bold text-white mb-6">Liked Videos</h1>
        {likedVideos.length === 0 ? (
          <div className="text-white text-center">No liked videos found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {likedVideos.map((video) => (
              <Link
                key={video._id}
                to={`/watch/${video.likedVideos._id}`}
                className="group hover:scale-105 transition-transform duration-200"
              >
                <div className="bg-zinc-900 rounded-lg overflow-hidden shadow-md">
                  <img
                    src={video.likedVideos.thumbnail?.url}
                    alt={video.likedVideos.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-center mb-2 gap-3">
                      <img
                        src={
                          video.likedVideos.ownerDetails?.avatar ||
                          "/default-avatar.png"
                        }
                        alt={video.likedVideos.ownerDetails?.username}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <h2 className="text-white font-semibold text-md truncate">
                          {video.title}
                        </h2>
                        <p className="text-gray-400 text-sm">
                          {video.likedVideos.ownerDetails?.username}
                        </p>
                      </div>
                    </div>
                    <div className="text-gray-500 text-sm">
                      <span>{video.likedVideos.views || 0} views</span> •{" "}
                      <span>
                        {new Date(
                          video.likedVideos.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LikedVideos;
