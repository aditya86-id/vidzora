import React, { useState } from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Avatar,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import VideocamIcon from "@mui/icons-material/Videocam";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import RecentActorsIcon from "@mui/icons-material/RecentActors";
import HistoryIcon from "@mui/icons-material/History";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Sidebar = ({ sideNavBar }) => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);

  const handleChannel = () => {
    const userId = localStorage.getItem("userId");
    if (userId) navigate(`/user/${userId}`);
  };

  const handleHistory = () => {
    const userId = localStorage.getItem("userId");
    if (userId) navigate("/history");
  };

  const handlePlayList = () => {
    const userId = localStorage.getItem("userId");
    if (userId) navigate("/playlist");
  };

  const handleLikedVideos = () => {
    const userId = localStorage.getItem("userId");
    if (userId) navigate("/liked-videos");
  };

  const handleHome = () => navigate("/");

  const handleSubscription = () => {
    const userId = localStorage.getItem("userId");
    if (userId) navigate("/subscription");
  };

  const handleProf = (channelId) => {
    console.log("Navigating to channel with ID:", channelId); // Confirm correct ID
    const userId = localStorage.getItem("userId");
    if (userId) navigate(`/user/${channelId}`);
  };

  const handleYourVideos = () => {
    console.log("Navigating to your videos");
    const userId = localStorage.getItem("userId");
    if (userId) navigate(`/user/${userId}`);
  };

  useEffect(() => {
    const fetchSubscription = async () => {
      const rawToken = localStorage.getItem("accesstoken");
      const token = rawToken ? rawToken.trim() : null;
      if (token) {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_API_URL}/subscription/`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log(res);
          setSubscriptions(res.data.data);
        } catch (err) {
          console.log(err);
        }
      }
    };

    fetchSubscription();
  }, []);

  if (!sideNavBar) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: "56px",
        left: 0,
        height: "calc(100vh - 56px)",
        width: 240,
        bgcolor: "black",
        color: "white",
        overflowY: "auto",
        display: { xs: "none", sm: "block" },
        zIndex: 10,
      }}
    >
      <List>
        <ListItemButton onClick={handleHome}>
          <ListItemIcon>
            <HomeIcon sx={{ color: "white" }} />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItemButton>

        <ListItemButton onClick={handleSubscription}>
          <ListItemIcon>
            <SubscriptionsIcon sx={{ color: "white" }} />
          </ListItemIcon>
          <ListItemText primary="Subscription" />
        </ListItemButton>
      </List>

      <Divider sx={{ borderColor: "#353131", mx: 1 }} />

      <List>
        <ListItemButton>
          <ListItemText primary="You" />
          <ArrowForwardIosIcon sx={{ fontSize: 16, color: "white" }} />
        </ListItemButton>

        <ListItemButton onClick={handleChannel}>
          <ListItemIcon>
            <RecentActorsIcon sx={{ color: "white" }} />
          </ListItemIcon>
          <ListItemText primary="Your Channel" />
        </ListItemButton>

        <ListItemButton onClick={handleHistory}>
          <ListItemIcon>
            <HistoryIcon sx={{ color: "white" }} />
          </ListItemIcon>
          <ListItemText primary="History" />
        </ListItemButton>

        <ListItemButton onClick={handlePlayList}>
          <ListItemIcon>
            <PlaylistPlayIcon sx={{ color: "white" }} />
          </ListItemIcon>
          <ListItemText primary="Playlists" />
        </ListItemButton>

        <ListItemButton onClick={handleYourVideos}>
          <ListItemIcon>
            <OndemandVideoIcon sx={{ color: "white" }} />
          </ListItemIcon>
          <ListItemText primary="Your Videos" />
        </ListItemButton>

        <ListItemButton onClick={handleLikedVideos}>
          <ListItemIcon>
            <ThumbUpOffAltIcon sx={{ color: "white" }} />
          </ListItemIcon>
          <ListItemText primary="Liked Videos" />
        </ListItemButton>
      </List>

      <Divider sx={{ borderColor: "#353131", mx: 1, mt: 2 }} />

      <Typography variant="subtitle2" sx={{ pl: 2, pt: 2, fontWeight: 600 }}>
        Subscription
      </Typography>

      <div className="cursor-pointer">
        {subscriptions.map((subscription) => (
          <ListItemButton
            key={subscription._id}
            onClick={() => {
              console.log(subscription.subscribedChannel?._id);
              handleProf(subscription.subscribedChannel?._id);
            }}
          >
            <ListItemIcon>
              <Avatar
                src={subscription.subscribedChannel.avatar}
                alt="Channel Avatar"
                sx={{ width: 30, height: 30 }}
              />
            </ListItemIcon>
            <ListItemText primary={subscription.subscribedChannel.username} />
          </ListItemButton>
        ))}
      </div>
    </Box>
  );
};

export default Sidebar;
