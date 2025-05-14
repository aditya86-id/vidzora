import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Header/Sidebar";

const SubscriptionPage = ({ sideNavBar }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [latestVideos, setLatestVideos] = useState([]);

  const Navigate = useNavigate();
  const handleVideo = (videoId) => {
    console.log(videoId);
    Navigate(`/watch/${videoId}`);
  };

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const rawToken=localStorage.getItem("accesstoken");
        const token=rawToken?rawToken.trim():null
        if (!token) {
          console.log("Token not found");
          return;
        }
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/subscription/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(res);
        setSubscriptions(res.data.data); // your array is in data.data
        console.log(res.data.data.subscribedChannel.latestVideo);
      } catch (error) {
        console.log("Failed to fetch subscriptions:", error);
      }
    };
    fetchSubscriptions();
  }, []);

  return (
    <div className="min-h-screen bg-black pt-[61px]">
      <Sidebar sideNavBar={sideNavBar} />

      <div className={`${sideNavBar ? "sm:ml-[270px]" : "ml-0"} px-4 py-6`}>
        <h1 className="text-3xl font-bold mb-6 text-white">My Subscriptions</h1>

        {/* Avatar List */}
        <div className="flex flex-wrap gap-4 mb-8">
          {subscriptions.map((subscription) => (
            <div key={subscription._id} className="flex-shrink-0">
              <img
                src={subscription.subscribedChannel.avatar}
                alt="Channel Avatar"
                className="w-16 h-16 rounded-full border-2 border-gray-300"
              />
            </div>
          ))}
        </div>

        {/* Video Grid */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {subscriptions.map((subscription) =>
            subscription.subscribedChannel.latestVideo
              .slice(0, 1)
              .map((video) => (
                <div
                  key={video._id}
                  className="bg-[#1e1e1e] rounded-xl p-3 hover:shadow-lg transition w-full"
                  onClick={() => handleVideo(video._id)}
                >
                  <img
                    src={video.thumbnail.url}
                    alt={video.title}
                    className="w-full h-40 object-cover rounded-md"
                  />
                  <div className="mt-3">
                    <h2 className="text-white text-sm font-semibold truncate">
                      {video.title}
                    </h2>
                    <p className="text-gray-400 text-xs truncate">
                      {subscription.subscribedChannel.username}
                    </p>
                    <p className="text-gray-500 text-xs">{video.views} views</p>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
