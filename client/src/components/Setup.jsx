"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Alert,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

const Setup = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      // ✅ Backend का सही URL इस्तेमाल कर रहे हैं
      const response = await axios.post("https://agentflow-backend-pjgp.onrender.com/api/auth/setup", formData);

      alert("Admin account created successfully! You can now login.");
      navigate("/login");

    } catch (error) {
      setError(error.response?.data?.message || "Setup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader
          title="🚀 Initial Setup"
          subheader="Create your admin account to get started"
          className="text-center"
        />
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Admin Email"
              name="email"
              type="email"
              fullWidth
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@example.com"
            />

            <TextField
              label="Password"
              name="password"
              type="password"
              fullWidth
              required
              inputProps={{ minLength: 6 }}
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password (min 6 characters)"
            />

            <TextField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              fullWidth
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
            />

            <Button type="submit" variant="contained" fullWidth disabled={loading}>
              {loading ? "Creating Account..." : "Create Admin Account"}
            </Button>
          </form>

          <Divider className="my-6" />

          <Typography variant="h6" gutterBottom>
            ℹ️ What happens next?
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="Your admin account will be created" />
            </ListItem>
            <ListItem>
              <ListItemText primary="You'll be redirected to the login page" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Use your credentials to access the dashboard" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Start managing agents and uploading files" />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </div>
  );
};

export default Setup;
