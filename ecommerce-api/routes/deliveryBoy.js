const express = require("express");
const router = express.Router();
const deliveryBoyAuth = require("../middlewares/deliveryBoyAuth");
const {
  login,
  getProfile,
  getAssignedOrders,
  getCompletedOrders,
  getOrderDetails,
  updateOrderStatus,
  acceptOrder,
  rejectOrder,
  getAllDeliveryBoys,
} = require("../controllers/DeliveryBoyController");

// Public routes
router.post("/login", login);

// Protected routes
router.get("/profile", deliveryBoyAuth, getProfile);
router.get("/orders/assigned", deliveryBoyAuth, getAssignedOrders);
router.get("/orders/completed", deliveryBoyAuth, getCompletedOrders);
router.get("/orders/:orderId", deliveryBoyAuth, getOrderDetails);
router.put("/orders/:orderId/status", deliveryBoyAuth, updateOrderStatus);
router.put("/orders/:orderId/accept", deliveryBoyAuth, acceptOrder);
router.put("/orders/:orderId/reject", deliveryBoyAuth, rejectOrder);

// Admin routes
router.get("/all", getAllDeliveryBoys);

module.exports = router;
