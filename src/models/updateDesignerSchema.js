const mongoose = require("mongoose");

const updateRequestSchema = new mongoose.Schema({
  designerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Designer",
    required: true,
  },
  requestedUpdates: {
    type: Object,
    required: true,
  },
  requestTime: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  adminComments: {
    type: String,
  },
});

module.exports = mongoose.model("UpdateRequest", updateRequestSchema);
