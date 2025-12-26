const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlist,
} = require("../controllers/WishlistController");

// All wishlist routes require authentication
router.use(protect);

// Get user's wishlist
router.get("/", getWishlist);

// Add product to wishlist (POST with body)
router.post("/add", addToWishlist);

// Remove product from wishlist
router.delete("/:productId", removeFromWishlist);

// Check if product is in wishlist
router.get("/check/:productId", checkWishlist);

// Clear entire wishlist
router.delete("/", clearWishlist);

module.exports = router;
