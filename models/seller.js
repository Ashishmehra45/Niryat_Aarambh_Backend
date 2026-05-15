import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({

  // USER CONNECTION
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },

  // BUSINESS DETAILS
  businessName: {
    type: String,
    required: true
  },

  ownerName: {
    type: String
  },

  businessEmail: {
    type: String
  },

  businessPhone: {
    type: String
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
    type: String
  },

  exportLicense: {
    type: String
  },

  website: {
    type: String
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
    enum: ["free", "basic", "premium"],
    default: "free"
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
  timestamps: true
});

const Seller = mongoose.model("Seller", sellerSchema);

export default Seller;