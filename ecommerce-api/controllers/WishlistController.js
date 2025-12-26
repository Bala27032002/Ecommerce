const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user.id })
      .populate({
        path: "products.productId",
        select: "name price discount image rating reviews weight _id",
      });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        wishlist: [],
      });
    }

    // Transform products array to match frontend expectations
    const wishlistItems = wishlist.products.map(item => ({
      _id: item.productId._id,
      name: item.productId.name,
      price: item.productId.price,
      discount: item.productId.discount,
      image: item.productId.image,
      rating: item.productId.rating,
      reviews: item.productId.reviews,
      weight: item.productId.weight,
      addedAt: item.addedAt,
    }));

    res.status(200).json({
      success: true,
      wishlist: wishlistItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist/add
// @access  Private
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let wishlist = await Wishlist.findOne({ userId: req.user.id });

    if (!wishlist) {
      // Create new wishlist
      wishlist = await Wishlist.create({
        userId: req.user.id,
        products: [{ productId }],
      });
    } else {
      // Check if product already in wishlist
      const productExists = wishlist.products.find(
        (p) => p.productId.toString() === productId
      );

      if (productExists) {
        return res.status(400).json({
          success: false,
          message: "Product already in wishlist",
        });
      }

      wishlist.products.push({ productId });
      await wishlist.save();
    }

    wishlist = await Wishlist.findOne({ userId: req.user.id })
      .populate({
        path: "products.productId",
        select: "name price discount image rating reviews weight _id",
      });

    // Transform products array to match frontend expectations
    const wishlistItems = wishlist.products.map(item => ({
      _id: item.productId._id,
      name: item.productId.name,
      price: item.productId.price,
      discount: item.productId.discount,
      image: item.productId.image,
      rating: item.productId.rating,
      reviews: item.productId.reviews,
      weight: item.productId.weight,
      addedAt: item.addedAt,
    }));

    res.status(201).json({
      success: true,
      message: "Product added to wishlist",
      wishlist: wishlistItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId: req.user.id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    wishlist.products = wishlist.products.filter(
      (p) => p.productId.toString() !== productId
    );

    await wishlist.save();

    // Fetch updated wishlist with populated products
    const updatedWishlist = await Wishlist.findOne({ userId: req.user.id })
      .populate({
        path: "products.productId",
        select: "name price discount image rating reviews weight _id",
      });

    // Transform products array to match frontend expectations
    const wishlistItems = updatedWishlist.products.map(item => ({
      _id: item.productId._id,
      name: item.productId.name,
      price: item.productId.price,
      discount: item.productId.discount,
      image: item.productId.image,
      rating: item.productId.rating,
      reviews: item.productId.reviews,
      weight: item.productId.weight,
      addedAt: item.addedAt,
    }));

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      wishlist: wishlistItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Clear entire wishlist
// @route   DELETE /api/wishlist
// @access  Private
exports.clearWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user.id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    wishlist.products = [];
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: "Wishlist cleared",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
exports.checkWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId: req.user.id });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        inWishlist: false,
      });
    }

    const inWishlist = wishlist.products.some(
      (p) => p.productId.toString() === productId
    );

    res.status(200).json({
      success: true,
      inWishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
