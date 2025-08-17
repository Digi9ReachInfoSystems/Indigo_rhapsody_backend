const mongoose = require("mongoose");
const { ref } = require("pdfkit");

const couponSchema = new mongoose.Schema({
  couponCode: {
    type: String,
    required: true,
    unique: true,
  },
  couponAmount: {
    type: Number,
    required: true,
  },
  created_for_promotion: {
    is_used_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    created_at: {
      type: Date,
    },
    no_of_max_usage: {
      type: Number,
    },
  },
  created_for: [
    {
      user_id: {
        type: String,
      },
      expired_in: {
        type: Date,
      },
      is_used: {
        type: Boolean,
      },
    },
  ],
  createdDate: {
    type: Date,
    default: Date.now,
  },
  expiryDate: {
    type: Date,
    required: true,
    index: true,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  usedBy: [
    {
      type: mongoose.Schema.Types.ObjectId, // Store User IDs
      ref: "User",
    },
  ],
});

module.exports = mongoose.model("Coupon", couponSchema);
