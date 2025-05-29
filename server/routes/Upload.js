const express = require("express")
const multer = require("multer")
const csv = require("csv-parser")
const fs = require("fs")
const Agent = require("../models/Agent")
const Distribution = require("../models/Distribution")
// const auth = require("../middleware/auth") // Uncomment if you have auth middleware

const router = express.Router()
const upload = multer({ dest: "uploads/" })

// Upload and distribute file
router.post("/", /*auth,*/ upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" })

    // Get all agents
    const agents = await Agent.find({}).select("_id name email")
    if (agents.length === 0) {
      return res.status(400).json({ message: "No agents found. Please create agents first." })
    }

    // Parse CSV
    const records = []
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => {
        // Validate row (must have firstName, phone)
        if (row.firstName && row.phone) {
          records.push({
            firstName: row.firstName,
            phone: row.phone,
            notes: row.notes || "",
          })
        }
      })
      .on("end", async () => {
        // Distribute records among agents (round-robin)
        const distributions = agents.map((agent) => ({
          agentId: agent._id,
          records: [],
          fileName: req.file.originalname,
        }))
        records.forEach((rec, i) => {
          const agentIdx = i % agents.length
          distributions[agentIdx].records.push(rec)
        })

        // Save to DB
        let saved = []
        for (const dist of distributions) {
          if (dist.records.length) {
            const doc = new Distribution({
              ...dist,
              uploadDate: new Date(),
            })
            await doc.save()
            saved.push({
              agentName: agents.find((a) => a._id.equals(dist.agentId)).name,
              recordCount: dist.records.length,
            })
          }
        }

        // Remove temp file
        fs.unlinkSync(req.file.path)

        res.json({
          totalRecords: records.length,
          validRecords: records.length,
          invalidRecords: 0,
          agentCount: agents.length,
          distribution: saved,
        })
      })
  } catch (err) {
    console.error("Upload error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router