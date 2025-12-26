const express = require("express");
const router = express.Router();
const {
  createRazorpayOrder,
  verifyPayment,
  createOrder,
  getUserOrders,
  getOrderById,
  getAdminOrderById,
  updateOrderStatus,
  getAllOrders,
  assignDeliveryBoy,
  getOrdersByDeliveryBoy,
} = require("../controllers/OrderController");
const { protect } = require("../middlewares/auth");
const { protectAdmin } = require("../middlewares/adminAuth");
const deliveryBoyAuth = require("../middlewares/deliveryBoyAuth");

// Public routes
router.post("/razorpay-order", protect, createRazorpayOrder);
router.post("/verify-payment", protect, verifyPayment);

// Protected routes (User)
router.post("/create", protect, createOrder);
router.get("/my-orders", protect, getUserOrders);

// Admin routes
router.get("/", protectAdmin, getAllOrders);
router.get("/admin/:orderId", protectAdmin, getAdminOrderById);
router.put("/:orderId/status", protectAdmin, updateOrderStatus);
router.put("/:orderId/assign-delivery-boy", protectAdmin, assignDeliveryBoy);

// Protected route (User) - keep this after more specific routes
router.get("/:orderId", protect, getOrderById);

// Delivery Boy routes
router.get("/delivery-boy/assigned-orders", deliveryBoyAuth, getOrdersByDeliveryBoy);

module.exports = router;
