const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
  // 📝 Basic Form Details (Step 1 - Registration)
  companyName: { 
    type: String, 
    required: [true, "Company name is required"],
    trim: true 
  },
  fullName: { 
    type: String, 
    required: [true, "Contact person name is required"],
    trim: true 
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
  gstNumber: { 
    type: String, 
    trim: true,
    uppercase: true, // GST hamesha uppercase me save hoga
    default: "" 
  },
  password: { 
    type: String, 
    required: [true, "Password is required"] 
  },

  // 🏢 Authorization & Onboarding Logic (Industry Standard)
  role: { 
    type: String, 
    default: "seller" 
  },
  status: { 
    type: String, 
    enum: ["pending", "approved", "rejected", "suspended"], 
    default: "pending" // Registration ke baad admin isko approve karega
  },
  onboardingCompleted: {
    type: Boolean,
    default: false // Jab seller dashboard me aake document verify karayega, tab ye true hoga
  },

  // 🔥 Real-time Chat (Socket.io)
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
  timestamps: true 
});

module.exports = mongoose.models.Seller || mongoose.model("Seller", sellerSchema);