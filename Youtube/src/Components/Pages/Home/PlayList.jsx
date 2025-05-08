import React from "react";
import Sidebar from "../../Header/Sidebar";

const PlayList = ({ sideNavBar }) => {
  const playlists = [
    {
      id: 1,
      title: "React Tutorials",
      thumbnail: "https://via.placeholder.com/150",
      videos: 10,
    },
    {
      id: 2,
      title: "JavaScript Basics",
      thumbnail: "https://via.placeholder.com/150",
      videos: 15,
    },
    {
      id: 3,
      title: "CSS Animations",
      thumbnail: "https://via.placeholder.com/150",
      videos: 8,
    },
    {
      id: 4,
      title: "Web Development",
      thumbnail: "https://via.placeholder.com/150",
      videos: 20,
    },
  ];

  return (
    <div className="bg-black h-screen overflow-hidden">
      <Sidebar sideNavBar={sideNavBar} />
      <div
        className={`flex-1 overflow-y-auto ${
          sideNavBar ? "sm:ml-[270px] mt-[40px]" : "ml-[0px] mt-[70px]"
        } p-4`}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Playlists</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition duration-300 cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={playlist.thumbnail}
                    alt={playlist.title}
                    className="w-full h-40 object-cover"
                  />
                  <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {playlist.videos} videos
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-semibold text-sm truncate">
                    {playlist.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayList;
