const express = require("express")
const Distribution = require("../models/Distribution")
const auth = require("../middleware/auth")

const router = express.Router()

// Get all distributions
router.get("/", async (req, res) => {
  try {
    const distributions = await Distribution.find({}).populate("agentId", "name email").sort({ uploadDate: -1 })

    res.json({ distributions })
  } catch (error) {
    console.error("Get distributions error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

module.exports = router
