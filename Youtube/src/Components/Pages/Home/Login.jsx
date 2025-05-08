import React, { useState } from "react";
import { Link } from "react-router-dom";
import YouTubeIcon from "@mui/icons-material/YouTube";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Box from "@mui/material/Box";
import { LinearProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";

function Login({ handleCancel }) {
  const [loginField, setLoginField] = useState({
    username: "",
    password: "",
    email: "",
  });
  const [progress, setProgress] = useState(false);
  const [isloginopen, setIsLoginOpen] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (event, name) => {
    setLoginField((prev) => ({ ...prev, [name]: event.target.value }));
  };

  const handleForgetPassword = () => {
    navigate("/forgot-password");
    window.location.reload();
  }

  const handleLogin = () => {
    setProgress(true);
    console.log("sending request");
    axios
      .post(
        "http://localhost:5000/api/v1/users/login",
        {
          username: loginField.username,
          email: loginField.email,
          password: loginField.password,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      )
      .then((res) => {
        setProgress(false);
        console.log("got the response");
        console.log(res);
        localStorage.setItem("userId", res.data.data.user._id);
        localStorage.setItem("avatar", res.data.data.user.avatar);
        localStorage.setItem("accesstoken", res.data.data.accessToken);
        localStorage.setItem("username",res.data.data.user.username);
        setIsLoginOpen(false);
        toast.success("Login successful");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      })
      .catch((err) => {
        setProgress(false);
        toast.error("Invalid credentials");
        console.log(err);
      });
  };

  return (
    <>
      <div className="login fixed inset-0 w-full h-full bg-black bg-opacity-70 z-50 text-white flex justify-center items-center">
        <div className="video-upload flex flex-col items-center border-[2px] w-[90%] sm:w-[400px] lg:w-[600px] shadow-[0.5px_0.5px_8px_white] mt-10 px-6 bg-black pt-6 pb-10 sm:pb-[5rem] rounded-lg">
          <div className="video-tag flex items-center">
            <YouTubeIcon sx={{ color: "red", fontSize: "54px" }} />
            <h1 className="font-medium text-2xl text-white mt-2">Login</h1>
          </div>

          {/* Input Fields */}
          <div className="mt-6 flex flex-col gap-6 w-full sm:w-[300px]">
            <input
              type="email"
              placeholder="Email"
              className="bg-[#222222] text-white p-3 rounded-lg"
              onChange={(e) => handleInputChange(e, "email")}
              value={loginField.email}
            />
            <input
              type="password"
              placeholder="Password"
              className="bg-[#222222] text-white p-3 rounded-lg"
              onChange={(e) => handleInputChange(e, "password")}
              value={loginField.password}
            />
          </div>

          <div className="mt-5 cursor-pointer" onClick={handleForgetPassword}>
            <p className="text-white text-sm hover:text-blue-400">
              Forgot Password?
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-6 mt-7 w-full sm:w-[300px] justify-between mb-7">
            <button
              className="text-white font-medium border-[1px] px-3 py-2 rounded-lg cursor-pointer hover:bg-white hover:text-black"
              onClick={handleLogin}
            >
              Login
            </button>
            <Link
              to="/signUp"
              className="text-white font-medium border-[1px] px-3 py-2 rounded-lg cursor-pointer hover:bg-white hover:text-black"
              onClick={() => handleCancel()}
            >
              SignUp
            </Link>
            <div
              className="text-white font-medium border-[1px] px-3 py-2 rounded-lg cursor-pointer hover:bg-white hover:text-black"
              onClick={() => handleCancel()}
            >
              Cancel
            </div>
          </div>

          {/* Progress bar */}
          {progress && (
            <Box sx={{ width: "100%" }}>
              <LinearProgress />
            </Box>
          )}
        </div>
      </div>
    </>
  );
}

export default Login;
