import React, { useState } from "react";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  // const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/forgot-password`,
        { email }
      );
      setMessage("Password reset email sent.")
      console.log(res)
    }
    catch(err)
    {
      console.log(err)
      setMessage("Failed to send password reset email.")
      // Handle specific error messages as needed
    }

    // Replace with actual API call
    // console.log("Old Password:", oldPassword);
    // console.log("New Password:", newPassword);

    // Example response
    setMessage("Password successfully changed.");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white px-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-semibold"
          >
            Submit
          </button>
        </form>

        {message && (
          <p className="mt-4 text-green-400 text-center">{message}</p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
