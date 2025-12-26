const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const productRoutes = require("./routes/products");
const categoryRoutes = require("./routes/categories");
const wishlistRoutes = require("./routes/wishlistRoutes");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");
const notificationRoutes = require("./routes/notifications");
const deliveryBoyRoutes = require("./routes/deliveryBoy");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "https://gofreshecommerce.netlify.app",
      "https://gofreshecommerce.netlify.app/",
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "https://freshlyygo.netlify.app",
      "https://freshlyygo.netlify.app/",
      "https://freshlygoadmin.netlify.app/",
      "https://freshlygoadmin.netlify.app"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Middlewares
app.use(cors({
  origin: [
    "https://gofreshecommerce.netlify.app",
    "https://gofreshecommerce.netlify.app/",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "https://freshlyygo.netlify.app",
    "https://freshlyygo.netlify.app/",
    "https://freshlygoadmin.netlify.app/",
    "https://freshlygoadmin.netlify.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("📦 MongoDB Connected Successfully"))
  .catch((error) => console.log("❌ DB Connection Failed: ", error));

// Testing Route
app.get("/", (req, res) => {
  res.send("🚀 Server Running Successfully");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/delivery-boy", deliveryBoyRoutes);

// Start Server
server.listen(process.env.PORT, () => {
  console.log(`⚡ Server running on port ${process.env.PORT}`);
});
