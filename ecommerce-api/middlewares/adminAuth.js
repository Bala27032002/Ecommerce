const jwt = require("jsonwebtoken");

// Protect admin routes - verify JWT token and check if user is admin
exports.protectAdmin = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token is for admin
    if (decoded.type !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Not authorized as admin",
      });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
};

// Check if admin has specific permission
exports.checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const Admin = require("../models/Admin");
      const admin = await Admin.findById(req.admin.id);

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Admin not found",
        });
      }

      // SuperAdmin has all permissions
      if (admin.role === "superadmin") {
        return next();
      }

      // Check if admin has required permission
      if (!admin.permissions.includes(requiredPermission)) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to perform this action",
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
};
