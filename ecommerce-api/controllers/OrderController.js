const Order = require("../models/Order");
const DeliveryBoy = require("../models/DeliveryBoy");
const Notification = require("../models/Notification");
const Product = require("../models/Product");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const normalizeIncomingItems = (items = []) => {
  if (!Array.isArray(items)) return [];
  return items
    .map((it) => {
      const productId = it?.productId || it?._id || it?.id;
      const quantity = Number(it?.quantity ?? it?.qty ?? 1);
      return {
        productId,
        quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
      };
    })
    .filter((it) => it.productId);
};

const buildOrderLineItemsAndPricing = async ({ incomingItems }) => {
  const normalizedItems = normalizeIncomingItems(incomingItems);
  if (normalizedItems.length === 0) {
    const err = new Error("No items to checkout");
    err.statusCode = 400;
    throw err;
  }

  const productIds = normalizedItems.map((it) => it.productId);
  const products = await Product.find({ _id: { $in: productIds }, isActive: true }).lean();

  const productById = new Map(products.map((p) => [String(p._id), p]));

  const items = normalizedItems.map((it) => {
    const p = productById.get(String(it.productId));
    if (!p) {
      const err = new Error("Some products are not available");
      err.statusCode = 400;
      throw err;
    }

    const price = Number(p.price || 0);
    return {
      productId: p._id,
      name: p.name,
      price,
      quantity: it.quantity,
      weight: p?.quantity?.value && p?.quantity?.unit ? `${p.quantity.value} ${p.quantity.unit}` : undefined,
      image: p.image,
    };
  });

  const subtotal = items.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 1), 0);
  const shippingFee = 0;
  const tax = 0;
  const total = subtotal + shippingFee + tax;

  return {
    items,
    pricing: {
      subtotal,
      shippingFee,
      tax,
      total,
    },
  };
};

const verifyRazorpaySignature = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  return expectedSignature === razorpaySignature;
};

// Helper function to create notifications
const createNotifications = async (order, io) => {
  try {
    // Admin notification
    const adminNotification = await Notification.create({
      type: "order_placed",
      recipient: "admin",
      orderId: order._id,
      title: "New Order Received",
      message: `New order #${order.orderNumber} from ${order.customerInfo.fullName} for ₹${order.pricing.total.toFixed(2)}`,
      data: {
        orderNumber: order.orderNumber,
        customerName: order.customerInfo.fullName,
        amount: order.pricing.total,
        itemCount: order.items.length,
      },
    });

    if (io) {
      io.emit("admin_notification", {
        type: "order_placed",
        notificationId: adminNotification._id,
        orderId: order._id,
        createdAt: adminNotification.createdAt,
      });
    }

    // User notification
    await Notification.create({
      type: "order_placed",
      recipient: "user",
      userId: order.userId,
      orderId: order._id,
      title: "Order Confirmed",
      message: `Your order #${order.orderNumber} has been placed successfully. Total: ₹${order.pricing.total.toFixed(2)}`,
      data: {
        orderNumber: order.orderNumber,
        customerName: order.customerInfo.fullName,
        amount: order.pricing.total,
        itemCount: order.items.length,
      },
    });

    console.log("✅ Notifications sent for order:", order.orderNumber);
  } catch (error) {
    console.error("Error creating notifications:", error);
  }
};

// Get Order by ID (Admin)
exports.getAdminOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("items.productId")
      .populate("userId", "fullName email phone")
      .populate("assignedDeliveryBoy", "name phone");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get Admin Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

// Create Razorpay Order
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { items } = req.body;
    const { pricing } = await buildOrderLineItemsAndPricing({ incomingItems: items });
    const currency = "INR";

    const options = {
      amount: Math.round(Number(pricing.total || 0) * 100),
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Razorpay Order Creation Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create Razorpay order",
      error: error.message,
    });
  }
};

// Verify Razorpay Payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const isSignatureValid = verifyRazorpaySignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isSignatureValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    const payment = await razorpay.payments.fetch(razorpayPaymentId);
    if (!payment || payment.order_id !== razorpayOrderId) {
      return res.status(400).json({
        success: false,
        message: "Payment does not match order",
      });
    }

    const validStatuses = new Set(["captured", "authorized"]);
    if (!validStatuses.has(payment.status)) {
      return res.status(400).json({
        success: false,
        message: `Payment not successful (status: ${payment.status})`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("Payment Verification Error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      items,
      customerInfo,
      paymentInfo,
      pricing: unsafePricing,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    // Validate required fields
    if (!items || !customerInfo || !paymentInfo) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: items, customerInfo, paymentInfo",
      });
    }

    const { items: safeItems, pricing } = await buildOrderLineItemsAndPricing({ incomingItems: items });

    // Verify payment if razorpay
    if (paymentInfo.method === "razorpay") {
      const isSignatureValid = verifyRazorpaySignature({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      });

      if (!isSignatureValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment signature",
        });
      }

      const existing = await Order.findOne({ "paymentInfo.razorpayPaymentId": razorpayPaymentId });
      if (existing) {
        return res.status(200).json({
          success: true,
          message: "Order already created",
          order: existing,
        });
      }

      const payment = await razorpay.payments.fetch(razorpayPaymentId);
      if (!payment || payment.order_id !== razorpayOrderId) {
        return res.status(400).json({
          success: false,
          message: "Payment does not match order",
        });
      }

      const validStatuses = new Set(["captured", "authorized"]);
      if (!validStatuses.has(payment.status)) {
        return res.status(400).json({
          success: false,
          message: `Payment not successful (status: ${payment.status})`,
        });
      }

      const expectedAmount = Math.round(Number(pricing.total || 0) * 100);
      if (Number(payment.amount) !== expectedAmount) {
        return res.status(400).json({
          success: false,
          message: "Payment amount mismatch",
        });
      }
    }

    // Generate order number
    const count = await Order.countDocuments();
    const orderNumber = `ORD-${Date.now()}-${count + 1}`;

    // Create order
    const order = new Order({
      userId,
      orderNumber,
      items: safeItems,
      customerInfo,
      paymentInfo: {
        ...paymentInfo,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        status: paymentInfo.method === "razorpay" ? "completed" : "pending",
      },
      pricing,
      orderStatus: "pending",
    });

    await order.save();

    // Send notifications to admin and user
    await createNotifications(order, req.app.get('io'));

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Order Creation Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

