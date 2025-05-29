"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Backend API base URL और credentials सेट करना
  axios.defaults.baseURL = "http://localhost:5000/api/auth"; // ✅ Backend API का सही URL
  axios.defaults.withCredentials = true;

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log("🔍 Checking authentication status...");
      const response = await axios.get("/me");
      console.log("✅ User authenticated:", response.data.user);
      setUser(response.data.user);
    } catch (error) {
      console.error("❌ Authentication check failed:", error.response?.data?.message || error.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log("🔍 Sending login request...");
      const response = await axios.post("/login", { email, password }, { withCredentials: true });

      if (response.status === 200) {
        console.log("✅ Login successful!");
        await checkAuthStatus(); // ✅ Auth स्टेट को रिफ्रेश कर रहा हूँ
        return { success: true };
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (error) {
      console.error("❌ Login failed:", error.response?.data?.message || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const logout = async () => {
    try {
      console.log("🔍 Logging out...");
      await axios.post("/logout", {}, { withCredentials: true });
      setUser(null);
      console.log("✅ Logged out successfully!");
    } catch (error) {
      console.error("❌ Logout error:", error.response?.data?.message || error.message);
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
