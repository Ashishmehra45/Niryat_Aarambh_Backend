const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    productImage: {
      type: String,
      required: [true, "Product image is required"],
    },
    price: { type: Number, required: [true, "Price is required"] },
    unit: { type: String, required: [true, "Unit is required"], trim: true },
    moq: { type: Number, required: [true, "MOQ is required"] },
    moqUnit: {
      type: String,
      required: [true, "MOQ Unit is required"],
      trim: true,
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    exportCountries: [{ type: String, trim: true }],
    description: { type: String, trim: true },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    stock: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },

    // 🔥 ADMIN VERIFICATION FIELDS (Default: Pending)
    verifiedExporter: {
      type: String,
      enum: ["Pending", "Verified", "Rejected"],
      default: "Pending", // Product create hote hi Pending status me jayega
    },
    gstVerified: {
      type: String,
      enum: ["Pending", "Verified", "Rejected"],
      default: "Pending", // Admin isko dashboard se 'Verified' karega
    },
    // Product Schema ke andar add karna hai
    productTimeline: [
      {
        date: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        timelineImage: { type: String }, // Cloudinary URL
      },
    ],
  },
  { timestamps: true },
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
