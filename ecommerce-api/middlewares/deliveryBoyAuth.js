const jwt = require("jsonwebtoken");

const deliveryBoyAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_secret_key"
    );

    if (decoded.role !== "deliveryBoy") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    req.deliveryBoy = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
      error: error.message,
    });
  }
};

module.exports = deliveryBoyAuth;
