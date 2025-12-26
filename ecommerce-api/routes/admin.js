const express = require("express");
const {
  loginAdmin,
  getCurrentAdmin,
} = require("../controllers/AdminController");
const { protectAdmin } = require("../middlewares/adminAuth");

const router = express.Router();

// Public routes
router.post("/login", loginAdmin);

// Protected admin routes
router.get("/me", protectAdmin, getCurrentAdmin);

module.exports = router;
