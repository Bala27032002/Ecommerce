const Product = require("../models/Product");
const Category = require("../models/Category");

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async (req, res) => {
  try {
    const { category, search, name, sort, page = 1, limit = 10, minPrice, maxPrice, rating, range, minDiscount } = req.query;

    let query = { isActive: true };

    // Filter by category
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      }
    }

    // Filter by product name (case-insensitive regex search)
    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    // Full-text search (searches name, description, tags)
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by predefined price ranges
    if (range && range !== "all") {
      query.price = {};
      if (range === "under100") {
        query.price.$lt = 100;
      } else if (range === "100-200") {
        query.price.$gte = 100;
        query.price.$lt = 200;
      } else if (range === "200-500") {
        query.price.$gte = 200;
        query.price.$lt = 500;
      } else if (range === "500plus") {
        query.price.$gte = 500;
      }
    }

    // Filter by custom price range (minPrice/maxPrice inputs)
    if (minPrice || maxPrice) {
      if (!query.price) query.price = {};
      if (minPrice) {
        query.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        query.price.$lte = parseFloat(maxPrice);
      }
    }

    // Filter by minimum rating
    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    // Filter by minimum discount percentage
    if (minDiscount) {
      const min = Number(minDiscount);

      query.$and = query.$and || [];
      query.$and.push({
        $expr: {
          $gte: [
            {
              $let: {
                vars: {
                  effectiveDiscount: {
                    $cond: [
                      {
                        $and: [
                          "$offer.isActive",
                          { $eq: ["$offer.discountType", "PERCENTAGE"] },
                          { $ne: ["$offer.discountValue", null] },
                        ],
                      },
                      "$offer.discountValue",
                      "$discount",
                    ],
                  },
                },
                in: {
                  $convert: {
                    input: "$$effectiveDiscount",
                    to: "double",
                    onError: 0,
                    onNull: 0,
                  },
                },
              },
            },
            min,
          ],
        },
      });
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Sort options
    let sortOption = { createdAt: -1 };
    if (sort === "price-low") sortOption = { price: 1 };
    if (sort === "price-high") sortOption = { price: -1 };
    if (sort === "newest") sortOption = { createdAt: -1 };
    if (sort === "rating") sortOption = { rating: -1 };
    if (sort === "name-asc") sortOption = { name: 1 };
    if (sort === "name-desc") sortOption = { name: -1 };

    const products = await Product.find(query)
      .populate("category", "name slug")
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name slug")
      .populate("reviews.userId", "fullName email");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Get related products
    const relatedProducts = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
      isActive: true,
    })
      .limit(4)
      .select("name price discount image rating");

    res.status(200).json({
      success: true,
      product,
      relatedProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get featured products with optional category filter
// @route   GET /api/products/featured/all?category=categorySlug
// @access  Public
exports.getFeaturedProducts = async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = { isFeatured: true, isActive: true };
    
    // Filter by category if provided
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      }
    }
    
    const products = await Product.find(query)
      .populate("category", "name slug")
      .limit(10);

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get today's special products
// @route   GET /api/products/special/today
// @access  Public
exports.getTodaysSpecialProducts = async (req, res) => {
  try {
    const products = await Product.find({ isTodaysSpecial: true, isActive: true })
      .populate("category", "name slug")
      .limit(10);

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get products by category
// @route   GET /api/products/category/:categorySlug
// @access  Public
exports.getProductsByCategory = async (req, res) => {
  try {
    const { categorySlug } = req.params;
    const { page = 1, limit = 10, sort } = req.query;

    const category = await Category.findOne({ slug: categorySlug });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const skip = (page - 1) * limit;

    let sortOption = { createdAt: -1 };
    if (sort === "price-low") sortOption = { price: 1 };
    if (sort === "price-high") sortOption = { price: -1 };

    const products = await Product.find({
      category: category._id,
      isActive: true,
    })
      .populate("category", "name slug")
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments({
      category: category._id,
      isActive: true,
    });

    res.status(200).json({
      success: true,
      category: {
        name: category.name,
        slug: category.slug,
        image: category.image,
      },
      count: products.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create product (Admin)
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      originalPrice,
      image,
      images,
      stock,
      sku,
      tags,
      quantity,
    } = req.body;

    // Validation
    if (!name || !description || !category || !price || !image || stock === undefined || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields including quantity",
      });
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // ❌ DO NOT accept discount from frontend
    const product = await Product.create({
      name,
      description,
      category,
      price,
      originalPrice,
      image,
      images,
      stock,
      sku,
      tags,
      quantity,
    });
    // 🔥 discount auto-calculated via pre("save") hook

    // Emit real-time event
    const io = req.app.get("io");
    if (io) {
      io.emit("productCreated", {
        success: true,
        message: "New product added",
        product: await Product.findById(product._id).populate("category", "name"),
      });
    }

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
Object.assign(product, req.body);

    
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete product (Admin)
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add or update product review
// @route   POST /api/products/:id/review
// @access  Private
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating) {
      return res.status(400).json({
        success: false,
        message: "Please provide rating",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if user already reviewed
    const existingReviewIndex = product.reviews.findIndex((r) => r.userId.toString() === req.user.id);

    if (existingReviewIndex !== -1) {
      // Update existing review
      product.reviews[existingReviewIndex].rating = rating;
      product.reviews[existingReviewIndex].comment = comment || `Rated ${rating} stars`;
      product.reviews[existingReviewIndex].createdAt = Date.now();
    } else {
      // Add new review
      product.reviews.push({
        userId: req.user.id,
        userName: req.user.fullName || req.user.name,
        userEmail: req.user.email,
        rating,
        comment: comment || `Rated ${rating} stars`,
      });
    }

    // Calculate average rating
    const avgRating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
    product.rating = Math.round(avgRating * 10) / 10;
    product.reviewCount = product.reviews.length;

    await product.save();

    res.status(201).json({
      success: true,
      message: existingReviewIndex !== -1 ? "Review updated successfully" : "Review added successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Record product view
// @route   POST /api/products/:id/view
// @access  Private
exports.recordProductView = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;

    // Find user and add/update product in their view history
    const User = require('../models/AuthModel');
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize viewHistory if it doesn't exist
    if (!user.viewHistory) {
      user.viewHistory = [];
    }

    // Remove if already exists (to update the timestamp)
    user.viewHistory = user.viewHistory.filter(item => item.productId.toString() !== productId);

    // Add to beginning with current timestamp
    user.viewHistory.unshift({
      productId: productId,
      viewedAt: new Date()
    });

    // Keep only last 100 views
    user.viewHistory = user.viewHistory.slice(0, 10);

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Product view recorded'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get recently viewed products for user
// @route   GET /api/products/recently-viewed
// @access  Private
exports.getRecentlyViewedProducts = async (req, res) => {
  try {
    const userId = req.user.id;

    const User = require('../models/AuthModel');
    const user = await User.findById(userId).populate({
      path: 'viewHistory.productId',
      select: '_id name price image category rating reviews weight description isActive createdAt',
      populate: {
        path: 'category',
        select: 'name slug'
      }
    });

    if (!user || !user.viewHistory) {
      return res.status(200).json({
        success: true,
        count: 0,
        products: []
      });
    }

    // Filter products from last 10 days
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const products = user.viewHistory
      .filter(item => {
        const viewedDate = new Date(item.viewedAt);
        return viewedDate >= tenDaysAgo && item.productId && item.productId.isActive;
      })
      .map(item => ({
        ...item.productId.toObject(),
        viewedAt: item.viewedAt
      }));

    res.status(200).json({
      success: true,
      count: products.length,
      products: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get product reviews
// @route   GET /api/products/:id/reviews
// @access  Public
exports.getProductReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .select("reviews rating reviewCount")
      .populate("reviews.userId", "fullName email");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      rating: product.rating,
      reviewCount: product.reviewCount,
      reviews: product.reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
