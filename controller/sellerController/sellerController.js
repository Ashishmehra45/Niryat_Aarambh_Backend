const Seller = require("../../models/sellerModel.js");
const otpGenerator = require("otp-generator");
const cloudinary = require("../../services/cloudinary");
const Product = require("../../models/Product");

const fs = require("fs");
const path = require("path");
const twilio = require("twilio");
const jwt = require("jsonwebtoken");

// SAFE INITIALIZATION
if (!process.env.TWILIO_ACCOUNT_SID) {
  require("dotenv").config({
    path: require("path").resolve(__dirname, "../../.env"),
  });
}

// 1. Send OTP (Using Twilio & otp-generator)
exports.sendOtp = async (req, res) => {
  try {
    let { businessPhone } = req.body;

    if (!businessPhone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    // 🔥 FIX 1: Convert to string safely to prevent server crash if frontend sends a Number
    businessPhone = String(businessPhone).trim();

    // Check and add country code
    if (!businessPhone.startsWith("+")) {
      businessPhone = `+91${businessPhone}`;
    }

    // OTP Generate (4 digit numeric)
    const generatedOtp = otpGenerator.generate(4, {
      digits: true, // Safe keeping
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });

    const expiryTime = new Date(Date.now() + 5 * 60 * 1000); // 5 mins expiry

    // DB me save ya update karein
    let seller = await Seller.findOne({ businessPhone });
    if (!seller) {
      seller = new Seller({
        businessPhone,
        otp: generatedOtp,
        otpExpiry: expiryTime,
      });
    } else {
      seller.otp = generatedOtp;
      seller.otpExpiry = expiryTime;
    }
    await seller.save();

    // 🔥 FIX 2: Twilio uses a factory function, not a constructor (removed 'new')
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );

    // Twilio se message bhejein
    await client.messages.create({
      body: `Niryat Aarambh: Your verification code is ${generatedOtp}. It is valid for 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: businessPhone,
    });

    res.status(200).json({ message: "OTP sent successfully via Twilio." });
  } catch (error) {
    console.error("Twilio Error Details:", error);
    res.status(500).json({ error: error.message || "Failed to send OTP." });
  }
};

// 2. Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    let { businessPhone, otp } = req.body;

    if (!businessPhone || !otp) {
      return res
        .status(400)
        .json({ error: "Phone number and OTP are required" });
    }

    if (!businessPhone.startsWith("+")) {
      businessPhone = `+91${businessPhone}`;
    }

    const seller = await Seller.findOne({ businessPhone });
    if (!seller) return res.status(404).json({ error: "User not found." });

    if (seller.otp !== otp)
      return res.status(400).json({ error: "Invalid OTP." });
    if (seller.otpExpiry < new Date())
      return res.status(400).json({ error: "OTP expired." });

    seller.isPhoneVerified = true;
    seller.otp = null;
    seller.otpExpiry = null;
    await seller.save();

    res
      .status(200)
      .json({ message: "Phone verified successfully!", sellerId: seller._id });
  } catch (error) {
    res.status(500).json({ error: "Server error during verification." });
  }
};

const uploadToCloudinary = async (file) => {
  try {
    const filePath = path.resolve(file.path);
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "niryat_aarambh_sellers",
    });

    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (err) {
      console.log("File already deleted or not found");
    }

    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw error;
  }
};

// 3. Complete Registration
exports.completeRegistration = async (req, res) => {
  try {
    console.log("Body:", req.body);
    console.log("Files:", req.files);

    // 🔥 THE FIX: 'const' ki jagah 'let' lagaya hai taaki variable update ho sake
    let { businessPhone, businessEmail, ...otherData } = req.body;

    if (!businessPhone) {
      return res
        .status(400)
        .json({ error: "Business Phone is missing in request!" });
    }

    // Ab ye aaram se update ho jayega bina kisi error ke
    businessPhone = String(businessPhone).trim();
    if (!businessPhone.startsWith("+")) {
      businessPhone = `+91${businessPhone}`;
    }

    // Optional: Check if Email is already used by ANOTHER user
    if (businessEmail) {
      const emailExists = await Seller.findOne({
        businessEmail: businessEmail,
        businessPhone: { $ne: businessPhone },
      });

      if (emailExists) {
        return res.status(400).json({
          error: "This Email is already registered with another account.",
        });
      }
    }

    let profileImageUrl = null;
    let coverImageUrl = null;

    if (req.files?.profileImage) {
      profileImageUrl = await uploadToCloudinary(req.files.profileImage[0]);
    }
    if (req.files?.coverImage) {
      coverImageUrl = await uploadToCloudinary(req.files.coverImage[0]);
    }

    const updatedSeller = await Seller.findOneAndUpdate(
      { businessPhone: businessPhone },
      {
        businessEmail: businessEmail,
        ...otherData,
        profileImage: profileImageUrl,
        coverImage: coverImageUrl,
      },
      { returnDocument: "after" },
    );

    if (!updatedSeller) {
      return res
        .status(404)
        .json({ error: "Seller not found. Please verify phone number first." });
    }

    res.status(200).json({
      message: "Registration successful with Cloudinary!",
      seller: updatedSeller,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// 1. STEP 1: Send OTP for Login
exports.loginSendOTP = async (req, res) => {
  try {
    let { businessPhone } = req.body;

    if (!businessPhone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    businessPhone = String(businessPhone).trim();
    if (!businessPhone.startsWith("+")) {
      businessPhone = `+91${businessPhone}`;
    }

    // CHECK IF SELLER EXISTS (Login me naya user nahi banega)
    let seller = await Seller.findOne({ businessPhone });
    if (!seller) {
      return res
        .status(404)
        .json({ error: "Seller not found. Please register first." });
    }

    // GENERATE OTP
    const generatedOtp = otpGenerator.generate(4, {
      digits: true,
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });
    const expiryTime = new Date(Date.now() + 5 * 60 * 1000); // 5 mins expiry

    // SAVE OTP IN DB
    seller.otp = generatedOtp;
    seller.otpExpiry = expiryTime;
    await seller.save();

    // SEND TWILIO MESSAGE
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
    await client.messages.create({
      body: `Niryat Aarambh Login: Your verification code is ${generatedOtp}. Do not share this.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: businessPhone,
    });

    res
      .status(200)
      .json({ message: "OTP sent successfully to your registered number." });
  } catch (error) {
    console.error("Twilio Login Error:", error);
    res.status(500).json({ error: "Failed to send OTP for login." });
  }
};

