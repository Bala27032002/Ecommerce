const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    originalPrice: {
      type: Number,
      default: null,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    image: {
      type: String,
      required: [true, "Product image is required"],
    },
    images: [
      {
        type: String,
      },
    ],
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      default: 0,
      min: 0,
    },
    quantity: {
      value: {
        type: Number,
        required: [true, "Quantity value is required"],
      },
      unit: {
        type: String,
        enum: ["g", "kg", "ml", "l", "pc", "pack"],
        default: "g",
      },
    },
    offer: {
      isActive: {
        type: Boolean,
        default: false,
      },
      title: {
        type: String,
      },
      discountType: {
        type: String,
        enum: ["PERCENTAGE", "FLAT"],
      },
      discountValue: {
        type: Number,
      },
      badgeText: {
        type: String,
      },
      validFrom: {
        type: Date,
      },
      validTill: {
        type: Date,
      },
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        userName: String,
        userEmail: String,
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isTodaysSpecial: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [String],
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

// Indexes
productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isTodaysSpecial: 1 });
productSchema.index({ isActive: 1 });

// Pre-save hook (for create & save)
productSchema.pre("save", function (next) {
  if (this.originalPrice && this.originalPrice > this.price) {
    this.discount = Math.round(
      ((this.originalPrice - this.price) / this.originalPrice) * 100
    );
  } else {
    this.discount = 0;
  }
  next();
});

// Pre-findOneAndUpdate hook (for findByIdAndUpdate / updateOne)
productSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();

  if (update.price || update.originalPrice) {
    // Fetch current document if values are not provided
    const docToUpdate = await this.model.findOne(this.getQuery());

    const price = update.price ?? docToUpdate.price;
    const originalPrice = update.originalPrice ?? docToUpdate.originalPrice;

    if (originalPrice && originalPrice > price) {
      update.discount = Math.round(((originalPrice - price) / originalPrice) * 100);
    } else {
      update.discount = 0;
    }

    this.setUpdate(update);
  }

  next();
});

module.exports = mongoose.model("Product", productSchema);
