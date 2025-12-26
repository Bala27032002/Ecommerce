const express = require("express");
const {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/CategoryController");
const { protectAdmin, checkPermission } = require("../middlewares/adminAuth");

const router = express.Router();

// Public routes
router.get("/", getAllCategories);
router.get("/:slug", getCategoryBySlug);

// Admin routes
router.post("/", protectAdmin, checkPermission("manage_categories"), createCategory);
router.put("/:id", protectAdmin, checkPermission("manage_categories"), updateCategory);
router.delete("/:id", protectAdmin, checkPermission("manage_categories"), deleteCategory);

module.exports = router;
