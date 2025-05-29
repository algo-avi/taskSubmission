const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const agentRoutes = require("./routes/agents");
const uploadRoutes = require("./routes/Upload");
const distributionRoutes = require("./routes/Distribution");

const app = express();

// CORS setup
app.use(
  cors({
    origin: ["https://agentflow-ku8i.onrender.com", "http://localhost:5173"], // Allow React dev servers
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Serve static files with correct MIME types
app.use(express.static(path.join(__dirname, "public"), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith(".css")) {
            res.setHeader("Content-Type", "text/css");
        } else if (filePath.endsWith(".js")) {
            res.setHeader("Content-Type", "application/javascript");
        }
    }
}));

// If your frontend build is inside `client/dist`, serve it correctly
app.use(express.static(path.join(__dirname, "client/dist")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/distributions", distributionRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
