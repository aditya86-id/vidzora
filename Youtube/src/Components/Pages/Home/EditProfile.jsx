import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Avatar,
  Alert,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

const EditProfile = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    avatar: "", // preview URL
    avatarFile: null, // file to upload
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/v1/users/current-user",
          {
            headers: {
              Authorization: `Bearer ${localStorage
                .getItem("accesstoken")
                .trim()}`,
            },
          }
        );
        setFormData((prev) => ({
          ...prev,
          fullName: res.data?.data?.fullName || "",
          email: res.data?.data?.email || "",
          avatar: res.data?.data?.avatar || "",
        }));
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to load profile");
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        avatar: previewURL,
        avatarFile: file,
      }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const updateData = new FormData();
      updateData.append("fullName", formData.fullName);
      updateData.append("email", formData.email);
      if (formData.avatarFile) {
        updateData.append("avatar", formData.avatarFile);
      }

      await axios.patch(
        "http://localhost:5000/api/v1/users/update-account",
        updateData,
        {
          headers: {
            Authorization: `Bearer ${localStorage
              .getItem("accesstoken")
              .trim()}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSuccessMsg("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <Box
        sx={{
          maxWidth: 500,
          width: "100%",
          p: 4,
          bgcolor: "#1f1f1f",
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" gutterBottom>
          Edit Profile
        </Typography>

        {successMsg && <Alert severity="success">{successMsg}</Alert>}
        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

        <Box className="flex justify-center mb-4">
          <Avatar
            src={formData.avatar}
            sx={{ width: 80, height: 80 }}
            alt="Avatar"
          />
        </Box>

        <Button
          variant="outlined"
          component="label"
          sx={{ color: "white", borderColor: "#aaa", mb: 2 }}
        >
          Upload Avatar
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleAvatarChange}
          />
        </Button>

        <TextField
          label="Full Name"
          name="fullName"
          fullWidth
          margin="normal"
          value={formData.fullName}
          onChange={handleChange}
          sx={{ input: { color: "white" }, label: { color: "#aaa" } }}
        />

        <TextField
          label="Email"
          name="email"
          fullWidth
          margin="normal"
          value={formData.email}
          onChange={handleChange}
          sx={{ input: { color: "white" }, label: { color: "#aaa" } }}
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSubmit}
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Update Profile"}
        </Button>
      </Box>
    </Box>
  );
};

export default EditProfile;
