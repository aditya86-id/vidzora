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
          "http://localhost:5000/api/v1/subscription/",
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
    <div className="min-h-screen p-8 bg-black mt-[61px]">
      <Sidebar sideNavBar={sideNavBar} />
      <div
        className={`${
          sideNavBar ? "sm:ml-[270px] mt-[40px]" : "ml-[0px] mt-[70px]"
        }`}
      >
        <h1 className={`text-3xl font-bold mb-9 text-white`}>
          My Subscriptions
        </h1>
        <div className="flex gap-5 mb-6">
          {subscriptions.map((subscription) => (
            <div key={subscription._id}>
              <img
                src={subscription.subscribedChannel.avatar}
                alt="Channel Avatar"
                className="ml-6 w-16 h-16 rounded-full border-2 border-gray-300"
              ></img>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-4 lg:grid-cols-5">
          {subscriptions.map((subscription) => (
            <div
              key={subscription._id}
              className="p-6 rounded-2xl shadow-md hover:shadow-lg transition"
            >
              {subscription.subscribedChannel.latestVideo
                .slice(0, 1)
                .map((video) => (
                  <img
                    key={video._id}
                    src={video.thumbnail.url}
                    alt={video.title}
                    className=" w-60 h-40 object-cover rounded-lg"
                  />
                ))}
              <div className="flex items-center gap-4 mt-2">
                {subscription.subscribedChannel.latestVideo
                  .slice(0, 1)
                  .map((video) => (
                    <div key={video._id}>
                      <h2 className="text-lg font-semibold text-gray-800">
                        {video.title}
                      </h2>
                      <p className="text-gray-500">
                        {subscription.subscribedChannel.username}
                      </p>
                      <p className="text-gray-500">{video.views} views</p>
                    </div>
                  ))}
              </div>

              {/* Latest videos thumbnails */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
