const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const {
  getCart,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
} = require("../controllers/CartController");

// All cart routes require authentication
router.use(protect);

// Get user's cart
router.get("/", getCart);

// Add product to cart
router.post("/add", addToCart);

// Update cart item quantity
router.put("/:productId", updateCartQuantity);

// Remove product from cart
router.delete("/:productId", removeFromCart);

// Clear entire cart
router.delete("/clear", clearCart);

module.exports = router;
