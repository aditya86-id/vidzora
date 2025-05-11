import React, { useEffect, useState } from "react";
import axios from "axios";

const WatchHistory = ({ sideNavBar }) => {
  const [watchHistory, setWatchHistory] = useState([]);

  useEffect(() => {
    const fetchWatchHistory = async () => {
      try {
        const token = localStorage.getItem("accesstoken")?.trim();

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/watch/history`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setWatchHistory(res.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch watch history", err);
      }
    };

    fetchWatchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div
        className={`${
          sideNavBar ? "sm:ml-[270px] mt-[40px]" : "ml-[0px] mt-[70px]"
        }`}
      >
        <h1 className="text-2xl font-bold mb-6 text-white">
          Your Watch History
        </h1>

        {watchHistory.length === 0 ? (
          <p className="text-white">No videos watched yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {watchHistory.map((video, index) => (
              <div
                key={index}
                className="bg-[#1e1e1e] p-4 rounded-xl cursor-pointer"
                onClick={() => (window.location.href = `/watch/${video._id}`)}
              >
                <div className="relative">
                  <img
                    src={video.thumbnail?.url}
                    alt={video.title}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <span className="absolute bottom-1 right-1 text-xs bg-black bg-opacity-70 px-2 py-0.5 rounded text-white">
                    {Math.floor(video?.duration / 60)}:
                    {String(Math.floor(video?.duration % 60)).padStart(2, "0")}
                  </span>
                </div>
                <div className="mt-4 flex items-start gap-3">
                  <img
                    src={video.owner?.avatar}
                    alt="Owner avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-lg font-semibold truncate">
                      {video.title}
                    </h2>
                    {/* You can add more fields like views or date here */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchHistory;
