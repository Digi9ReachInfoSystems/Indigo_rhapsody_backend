const mongoose = require("mongoose");

const paymentDetailsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  cartId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cart",
  },
  orderId: {
    type: String,
    // For tracking purposes - can be generated or provided
  },
  paymentReferenceId: {
    type: String,
    unique: true,
    required: true,
  },
  transactionId: {
    type: String,
    unique: true,
    required: true,
  },
  paymentId: {
    type: String,
    // PhonePe transaction ID
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ["phonepe", "razorpay", "stripe", "paypal", "cod"],
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "INR",
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Initiated", "Completed", "Failed", "Cancelled", "Refunded"],
    default: "Pending",
  },
  status: {
    type: String,
    enum: ["initiated", "processing", "completed", "failed", "cancelled"],
    default: "initiated",
  },
  customerDetails: {
    name: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    address: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  paymentOptions: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  description: {
    type: String,
    default: "",
  },
  notes: {
    type: String,
    default: "",
  },
  returnUrl: {
    type: String,
    default: "",
  },
  webhookUrl: {
    type: String,
    default: "",
  },
  paymentDetails: {
    type: String,
    // Legacy field for backward compatibility
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
  failedAt: {
    type: Date,
  },
  failureReason: {
    type: String,
  },
});

module.exports = mongoose.model("PaymentDetails", paymentDetailsSchema);
