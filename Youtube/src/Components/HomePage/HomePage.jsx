import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../index.css"; // Make sure this imports your global styles (like no-scrollbar)

function HomePage({ sideNavBar }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  const options = [
    "All",
    "Twenty20 Cricket",
    "Music",
    "Live",
    "Gaming",
    "Debates",
    "Democracy",
    "Anime",
    "Health",
    "Juke-box",
    "Desktop",
    "Laptop",
    "Mobile",
    "God",
    "Humanity",
  ];

  useEffect(() => {
    const url =
      selectedCategory === "All"
        ? `${import.meta.env.VITE_API_URL}/video/`
        : `${import.meta.env.VITE_API_URL}/video/category/${selectedCategory}`;

    axios
      .get(url)
      .then((res) => {
        setData(res.data.data.docs);
      })
      .catch((err) => console.log(err));
  }, [selectedCategory]);

  const handleVideoClick = async (videoId, duration) => {
    try {
      const token = localStorage.getItem("accesstoken")?.trim();

      await axios.post(
        `${import.meta.env.VITE_API_URL}/watch/progress`,
        {
          videoId,
          duration,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate(`/watch/${videoId}`);
    } catch (error) {
      console.error("Failed to report progress", error);
      navigate(`/watch/${videoId}`);
    }
  };

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Scrollable Category Bar */}
      <div
        className={`fixed top-[60px] z-10 w-full bg-black py-3 px-4 ${
          sideNavBar ? "sm:ml-[240px]" : "ml-0"
        }`}
      >
        <div className="flex gap-3 overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-hide no-scrollbar px-1">
          {options.map((item) => (
            <div
              key={item}
              onClick={() => setSelectedCategory(item)}
              className={`rounded-lg py-2 px-4 text-sm font-medium cursor-pointer transition-all duration-200 min-w-max ${
                selectedCategory === item
                  ? "bg-white text-black"
                  : "bg-[rgb(34,34,34)] hover:bg-[rgb(54,54,54)]"
              }`}
            >
              {item}
            </div>
          ))}
        </div>
      </div>


      {/* Video Grid */}
      <div
        className={`pt-[140px] pb-8 px-4 sm:px-6 md:px-8 ${
          sideNavBar ? "sm:ml-[240px]" : ""
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {data?.map((item, index) => (
            <div
              key={index}
              className="w-full cursor-pointer"
              onClick={() => handleVideoClick(item._id, item.duration)}
            >
              <div className="relative">
                <img
                  src={item?.thumbnail?.url}
                  alt={item?.title}
                  className="w-full rounded-xl aspect-video object-cover"
                />
                <div className="absolute bottom-1 right-1 text-xs bg-black bg-opacity-70 px-1 py-0.5 rounded text-white">
                  {Math.floor(item?.duration / 60)}:
                  {String(Math.floor(item?.duration % 60)).padStart(2, "0")}
                </div>
              </div>
              <div className="flex mt-2 gap-2">
                <img
                  src={item?.ownerDetails?.avatar}
                  alt="Avatar"
                  className="rounded-full w-9 h-9"
                />
                <div className="flex flex-col overflow-hidden">
                  <p className="text-sm font-medium truncate">{item?.title}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {item?.ownerDetails?.username}
                  </p>
                  <p className="text-xs text-gray-400">
                    {item?.views} views • {item?.createdAt?.slice(0, 10)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
