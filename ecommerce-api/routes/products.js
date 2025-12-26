const express = require("express");
const {
  getAllProducts,
  getProductById,
  getFeaturedProducts,
  getTodaysSpecialProducts,
  getRecentlyViewedProducts,
  recordProductView,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  getProductReviews,
} = require("../controllers/ProductController");
const { protect } = require("../middlewares/auth");
const { protectAdmin, checkPermission } = require("../middlewares/adminAuth");

const router = express.Router();

// Public routes - Order matters! Specific routes before dynamic :id routes
router.get("/featured/all", getFeaturedProducts);
router.get("/special/today", getTodaysSpecialProducts);
router.get("/offers", getAllProducts); // Special route for offers filtering
router.get("/category/:categorySlug", getProductsByCategory);

// Protected routes (User) - Before main products route
router.get("/recently-viewed", protect, getRecentlyViewedProducts);
router.post("/:id/view", protect, recordProductView);

// Main products route with search, filter, and pagination support
// GET /api/products?search=keyword&category=slug&sort=price-low&page=1&limit=10
router.get("/", getAllProducts);

// Single product routes
router.get("/:id/reviews", getProductReviews);
router.get("/:id", getProductById);

// Protected routes (User)
router.post("/:id/review", protect, addReview);

// Admin routes
router.post("/", protectAdmin, checkPermission("manage_products"), createProduct);
router.put("/:id", protectAdmin, checkPermission("manage_products"), updateProduct);
router.delete("/:id", protectAdmin, checkPermission("manage_products"), deleteProduct);

module.exports = router;
