import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";

const ResetPassword = () => {
  const { id:token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleReset = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setMessage(null);
      console.log(token)

      const res = await axios.post(
        "http://localhost:5000/api/v1/users/reset-password",
        {
          password:confirmPassword,
          token,
        }
        ,{
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setMessage("Password reset successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/");
      }, 2000);
      toast.success("Now,you can do login");
    } 
    catch (err) {
      setError(
        err.response?.data?.message || "Failed to reset password. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <Box
        sx={{
          maxWidth: 400,
          width: "100%",
          p: 3,
          bgcolor: "#1f1f1f",
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" gutterBottom>
          Reset Your Password
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}
        {message && <Alert severity="success">{message}</Alert>}

        <TextField
          label="New Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ input: { color: "white" }, label: { color: "#aaa" } }}
        />
        <TextField
          label="Confirm New Password"
          type="password"
          fullWidth
          margin="normal"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          sx={{ input: { color: "white" }, label: { color: "#aaa" } }}
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleReset}
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Reset Password"}
        </Button>
      </Box>
    </Box>
  );
};

export default ResetPassword;
