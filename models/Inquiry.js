const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    // Kis seller ko bheji gayi hai
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    // Kis product ke baare me hai (Agar directly product pe click karke aayi hai)
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null, 
    },
    // Buyer ki details
    buyerName: { type: String, required: true, trim: true },
    buyerEmail: { type: String, required: true, trim: true },
    buyerPhone: { type: String, required: true },
    buyerCountry: { type: String }, // B2B me country zaroori hoti hai
    
    // Inquiry ka main content
    quantityRequired: { type: Number },
    unit: { type: String }, // Kg, Ton, etc.
    message: { type: String, required: true },

    // Tracking Status
    status: {
      type: String,
      enum: ["Unread", "Read", "Replied", "Closed"],
      default: "Unread",
    },
  },
  { timestamps: true } // Ye automatically createdAt aur updatedAt de dega
);

module.exports = mongoose.model("Inquiry", inquirySchema);
 