const DeliveryBoy = require("../models/DeliveryBoy");
const Order = require("../models/Order");
const jwt = require("jsonwebtoken");

// Delivery Boy Login
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    console.log("Login attempt:", { phone, password });

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Phone and password are required",
      });
    }

    const deliveryBoy = await DeliveryBoy.findOne({ phone });

    if (!deliveryBoy) {
      console.log("Delivery boy not found for phone:", phone);
      return res.status(404).json({
        success: false,
        message: "Delivery boy not found",
      });
    }

    console.log("Delivery boy found:", deliveryBoy.name);

    if (!deliveryBoy.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
    }

    const isPasswordValid = await deliveryBoy.comparePassword(password);
    console.log("Password valid:", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      { id: deliveryBoy._id, role: "deliveryBoy" },
      process.env.JWT_SECRET || "your_secret_key",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      deliveryBoy: {
        id: deliveryBoy._id,
        name: deliveryBoy.name,
        phone: deliveryBoy.phone,
        totalDeliveries: deliveryBoy.totalDeliveries,
        rating: deliveryBoy.rating,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get Delivery Boy Profile
exports.getProfile = async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy.id).select(
      "-password"
    );

    if (!deliveryBoy) {
      return res.status(404).json({
        success: false,
        message: "Delivery boy not found",
      });
    }

    res.status(200).json({
      success: true,
      deliveryBoy,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get Assigned Orders
exports.getAssignedOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      assignedDeliveryBoy: req.deliveryBoy.id,
      orderStatus: { $in: ["confirmed", "processing", "shipped", "on-the-way"] },
    })
      .populate("userId", "fullName email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get Completed Orders
exports.getCompletedOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      assignedDeliveryBoy: req.deliveryBoy.id,
      orderStatus: "delivered",
    })
      .populate("userId", "fullName email phone")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get Order Details
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("userId", "fullName email phone")
      .populate("assignedDeliveryBoy", "name phone");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.assignedDeliveryBoy._id.toString() !== req.deliveryBoy.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update Order Status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, paymentCollected } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.assignedDeliveryBoy.toString() !== req.deliveryBoy.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const validStatuses = ["on-the-way", "delivered"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    order.orderStatus = status;

    if (status === "delivered" && paymentCollected !== undefined) {
      order.paymentCollected = paymentCollected;
    }

    await order.save();

    // Update delivery boy stats if delivered
    if (status === "delivered") {
      await DeliveryBoy.findByIdAndUpdate(req.deliveryBoy.id, {
        $inc: { totalDeliveries: 1 },
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Accept Order
exports.acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order is already assigned to someone else
    if (order.assignedDeliveryBoy && order.assignedDeliveryBoy.toString() !== req.deliveryBoy.id) {
      return res.status(403).json({
        success: false,
        message: "Order already assigned to another delivery boy",
      });
    }

    // Assign order to delivery boy
    order.assignedDeliveryBoy = req.deliveryBoy.id;
    order.orderStatus = "confirmed";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order accepted successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Reject Order
exports.rejectOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order is assigned to this delivery boy
    if (order.assignedDeliveryBoy && order.assignedDeliveryBoy.toString() !== req.deliveryBoy.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to reject this order",
      });
    }

    // Remove assignment and reset status
    order.assignedDeliveryBoy = null;
    order.orderStatus = "pending";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order rejected successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get All Delivery Boys (for admin)
exports.getAllDeliveryBoys = async (req, res) => {
  try {
    const deliveryBoys = await DeliveryBoy.find().select("-password");

    res.status(200).json({
      success: true,
      count: deliveryBoys.length,
      deliveryBoys,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