// 2. STEP 2: Verify OTP & Generate Token
exports.loginWithOTP = async (req, res) => {
  try {
    let { businessPhone, otp } = req.body;

    if (!businessPhone || !otp) {
      return res
        .status(400)
        .json({ error: "Phone number and OTP are required" });
    }

    businessPhone = String(businessPhone).trim();
    if (!businessPhone.startsWith("+")) {
      businessPhone = `+91${businessPhone}`;
    }

    // 1. FIND SELLER
    const seller = await Seller.findOne({ businessPhone });
    if (!seller) {
      return res.status(404).json({ error: "Seller not found." });
    }

    // 2. VERIFY OTP
    if (seller.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP." });
    }
    if (seller.otpExpiry < new Date()) {
      return res
        .status(400)
        .json({ error: "OTP has expired. Request a new one." });
    }

    // CLEAR OTP AFTER SUCCESS
    seller.otp = null;
    seller.otpExpiry = null;
    await seller.save();

    // 3. GENERATE TOKEN
    const token = jwt.sign({ id: seller._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Production me hamesha TRUE hona chahiye (HTTPS ke liye)
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // 🔥 YE LINE SABSE IMPORTANT HAI
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Login successful!", seller });
  } catch (error) {
    console.error("Login Verify Error:", error);
    res.status(500).json({ error: "Server error during login verification." });
  }
};

// 4. Update Subscription Plan
exports.updatePlan = async (req, res) => {
  try {
    const { sellerId, planName } = req.body;

    const seller = await Seller.findByIdAndUpdate(
      sellerId,
      { currentPlan: planName },
      { new: true },
    );

    res.status(200).json({ message: `Plan updated to ${planName}`, seller });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Main Function: Add New Product
exports.addProduct = async (req, res) => {
  try {
    console.log("Product Body:", req.body);
    console.log("Product File:", req.file);

    const {
      sellerId,
      productName,
      category,
      price,
      unit,
      moq,
      moqUnit,
      description,
    } = req.body;

    // 1. Basic Validation
    if (!sellerId) {
      return res.status(400).json({ error: "Seller ID is required." });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Product image is required." });
    }

    // 2. Fetch Seller Details (Company name nikalne ke liye)
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ error: "Seller not found in database." });
    }

    // 3. Upload Image to Cloudinary
    const productImageUrl = await uploadToCloudinary(req.file);

    // 4. Save to Database
    const newProduct = new Product({
      sellerId: sellerId,
      companyName: seller.businessName, // Seller se uthaya hua data
      productName,
      category,
      price,
      unit,
      moq,
      moqUnit,
      description,
      productImage: productImageUrl,
      verifiedExporter: "Verified",
      gstVerified: "Verified",
      // Note: verifiedExporter aur gstVerified automatically "Pending" ho jayenge schema ke hisaab se
    });

    await newProduct.save();

    res.status(201).json({
      message: "Product added successfully! Waiting for admin approval.",
      product: newProduct,
    });
  } catch (error) {
    console.error("Add Product Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Fetch Seller's Products
exports.getMyProducts = async (req, res) => {
  try {
    // 🔥 Middleware se aayi hui ID use karo (Security Proof)
    const sellerId = req.user.id;

    const products = await Product.find({ sellerId: sellerId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      products: products,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error." });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({ message: "Logged out successfully!" });
};
