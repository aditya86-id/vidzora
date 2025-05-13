import React, { useState, useEffect } from "react";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
//import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
//import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";

function Video() {
  const { id: videoId } = useParams();
  const [content, setContent] = useState("");
  const [video, setVideo] = useState({});
  const [comments, setComments] = useState([]);
  const [thumbUp, setThumbUp] = useState(false); // Start with false, not true
  const [thumbDown, setThumbDown] = useState(false); // Start with false, not true
  const [likeCount, setLikeCount] = useState(0); // Initial state for like count
  const [dislikeCount, setDislikeCount] = useState(0);
  const [subscribed, setSubscribed] = useState(false); // Initial state for dislike count
  const [allVideos, setAllVideos] = useState([]);
  const [subscribersCount,setSubscribersCount]=useState(0)
  const [commentIcon,setCommentIcon]=useState(false)
  // const [channelId,setChannelId]=useState("")


  const navigate = useNavigate();
  const fetchVideo = async () => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/video/v/${videoId}`
    );
    console.log(res.data); // Log the full response to check the subscriber count
    setSubscribersCount(res.data.data.subscribersCount);
    setVideo(res.data.data);
    setLikeCount(res.data.data.likeCount);
    setDislikeCount(res.data.data.dislikeCount);
  } catch (err) {
    console.log(err);
  }
};

  const fetchAllVideos = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/video/`);
      setAllVideos(res.data.data.docs);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/comments/${videoId}`
      );
      setComments(res.data.data.docs);
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddComment = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("accesstoken");
      if (!token || token.trim() === "") {
        console.error("Access token is missing or invalid");
        return;
      }
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/comments/comment/${videoId}`,
        { content },
        {
          headers: {
            Authorization: `Bearer ${token.trim()}`,
          },
        }
      );
      console.log(res.data)
      setContent("");
      fetchComments(); // Refresh comments after adding a new one
    } catch (err) {
      console.error(err);
    }
  };

  const handleVideoClick = (videoId) => {
    navigate(`/watch/${videoId}`);
  };

  const handleLike = async () => {
    try {
      const token = localStorage.getItem("accesstoken");
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/likes/toggle/v/${videoId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token.trim()}`,
          },
        }
      );
      const updatedLikeCount = res.data.likeCount;
      const updatedDislikeCount = res.data.dislikeCount;
      setLikeCount(updatedLikeCount);
      setDislikeCount(updatedDislikeCount);
      setThumbUp(!thumbUp);
      if (thumbDown) {
        setThumbDown(false);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const handleDislike = async () => {
    try {
      const token = localStorage.getItem("accesstoken");
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/likes/toggle/v/${videoId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token.trim()}`,
          },
        }
      );
      const updatedLikeCount = res.data.likeCount;
      const updatedDislikeCount = res.data.dislikeCount;
      setLikeCount(updatedLikeCount);
      setDislikeCount(updatedDislikeCount);
      setThumbDown(!thumbDown);
      if (thumbUp) {
        setThumbUp(false);
      }
    } catch (err) {
      console.error("Error toggling dislike:", err);
    }
  };

 const handleSubscribe = async () => {
   try {
     const token = localStorage.getItem("accesstoken");
     if (!token || !video?.owner?._id) return;

     const res = await axios.post(
       `${import.meta.env.VITE_API_URL}/subscription/${video.owner._id}`,
       {}, // Empty body
       {
         headers: {
           Authorization: `Bearer ${token}`,
         },
       }
     );

     // Update the subscriber status optimistically
     const isSubscribed = res.data?.data?.isSubscribed;
     setSubscribed(isSubscribed);

     // Update the subscriber count based on subscription status
     if (isSubscribed) {
       setSubscriberCount(subscriberCount + 1); // Increment
     } else {
       setSubscriberCount(subscriberCount - 1); // Decrement
     }
   } catch (err) {
     console.log("Subscription error:", err);
   }
 };


    

  // useEffect(async()=>{
  //   console.log("Fetching subscribers")
  //   try{
  //       const res=await axios.get(`http://localhost:5000/api/v1/subscription/channel/${channelId}`)
  //       console.log(res)
  //   }
  //   catch(err)
  //   {
  //     console.log(err)
  //   }
  // },[])

  useEffect(() => {
    fetchVideo();
    fetchComments();
    fetchAllVideos();
  }, [videoId]);

  const handleCommentLike = () => {
    setCommentIcon(!commentIcon);
  };

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      const token = localStorage.getItem("accesstoken");

      if (!token || !video?.owner?._id) return;

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/subscription/channel/${
            video.owner._id
          }`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSubscribed(res.data?.data?.isSubscribed || false);
      } catch (err) {
        console.log("Error checking subscription status:", err);
      }
    };

    checkSubscriptionStatus();
  }, [video]);


  const [subscriberCount, setSubscriberCount] = useState(0);

 const fetchSubscriberCount = async () => {
   if (!video?.owner?._id) return; // Don't fetch if no owner ID

   try {
     const res = await axios.get(
       `${import.meta.env.VITE_API_URL}/subscription/channel/${
         video.owner._id
       }/subscribers` // Assuming the correct API endpoint
     );
     console.log(res.data); // Check if the API returns the correct subscriber count
     setSubscriberCount(res.data.subscriberCount); // Set subscriber count in state
   } catch (err) {
     console.error("Failed to fetch subscriber count", err);
   }
 };
useEffect(() => {
  if (video?.owner?._id) {
    fetchSubscriberCount(); // Fetch subscriber count when the owner ID is available
  }
}, [video]);



  return (
    <div className="Video mt-[71px] md:flex md:justify-between px-[20px] md:px-[40px] pt-0 bg-black  pb-4">
      <div className="VideoPost-section w-full md:w-[70%] max-w-[875px] flex flex-col">
        <div className="Video_tube w-full">
          <video
            width="700"
            controls
            autoPlay
            src={video?.videoFile?.url}
            className="Video_youtube_videos w-full border-white rounded-3xl"
          >
            Your browser does not support the video tag
          </video>
        </div>
        <div className="video_youTube_about mt-3">
          <h2 className="text-white font-bold text-xl">{video.title}</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
            <div className="video-title flex gap-5">
              <Link to={`/user/${video?.owner?._id}`}>
                <img
                  src={video?.owner?.avatar}
                  className="h-[40px] w-[40px] md:h-[40px] md:w-[40px] rounded-full border"
                />
              </Link>
              <div className="flex flex-col">
                <h2 className="text-white font-semibold">
                  {video?.owner?.username}
                </h2>
                <p className="text-gray-300 text-sm">
                  {subscriberCount} Subscriber
                </p>
              </div>
              {subscribed ? (
                <button
                  className="bg-gray-400 text-black rounded-3xl px-4 py-[6px] text-sm h-9 flex items-center gap-2 transition-all duration-200 hover:bg-gray-300 active:scale-95"
                  onClick={handleSubscribe}
                >
                  <NotificationsActiveIcon />
                  <span>Subscribed</span>
                </button>
              ) : (
                <button
                  className="bg-white text-black rounded-3xl px-4 py-2 text-sm h-10 transition-all duration-200 hover:bg-gray-200 active:scale-95 shadow-md"
                  onClick={handleSubscribe}
                >
                  Subscribe
                </button>
              )}
            </div>
            <div className="text-white flex gap-2 w-fit rounded-xl bg-[rgb(42,42,42)] px-2 py-2">
              <div onClick={handleLike} className="cursor-pointer">
                {thumbUp ? <ThumbUpIcon /> : <ThumbUpOffAltIcon />}
              </div>

              <div className="flex items-center gap-2 text-white">
                <h1>{likeCount}</h1>
                <div className="border-r-[2px] text-white h-[20px]" />
              </div>

              <div onClick={handleDislike} className="cursor-pointer">
                {thumbDown ? <ThumbDownIcon /> : <ThumbDownOffAltIcon />}
              </div>
              <h1>{dislikeCount}</h1>
            </div>
          </div>
          <div className="mt-3 w-full bg-[rgb(42,42,42)] p-3 flex flex-col gap-2 text-white rounded-xl">
            <h2>{video?.description}</h2>
          </div>

          <h1 className="hidden md:block text-white font-medium text-lg mt-2">
            {comments.length} Comments
          </h1>
          <div className="flex items-center gap-3 w-full mt-2">
            <img
              src={video?.owner?.avatar}
              className="h-[40px] w-[40px] rounded-full border hidden md:block"
            />
            <div className="w-full md:flex flex-col gap-1 hidden">
              <input
                placeholder="Add a comment"
                className="text-white bg-black outline-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="border-[1px] border-b-700" />
            </div>
          </div>
          <div className="md:flex justify-end gap-2 hidden">
            <button className="bg-black text-white font-light border border-white rounded-3xl px-4 py-2 text-sm h-10 transition-all duration-200 hover:bg-white hover:text-black active:scale-95 shadow-md">
              Cancel
            </button>
            <button
              className="bg-black text-white font-light border border-white rounded-3xl px-4 py-2 text-sm h-10 transition-all duration-200 hover:bg-white hover:text-black active:scale-95 shadow-md"
              onClick={handleAddComment}
            >
              Comment
            </button>
          </div>
          {comments.map((item, index) => (
            <div key={item._id} className="flex justify-between p-5">
              <div className="mb-3">
                <div className="md:flex gap-3 items-center hidden">
                  <img
                    src={item?.owner?.avatar}
                    className="h-[40px] w-[40px] rounded-full border"
                  />
                  <h2 className="font-normal text-white">
                    {item?.owner?.username}
                  </h2>
                  <h2 className="text-gray-600">
                    {item?.createdAt?.slice(0, 10)}
                  </h2>
                </div>
                <h2 className="hidden md:block ml-[50px] text-white">
                  {item?.content}
                </h2>
                {commentIcon ? (
                  <div
                    className="hidden md:flex text-white gap-4 ml-[50px] mt-3"
                    onClick={handleCommentLike}
                  >
                    <ThumbUpIcon />
                    <ThumbDownAltIcon />
                  </div>
                ) : (
                  <div
                    className="hidden md:flex text-white gap-4 ml-[50px] mt-3"
                    onClick={handleCommentLike}
                  >
                    <ThumbUpOffAltIcon />
                    <ThumbDownOffAltIcon />
                  </div>
                )}
              </div>
              <div className="mt-3 hidden md:block">
                <MoreVertIcon className="cursor-pointer text-white" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="videoSuggestion text-white mt-0 md:mt-0 w-full md:w-[38%]">
        <div className="video-List flex flex-col gap-3">
          {allVideos.map((item) => (
            <div
              key={item._id}
              className="video flex gap-2 cursor-pointer"
              onClick={() => handleVideoClick(item._id)}
            >
              <div className="h-[100px] sm:h-[120px] md:h-[150px] w-[180px] sm:w-[200px] md:w-[250px] overflow-hidden rounded-2xl border flex-shrink-0">
                <img
                  src={item?.thumbnail?.url}
                  className="h-full w-full object-cover"
                  alt="video thumbnail"
                />
              </div>

              <div className="flex flex-col gap-2 mt-1 w-full overflow-hidden">
                <h1 className="text-gray-100 font-semibold text-sm sm:text-base line-clamp-2 break-words">
                  {item.title}
                </h1>
                <div className="flex flex-col gap-1">
                  <h2 className="text-gray-300 text-xs sm:text-sm">
                    {item?.ownerDetails?.username}
                  </h2>
                  <div className="flex gap-2 text-gray-400 text-xs sm:text-sm flex-wrap">
                    <h2>{item.views} views ·</h2>
                    <h2>{item.createdAt?.slice(0, 10)}</h2>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Video;
