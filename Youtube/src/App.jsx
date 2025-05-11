import React, { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./Components/Header/Navbar.jsx";
import Home from "./Components/Pages/Home/Home.jsx";
import HomePage from "./Components/HomePage/HomePage.jsx";
import Video from "./Components/Pages/Home/Video.jsx";
import Profile from "./Components/Pages/Home/Profile.jsx";
import VideoUpload from "./Components/Pages/Home/VideoUpload.jsx";
import SignUp from "./Components/Pages/Home/SignUp.jsx";
import Sidebar from "./Components/Header/Sidebar.jsx";
import WatchHistory from "./Components/Pages/Home/WatchHistory.jsx";
import PlayList from "./Components/Pages/Home/PlayList.jsx";
import LikedVideos from "./Components/Pages/Home/LikedVideos.jsx";
import SubscriptionPage from "./Components/Pages/Home/Subscription.jsx";
import SearchResults from "./Components/Pages/Home/SearchResults.jsx";
import { ToastContainer } from "react-toastify";
import UpdateVideo from "./Components/Pages/Home/UpdateVideo.jsx";
import ForgotPassword from "./Components/Pages/Home/ForgotPassword.jsx";
import ResetPassword from "./Components/Pages/Home/ResetPassword.jsx";
import EditProfile from "./Components/Pages/Home/EditProfile.jsx";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [sideNavBar, setSideNavBar] = useState(false);
  const location = useLocation();

  const setSideNavBarFunc = (value) => {
    setSideNavBar(value);
  };

  // ✅ Detect if SignUp is active
  const isSignUpPage = location.pathname === "/signUp";
  const isWatchPage = location.pathname.startsWith("/watch/");
  const isUpload = location.pathname.startsWith("/322/upload");
  const isUpdateVideo = location.pathname.startsWith("/update/");
  const isForgotPassword = location.pathname === "/forgot-password";
  const isEditProfile = location.pathname === "/update-profile";
  // ✅ Freeze scroll when SignUp is open
  useEffect(() => {
    if (isSignUpPage) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    if (isWatchPage) {
      setSideNavBar(false); // Auto-close sidebar
    }
    if(isUpload)
    {
      setSideNavBar(false); // Auto-close sidebar
    }
    if(isUpdateVideo)
    {
      setSideNavBar(false); // Auto-close sidebar
    }
    if(isForgotPassword)
    {
      setSideNavBar(false); // Auto-close sidebar
    }
    if(isEditProfile)
    {
      setSideNavBar(false); // Auto-close sidebar
    }
  }, [isSignUpPage, isWatchPage,isUpload,isUpdateVideo,isForgotPassword,isEditProfile]);
  return (
    <div
      className={`bg-black min-h-screen flex ${
        isSignUpPage ? "pointer-events-none" : ""
      }`}
    >
      {/* Sidebar + Navbar only interactive if not in SignUp */}
      <Sidebar sideNavBar={sideNavBar} />
      <div className="flex-1">
        {!isSignUpPage && !isForgotPassword && !isEditProfile &&(
          <Navbar
            setSideNavBarFunc={setSideNavBarFunc}
            sideNavBar={sideNavBar}
          />
        )}
        
        <Routes>
          {/* ✅ SignUp rendered with pointer events ON */}
          <Route
            path="/signUp"
            element={
              <div className="fixed inset-0 z-50 pointer-events-auto">
                <SignUp />
              </div>
            }
          />

          {/* 🏠 Other normal pages */}
          <Route path="/" element={<HomePage sideNavBar={sideNavBar} />} />
          <Route path="/watch/:id" element={<Video />} />
          <Route
            path="/user/:id"
            element={<Profile sideNavBar={sideNavBar} />}
          />
          <Route path="/upload" element={<VideoUpload />} />
          <Route
            path="/playlist"
            element={<PlayList sideNavBar={sideNavBar} />}
          />
          <Route
            path="/history"
            element={<WatchHistory sideNavBar={sideNavBar} />}
          />
          <Route
            path="/liked-videos"
            element={<LikedVideos sideNavBar={sideNavBar} />}
          />
          <Route
            path="/subscription"
            element={<SubscriptionPage sideNavBar={sideNavBar} />}
          />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/update-video/:videoId" element={<UpdateVideo />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:id" element={<ResetPassword />} />
          <Route path="/update-profile" element={<EditProfile/>}/>
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
}

export default App;
