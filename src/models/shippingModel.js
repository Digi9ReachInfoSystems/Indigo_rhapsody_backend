const mongoose = require("mongoose");

const ShippingSchema = new mongoose.Schema({
  order_id: {
    type: String,
    required: true, // Ensure this is required for data integrity
  },
  shipmentId: {
    type: String,
    required: true,
  },
  shiprocket_order_id: {
    type: String,
  },
  invoiceUrl: {
    type: String,
  },
  productDetails: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    },
  ],
  order_date: {
    type: Date,
    required: true, // Ensure this is required for data integrity
  },
  pickup_location: {
    type: String,
    required: true, // Ensure this is required for data integrity
  },
  channel_id: {
    type: Number,
  },
  comment: {
    type: String,
  },
  billing_customer_name: {
    type: String,
  },
  billing_address: {
    type: String,
  },
  billing_address_2: {
    type: String,
  },
  billing_city: {
    type: String,
  },
  billing_country: {
    type: String,
  },
  billing_state: {
    type: String,
  },
  billing_pincode: {
    type: String,
  },
  billing_email: {
    type: String,
  },
  billing_phone: {
    type: String,
  },
  shipping_is_billing: {
    type: Boolean,
  },
  product_id: [
    {
      type: String,
    },
  ],
  order_items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      quantity: {
        type: Number,
      },
      price: {
        type: Number,
      },
      productName: {
        type: String,
      },
      designerRef: {
        // Add designer reference field
        type: String,
      },
    },
  ],
  payment_method: {
    type: String,
  },
  total_discount: {
    type: Number,
  },
  sub_total: {
    type: Number,
  },
  length: {
    type: Number,
  },
  breadth: {
    type: Number,
  },
  designerRef: {
    type: String,
  },
  height: {
    type: Number,
  },
  weight: {
    type: Number,
  },
});

module.exports = mongoose.model("Shipping", ShippingSchema);
