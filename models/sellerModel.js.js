const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema({
  // LOGIN CREDENTIALS
  businessPhone: {
    type: String,
    required: [true, "Business phone number is required"],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters long"]
  },

  // USER CONNECTION 
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true,
    sparse: true // Yeh zaroori hai! Taki jab tak userId na ho, tab tak null values duplicate error na dein
  },

  // BUSINESS DETAILS
  businessName: {
    type: String,
    trim: true
  },

  ownerName: {
    type: String,
    trim: true
  },

  businessEmail: {
   type: String,
   trim: true,
   lowercase: true,
   unique: true,
   sparse: true
  },

  country: {
    type: String
  },

  state: {
    type: String
  },

  city: {
    type: String
  },

  address: {
    type: String
  },

  companyDescription: {
    type: String
  },

  gstNumber: {
    type: String,
    trim: true
  },

  exportLicense: {
    type: String,
    trim: true
  },

  website: {
    type: String,
    trim: true
  },

  // IMAGES
  profileImage: {
    type: String
  },

  coverImage: {
    type: String
  },

  // PLAN DETAILS
  currentPlan: {
    type: String,
    enum: ["Free", "Basic", "Premium"], 
    default: "Free"
  },

  // VERIFIED BADGE
  verifiedBadge: {
    type: Boolean,
    default: false
  },

  // SEARCH PRIORITY
  searchPriority: {
    type: Number,
    default: 1
  },

  // ACCOUNT STATUS
  isBlocked: {
    type: Boolean,
    default: false
  },

  // SUBSCRIPTION STATUS
  subscriptionStatus: {
    type: String,
    enum: ["active", "expired", "cancelled"],
    default: "active"
  }

}, {
  timestamps: true // Isse createdAt aur updatedAt apne aap manage ho jayenge
});

const Seller = mongoose.model("Seller", sellerSchema);

module.exports = Seller;