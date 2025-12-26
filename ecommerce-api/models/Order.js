const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        price: Number,
        quantity: Number,
        weight: String,
        image: String,
      },
    ],
    customerInfo: {
      fullName: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
    },
    paymentInfo: {
      method: {
        type: String,
        enum: ["card", "upi", "razorpay", "cod"],
        required: true,
      },
      razorpayOrderId: {
        type: String,
        sparse: true,
        default: null,
      },
      razorpayPaymentId: {
        type: String,
        sparse: true,
        default: null,
      },
      razorpaySignature: {
        type: String,
        sparse: true,
        default: null,
      },
      status: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"],
        default: "pending",
      },
    },
    pricing: {
      subtotal: {
        type: Number,
        required: true,
      },
      shippingFee: {
        type: Number,
        default: 0,
      },
      tax: {
        type: Number,
        required: true,
      },
      total: {
        type: Number,
        required: true,
      },
    },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "on-the-way", "delivered", "cancelled"],
      default: "pending",
    },
    assignedDeliveryBoy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryBoy",
      default: null,
    },
    paymentCollected: {
      type: Boolean,
      default: false,
    },
    shippingInfo: {
      type: String,
      default: "Delivery",
    },
    notes: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
