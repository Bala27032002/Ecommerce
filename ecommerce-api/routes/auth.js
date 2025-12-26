const express = require("express");
const { register, login, getCurrentUser, googleAuth, appleAuth } = require("../controllers/AuthController");
const { protect } = require("../middlewares/auth");

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/apple", appleAuth);

// Protected routes
router.get("/me", protect, getCurrentUser);

module.exports = router;
