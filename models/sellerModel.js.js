const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema({
  // OTP FIELDS (Shuruat mein sirf yehi fill honge)
  businessPhone: {
    type: String,
    required: [true, "Business phone number is required"],
    unique: true,
    trim: true
  },
  otp: {
    type: String,
    default: null
  },
  otpExpiry: {
    type: Date,
    default: null
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },

  // USER CONNECTION 
  // (Isse required: true se hata diya hai taaki OTP save ho sake. Step 2/3 mein update kar lena)
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
 // PLAN DETAILS
  currentPlan: {
    type: String,
    enum: ["Free", "Basic", "Premium"], // Ab Frontend se match karega!
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