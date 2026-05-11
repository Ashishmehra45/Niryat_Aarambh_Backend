const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // 📦 Basic Product Details
  name: { 
    type: String, 
    required: [true, "Product name is required"],
    trim: true 
  },
  description: { 
    type: String, 
    required: [true, "Description is required"] 
  },
  category: { 
    type: String, 
    required: [true, "Category is required"]
    // enum: ['Handicraft', 'Textile', 'Food', 'Agriculture', 'Other'] // Optional: Specific categories rakhne ke liye
  },
  price: { 
    type: Number, 
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"]
  },
  stock: { 
    type: Number, 
    required: [true, "Stock is required"],
    min: [0, "Stock cannot be negative"],
    default: 0
  },
//   images: [{ 
//     type: String // Array of Image URLs
//   }],

  // 🔥 CORE LOGIC: Linking Product to Seller and Admin
  seller: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Seller', // Reference to the Seller Model
    required: [true, "A product must be linked to a Seller"] 
  },
  createdByAdmin: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin', // Record track karne ke liye ki kis admin ne banaya tha
    required: true 
  },

 
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Draft'],
    default: 'Active'
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Product', productSchema);