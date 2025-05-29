const mongoose = require("mongoose");

const distributionSchema = new mongoose.Schema(
  {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
    },
    records: [
      {
        firstName: { type: String, required: true },
        phone: { type: String, required: true },
        notes: { type: String, default: "" },
      },
    ],
    fileName: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// pahle se maujud model ko check karte hain
module.exports = mongoose.models.Distribution || mongoose.model("Distribution", distributionSchema);
