const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  createdTime: {
    type: Date,
    default: Date.now,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["Designer", "User", "Admin"],
    default: "User",
  },
  is_creator: {
    type: Boolean,
    default: false,
  },

  last_logged_in: {
    type: Date,
    default: Date.now,
  },
  fcmToken: {
    type: String,
    required: false,
  },
  address: [
    {
      nick_name: {
        type: String,
      },
      city: {
        type: String,
      },
      pincode: {
        type: Number,
      },
      state: {
        type: String,
      },
      street_details: {
        type: String,
      },
    },
  ],
});


module.exports = mongoose.model("User", userSchema);
