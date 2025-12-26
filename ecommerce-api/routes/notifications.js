const express = require("express");
const router = express.Router();
const {
  getAdminNotifications,
  getUserNotifications,
  markAsRead,
  getUnreadCount,
  getAdminUnreadCount,
  markAdminAsRead,
} = require("../controllers/NotificationController");
const { protect } = require("../middlewares/auth");
const { protectAdmin } = require("../middlewares/adminAuth");

// Protected routes
router.get("/user", protect, getUserNotifications);
router.get("/unread-count", protect, getUnreadCount);
router.put("/:notificationId/read", protect, markAsRead);

// Admin routes
router.get("/admin", protectAdmin, getAdminNotifications);
router.get("/admin/unread-count", protectAdmin, getAdminUnreadCount);
router.put("/admin/:notificationId/read", protectAdmin, markAdminAsRead);

module.exports = router;
