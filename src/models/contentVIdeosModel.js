const mongoose = require("mongoose");

const contentVideoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        commentText: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    videoUrl: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    createdDate: {
      type: Date,
      default: Date.now,
    },
    no_of_likes: {
      type: Number,
      default: 0,
    },
    no_of_Shares: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    is_approved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const ContentVideo = mongoose.model("ContentVideo", contentVideoSchema);

module.exports = ContentVideo;
