const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const Agent = require("../models/Agent");
const Distribution = require("../models/Distribution");
const { Readable } = require("stream"); // 👈 use this for in-memory CSV buffer

const router = express.Router();

// ✅ Use memory storage instead of disk
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Get agents
    const agents = await Agent.find({}).select("_id name email");
    if (agents.length === 0) {
      return res.status(400).json({ message: "No agents found. Please create agents first." });
    }

    // ✅ Convert buffer to readable stream
    const bufferStream = new Readable();
    bufferStream.push(req.file.buffer);
    bufferStream.push(null); // signal end of stream

    const records = [];

    bufferStream
      .pipe(csv())
      .on("data", (row) => {
        if (row.firstName && row.phone) {
          records.push({
            firstName: row.firstName,
            phone: row.phone,
            notes: row.notes || "",
          });
        }
      })
      .on("end", async () => {
        // Round-robin distribution
        const distributions = agents.map((agent) => ({
          agentId: agent._id,
          records: [],
          fileName: req.file.originalname,
        }));

        records.forEach((rec, i) => {
          const agentIdx = i % agents.length;
          distributions[agentIdx].records.push(rec);
        });

        let saved = [];
        for (const dist of distributions) {
          if (dist.records.length) {
            const doc = new Distribution({
              ...dist,
              uploadDate: new Date(),
            });
            await doc.save();
            saved.push({
              agentName: agents.find((a) => a._id.equals(dist.agentId)).name,
              recordCount: dist.records.length,
            });
          }
        }

        res.json({
          totalRecords: records.length,
          validRecords: records.length,
          invalidRecords: 0,
          agentCount: agents.length,
          distribution: saved,
        });
      });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
