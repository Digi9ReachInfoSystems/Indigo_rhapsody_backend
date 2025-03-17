const mongoose = require("mongoose");

const querySchema = new mongoose.Schema({
  designer_name: {
    type: String,
    required: true,
  },
  buisness_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone_Number: {
    type: String,
  },
  Message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "Pending",
  },
});
