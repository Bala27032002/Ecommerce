const Notification = require("../models/Notification");

// Create notification
exports.createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();
    console.log("✅ Notification Created:", notification);
    return notification;
  } catch (error) {
    console.error("Notification Creation Error:", error);
  }
};

// Get admin unread count
exports.getAdminUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ recipient: "admin", isRead: false });

    res.status(200).json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    console.error("Get Admin Unread Count Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch unread count",
      error: error.message,
    });
  }
};

// Get admin notifications
exports.getAdminNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: "admin" })
      .populate("orderId")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Get Admin Notifications Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

// Get user notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({
      recipient: "user",
      userId,
    })
      .populate("orderId")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Get User Notifications Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Mark as Read Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update notification",
      error: error.message,
    });
  }
};

// Mark admin notification as read
exports.markAdminAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: "admin" },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Mark Admin as Read Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update notification",
      error: error.message,
    });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user?.id;
    const recipient = req.query.recipient || "user";

    let query = { recipient, isRead: false };
    if (recipient === "user" && userId) {
      query.userId = userId;
    }

    const count = await Notification.countDocuments(query);

    res.status(200).json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    console.error("Get Unread Count Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch unread count",
      error: error.message,
    });
  }
};
