const User = require("../models/AuthModel");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// @desc    Register User
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { fullName, email, phone, password, confirmPassword } = req.body;

    // Validation
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({
      $or: [{ phone }, { email }],
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User with this email or phone already exists",
      });
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      phone,
      password,
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Login User
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Validation
    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide phone and password",
      });
    }

    // Check for user
    const user = await User.findOne({ phone }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get Current User
// @route   GET /api/auth/me
// @access  Private
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Google OAuth Login
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
  try {
    const { token, email, fullName, picture } = req.body;

    if (!token || !email) {
      return res.status(400).json({
        success: false,
        message: "Google token and email are required",
      });
    }

    let user = await User.findOne({ email });

    if (user) {
      // User exists, update if needed
      if (!user.googleId) {
        user.googleId = token;
        user.authProvider = "google";
        if (picture) user.profileImage = picture;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        fullName: fullName || email.split("@")[0],
        email,
        googleId: token,
        authProvider: "google",
        profileImage: picture || null,
      });
    }

    // Generate JWT token
    const jwtToken = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Google authentication successful",
      token: jwtToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || null,
        profileImage: user.profileImage,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Apple OAuth Login
// @route   POST /api/auth/apple
// @access  Public
exports.appleAuth = async (req, res) => {
  try {
    const { token, email, fullName, appleId } = req.body;

    if (!token || !email) {
      return res.status(400).json({
        success: false,
        message: "Apple token and email are required",
      });
    }

    let user = await User.findOne({ email });

    if (user) {
      // User exists, update if needed
      if (!user.appleId) {
        user.appleId = appleId || token;
        user.authProvider = "apple";
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        fullName: fullName || email.split("@")[0],
        email,
        appleId: appleId || token,
        authProvider: "apple",
      });
    }

    // Generate JWT token
    const jwtToken = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Apple authentication successful",
      token: jwtToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || null,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
