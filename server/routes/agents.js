const express = require("express")
const bcrypt = require("bcryptjs")
const Agent = require("../models/Agent")
const Distribution = require("../models/Distribution")
const auth = require("../middleware/auth")

const router = express.Router()

// Get all agents
router.get("/", async (req, res) => {
  try {
    const agents = await Agent.find({}).select("-password").sort({ createdAt: -1 })
    res.json({ agents })
  } catch (error) {
    console.error("Get agents error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// Create agent
router.post("/", async (req, res) => {
  try {
    const { name, email, mobile, countryCode, password } = req.body

    // Validate input
    if (!name || !email || !mobile || !countryCode || !password) {
      return res.status(400).json({ message: "All fields are required" })
    }

    // Check if agent already exists
    const existingAgent = await Agent.findOne({ email })
    if (existingAgent) {
      return res.status(400).json({ message: "Agent with this email already exists" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create agent
    const agent = new Agent({
      name,
      email,
      mobile,
      countryCode,
      password: hashedPassword,
    })

    await agent.save()

    // Return agent without password
    const { password: _, ...agentData } = agent.toObject()

    res.status(201).json({
      message: "Agent created successfully",
      agent: agentData,
    })
  } catch (error) {
    console.error("Create agent error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// Delete agent
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params

    // Check if agent exists
    const agent = await Agent.findById(id)
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" })
    }

    // Delete associated distributions
    await Distribution.deleteMany({ agentId: id })

    // Delete agent
    await Agent.findByIdAndDelete(id)

    res.json({ message: "Agent deleted successfully" })
  } catch (error) {
    console.error("Delete agent error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

module.exports = router
