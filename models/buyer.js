const mongoose = require('mongoose');

const buyerSchema = new mongoose.Schema({
  // 📝 Basic Form Details
  fullName: { 
    type: String, 
    required: [true, "Full name is required"],
    trim: true 
  },
  company: { 
    type: String, 
    trim: true,
    default: "" // Form me humne optional rakha tha
  },
  email: { 
    type: String, 
    required: [true, "Email is required"], 
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: { 
    type: String, 
    required: [true, "Phone number is required"] 
  },
  address: { 
    type: String, 
    required: [true, "Delivery address is required"] 
  },
  password: { 
    type: String, 
    required: [true, "Password is required"] // Bcrypt se hash karke save karna
  },

  // 🔐 Role Base Access (Separate model hai, par APIs me validation ke liye kaam aayega)
  role: { 
    type: String, 
    default: "buyer" 
  },

  
  approvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin', // Jab Admin model banayega tab ye kaam aayega
    default: null 
  },

  // 🔥 Socket.io Real-time Features (Chat & Notifications)
  isOnline: { 
    type: Boolean, 
    default: false 
  },
  lastSeen: { 
    type: Date, 
    default: Date.now 
  },
  socketId: { 
    type: String,
    default: null
  }
}, { 
  timestamps: true // Ye createdAt aur updatedAt automatically add kar dega
});

module.exports = mongoose.models.Buyer || mongoose.model("Buyer", buyerSchema);

