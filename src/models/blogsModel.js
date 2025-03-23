const mongoose = require("mongoose");
const blogSSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  publishedAt: {
    type: Date,
    default: Date.no,
  },
  status: {
    type: String,
    default: "Pending",
  },
});

module.exports = mongoose.model("Blog", blogSSchema);