// Get User Orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ userId })
      .populate("items.productId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get Orders Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// Get Order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findById(orderId).populate("items.productId");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order belongs to user
    if (order.userId.toString() !== userId) {
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
    console.error("Get Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

// Update Order Status (Admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "on-the-way",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus, updatedAt: Date.now() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // TODO: Send notification to user about status change
    console.log("✅ Order Status Updated:", order);

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order",
      error: error.message,
    });
  }
};

// Get All Orders (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, dateFilter } = req.query;

    const filter = {};
    if (status) filter.orderStatus = status;

    // 🔥 DATE FILTER LOGIC
    if (dateFilter) {
      const now = new Date();
      let fromDate;

      switch (dateFilter) {
        case "Daily":
          fromDate = new Date(now.setDate(now.getDate() - 1));
          break;
        case "Weekly":
          fromDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "Monthly":
          fromDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case "Yearly":
          fromDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
      }

      if (fromDate) {
        filter.createdAt = { $gte: fromDate };
      }
    }

    // 🔹 FULL COUNT (NOT PAGINATED)
    const totalOrders = await Order.countDocuments(filter);

    // 🔹 PAGINATED DATA
    const orders = await Order.find(filter)
      .populate("userId", "fullName email phone")
      .populate("assignedDeliveryBoy", "name phone")
      .populate("items.productId")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      totalOrders, // 🔥 PERFECT COUNT
      currentPage: Number(page),
      totalPages: Math.ceil(totalOrders / limit),
      orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};





// Assign Delivery Boy to Order (Admin)
exports.assignDeliveryBoy = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { assignedDeliveryBoy } = req.body;

    if (!assignedDeliveryBoy) {
      return res.status(400).json({
        success: false,
        message: "Delivery boy ID is required",
      });
    }

    // Validate if delivery boy exists
    const deliveryBoy = await DeliveryBoy.findById(assignedDeliveryBoy);
    if (!deliveryBoy) {
      return res.status(404).json({
        success: false,
        message: "Delivery boy not found",
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        assignedDeliveryBoy: assignedDeliveryBoy,
        orderStatus: "processing",
      },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Create notification for delivery boy
    const deliveryNotification = await Notification.create({
      type: "order_assigned",
      recipient: "deliveryBoy",
      deliveryBoyId: assignedDeliveryBoy,
      orderId: order._id,
      title: "New Order Assigned",
      message: `New order #${order.orderNumber} assigned to you. Customer: ${order.customerInfo.fullName}`,
      data: {
        orderNumber: order.orderNumber,
        customerName: order.customerInfo.fullName,
        customerPhone: order.customerInfo.phone,
        address: order.customerInfo.address,
        amount: order.pricing.total,
      },
    });

    const io = req.app.get('io');
    if (io) {
      io.emit("deliveryboy_notification", {
        type: "order_assigned",
        deliveryBoyId: String(assignedDeliveryBoy),
        notificationId: deliveryNotification?._id,
        orderId: String(order._id),
        createdAt: deliveryNotification?.createdAt,
      });
    }

    const populatedOrder = await Order.findById(orderId)
      .populate("userId", "fullName email phone")
      .populate("assignedDeliveryBoy", "name phone");

    res.status(200).json({
      success: true,
      message: "Delivery boy assigned successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Assign Delivery Boy Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign delivery boy",
      error: error.message,
    });
  }
};

// Get Orders Assigned to Delivery Boy
exports.getOrdersByDeliveryBoy = async (req, res) => {
  try {
    const deliveryBoyId = req.deliveryBoy.id;

    // Get assigned orders (not yet delivered)
    const assignedOrders = await Order.find({
      assignedDeliveryBoy: deliveryBoyId,
      orderStatus: { $in: ["confirmed", "processing", "shipped", "on-the-way"] },
    })
      .populate("userId", "fullName email phone")
      .populate("assignedDeliveryBoy", "name phone rating totalDeliveries")
      .sort({ createdAt: -1 });

    // Get completed orders (delivered)
    const completedOrders = await Order.find({
      assignedDeliveryBoy: deliveryBoyId,
      orderStatus: "delivered",
    })
      .populate("userId", "fullName email phone")
      .populate("assignedDeliveryBoy", "name phone rating totalDeliveries")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      assignedOrders,
      completedOrders,
      stats: {
        assignedCount: assignedOrders.length,
        completedCount: completedOrders.length,
      },
    });
  } catch (error) {
    console.error("Get Orders by Delivery Boy Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assigned orders",
      error: error.message,
    });
  }
};
