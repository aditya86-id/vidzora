import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import YouTubeIcon from "@mui/icons-material/YouTube";
import axios from "axios";
import { toast } from "react-toastify";

function SignUp() {
  const [avatarPreview, setAvatarPreview] = useState(
    "https://tse2.mm.bing.net/th?id=OIP.tXKGs73UYjBEZSclUWLSMAHaHa&pid=Api&P=0&h=180"
  );
  const [avatarFile, setAvatarFile] = useState(null);
  const navigate = useNavigate();

  const [signUpField, setSignUpField] = useState({
    username: "",
    email: "",
    fullName: "",
    password: "",
    about: "",
  });

  useEffect(() => {
    // Freeze scroll
    document.body.classList.add("overflow-hidden");

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  const handleSignUpField = (event, name) => {
    setSignUpField((prev) => ({
      ...prev,
      [name]: event.target.value,
    }));
  };

  const handleProfilePic = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setAvatarPreview(imageURL);
      setAvatarFile(file);
    }
  };

  const handleSignUpData = async() => {
    const formData = new FormData();
    formData.append("username", signUpField.username);
    formData.append("email", signUpField.email);
    formData.append("fullName", signUpField.fullName);
    formData.append("password", signUpField.password);
    formData.append("about", signUpField.about);
    if (avatarFile) formData.append("avatar", avatarFile);
    console.log(avatarFile)

    await axios
      .post(`${import.meta.env.VITE_API_URL}/users/register`, formData, {
        withCredentials: true,
        
      })
      .then((res) => {
        toast.success("Successfully registered. You can now log in.");
        navigate("/");
      })
      .catch((error) => {
        if (error.response) {
          toast.error("Server error:", error.response.data);
        } else {
          toast.error("Error:", error.message);
        }
      });
  };

  return (
    <div className=" bg-black">
      <div className="Sign-Up inset-0 z-50 bg-black bg-opacity-90 overflow-y-auto flex justify-center items-center p-4 text-white pointer-events-auto hide-scrollbar">
        <div className="Video-upload flex flex-col items-center border-[2px] w-full max-w-[600px] shadow-[0.5px_0.5px_8px_white] px-4 sm:px-6 bg-black pt-6 pb-10 rounded-lg">
          <div className="Video-tag flex items-center gap-3">
            <YouTubeIcon sx={{ color: "red", fontSize: "54px" }} />
            <h1 className="font-medium text-2xl text-white mt-2">SignUp</h1>
          </div>
          <div className="mt-6 flex flex-col gap-6 w-[300px] sm:w-[410px]">
            <input
              type="text"
              placeholder="Full Name"
              className="bg-[#222222] text-white p-3 rounded-lg"
              value={signUpField.fullName}
              onChange={(e) => handleSignUpField(e, "fullName")}
            />
            <input
              type="text"
              placeholder="Username"
              className="bg-[#222222] text-white p-3 rounded-lg"
              value={signUpField.username}
              onChange={(e) => handleSignUpField(e, "username")}
            />
            <input
              type="text"
              placeholder="Email"
              className="bg-[#222222] text-white p-3 rounded-lg"
              value={signUpField.email}
              onChange={(e) => handleSignUpField(e, "email")}
            />
            <input
              type="password"
              placeholder="Password"
              className="bg-[#222222] text-white p-3 rounded-lg"
              value={signUpField.password}
              onChange={(e) => handleSignUpField(e, "password")}
            />
            <input
              type="text"
              placeholder="About Your Channel"
              className="bg-[#222222] text-white p-3 rounded-lg"
              value={signUpField.about}
              onChange={(e) => handleSignUpField(e, "about")}
            />
            <div className="flex flex-col sm:flex-row w-full items-center sm:gap-4">
              <input
                type="file"
                accept="image/*"
                className="text-white cursor-pointer"
                onChange={handleProfilePic}
              />
              <img
                src={avatarPreview}
                alt="Preview"
                className="w-[60px] h-[60px] sm:w-[100px] sm:h-[100px] md:w-[120px] md:h-[120px] rounded-full object-cover mt-5 sm:mt-0"
              />
            </div>
          </div>

          <div className="flex gap-6 mt-7 w-[300px] justify-between">
            <div
              className="text-white font-medium border-[1px] px-3 py-2 rounded-lg cursor-pointer hover:bg-white hover:text-black"
              onClick={handleSignUpData}
            >
              SignUp
            </div>
            <Link
              to="/"
              className="text-white font-medium border-[1px] px-3 py-2 rounded-lg cursor-pointer hover:bg-white hover:text-black"
            >
              Home Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
