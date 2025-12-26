const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Helper function to format cart items
const formatCartItems = (items) => {
  return items.map(item => ({
    _id: item.productId._id,
    name: item.productId.name,
    price: item.price,
    quantity: item.quantity,
    image: item.productId.image,
    weight: item.productId.weight,
    discount: item.productId.discount,
    addedAt: item.addedAt,
  }));
};

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id })
      .populate({
        path: "items.productId",
        select: "name price discount image weight _id",
      });

    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: [],
      });
    }

    const cartItems = formatCartItems(cart.items);

    res.status(200).json({
      success: true,
      cart: cartItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add product to cart
// @route   POST /api/cart/add
// @access  Private
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

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

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      // Create new cart
      cart = await Cart.create({
        userId: req.user.id,
        items: [
          {
            productId,
            quantity,
            price: product.price,
          },
        ],
      });
    } else {
      // Check if product already in cart
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (itemIndex > -1) {
        // Update quantity if product already exists
        cart.items[itemIndex].quantity += quantity;
      } else {
        // Add new item to cart
        cart.items.push({
          productId,
          quantity,
          price: product.price,
        });
      }

      await cart.save();
    }

    // Fetch updated cart with populated products
    cart = await Cart.findOne({ userId: req.user.id })
      .populate({
        path: "items.productId",
        select: "name price discount image weight _id",
      });

    const cartItems = formatCartItems(cart.items);

    res.status(201).json({
      success: true,
      message: "Product added to cart",
      cart: cartItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Remove product from cart
// @route   DELETE /api/cart/:productId
// @access  Private
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await cart.save();

    // Fetch updated cart with populated products
    const updatedCart = await Cart.findOne({ userId: req.user.id })
      .populate({
        path: "items.productId",
        select: "name price discount image weight _id",
      });

    const cartItems = formatCartItems(updatedCart.items);

    res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: cartItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
exports.updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    // Fetch updated cart with populated products
    const updatedCart = await Cart.findOne({ userId: req.user.id })
      .populate({
        path: "items.productId",
        select: "name price discount image weight _id",
      });

    const cartItems = formatCartItems(updatedCart.items);

    res.status(200).json({
      success: true,
      message: "Cart quantity updated",
      cart: cartItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart/clear
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared",
      cart: [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
