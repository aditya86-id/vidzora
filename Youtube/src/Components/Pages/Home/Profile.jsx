import React, { useEffect, useState } from "react";
import Sidebar from "../../Header/Sidebar";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Link, useParams, useNavigate } from "react-router-dom";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import axios from "axios";

function Profile({ sideNavBar }) {
  const [profile, setProfile] = useState({});
  const [videos, setVideos] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const { id: userId } = useParams();
  const currentUserId = localStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChannelProfile = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/users/channel-profile/${userId}`
        );
        setProfile(res.data.data); // Proper profile info
      } catch (err) {
        console.error("Error fetching channel profile:", err);
      }
    };

    const fetchChannelVideos = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/video?userId=${userId}`
        );
        setVideos(res.data.data.docs || res.data.data); // Handle both paginated and flat responses
      } catch (err) {
        console.error("Error fetching videos:", err);
      }
    };

    if (userId) {
      fetchChannelProfile();
      fetchChannelVideos();
    }
  }, [userId]);

  const handleMenuToggle = (index) => {
    setActiveMenu(activeMenu === index ? null : index);
  };

  const handleEdit = (videoId) => {
    navigate(`/update-video/${videoId}`);
  };

  const handleDelete = async (videoId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this video?"
    );
    if (!confirmDelete) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/video/delete/${videoId}`
      );
      setVideos(videos.filter((item) => item._id !== videoId));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleProfile = () => {
    navigate(`/update-profile`);
  };

  return (
    <div className="Profile mt-[71px] bg-black h-screen overflow-x-hidden overflow-y-auto">
      <Sidebar sideNavBar={sideNavBar} />
      <div
        className={`Profile-page mt-7 flex-1 p-4 overflow-y-auto ${
          sideNavBar ? "sm:ml-[270px] mt-[70px]" : "ml-[0px] mt-[70px]"
        }`}
      >
        <div className="Profile-top flex gap-4">
          <img
            src={profile?.avatar || "default-avatar.png"}
            alt="User avatar"
            className="w-[230px] h-[230px] rounded-full object-cover cursor-pointer sm:w-[180px] sm:h-[180px]"
            onClick={handleProfile}
          />
          <div className="flex flex-col gap-2 justify-center">
            <h1 className="font-bold text-white text-4xl">
              {profile?.username || "Channel"}
            </h1>
            <h2 className="text-gray-400">
              @{profile?.username} · {videos.length} videos
            </h2>
            <h2 className="text-gray-400">
              {profile?.about || "No description available."}
            </h2>
          </div>
        </div>

        <div className="profile-page-bottom w-full mt-8">
          <div className="flex gap-2 text-gray-300 items-center text-lg">
            <PlayArrowIcon />
            <h1>Videos</h1>
          </div>
          <div className="border-gray-600 border-[1px] mt-2 mb-4"></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {videos.map((item, index) => (
              <div
                key={index}
                className="bg-[#1e1e1e] p-3 rounded-xl shadow-md w-full max-w-full relative"
              >
                <Link to={`/watch/${item?._id}`}>
                  <img
                    src={item?.thumbnail?.url}
                    className="h-[120px] w-full rounded-lg object-cover"
                    alt={item?.title}
                  />
                  <div className="mt-2">
                    <h2 className="text-white text-sm font-semibold truncate min-w-0">
                      {item?.title}
                    </h2>
                    <p className="text-gray-500 text-xs">
                      {item?.createdAt?.slice(0, 10)}
                    </p>
                  </div>
                </Link>

                {currentUserId === item.owner && (
                  <div className="absolute top-2 right-2">
                    <MoreVertIcon
                      className="text-white cursor-pointer"
                      onClick={() => handleMenuToggle(index)}
                    />
                    {activeMenu === index && (
                      <div className="absolute right-0 mt-2 w-32 bg-white rounded shadow-lg z-10">
                        <button
                          className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                          onClick={() => handleEdit(item._id)}
                        >
                          Update
                        </button>
                        <button
                          className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
                          onClick={() => handleDelete(item._id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
