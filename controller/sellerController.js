const bcrypt = require('bcryptjs');
const Seller = require('../models/seller'); // Dhyan rakhna file ka naam aur path sahi ho
const jwt = require('jsonwebtoken');

const registerSeller = async (req, res) => {
  try {
    const { companyName, fullName, email, phone, gstNumber, password } = req.body;

    // 1. Basic Validation (GST is optional, but rest are required)
    if (!companyName || !fullName || !email || !phone || !password) {
      return res.status(400).json({ message: "Company Name, Name, Email, Phone aur Password are required!" });
    }

    // 2. Check if seller already exists
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({ message: "This email is already registered. Please login." });
    }

    // 3. Hash the password for security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create new Seller instance
    // Note: status aur onboardingCompleted automatically model ke default values le lenge
    const newSeller = new Seller({
      companyName,
      fullName,
      email,
      phone,
      gstNumber, // Agar frontend se empty aayega toh empty string save ho jayega
      password: hashedPassword
    });

    // 5. Save to Database
    await newSeller.save();

    res.status(201).json({ 
      message: "Seller account successfully created! Please login to continue onboarding." 
    });

  } catch (error) {
    console.error("Seller Registration Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email aur Password dono zaroori hain!" });
    }

    // 2. Check if seller exists
    const seller = await Seller.findOne({ email });
    if (!seller) {
      return res.status(400).json({ message: "Ye email registered nahi hai. Pehle register karein." });
    }

    // 3. Password verify karna
    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password galat hai, dubara try karein." });
    }

    // 4. JWT Token Generate Karna
    // Payload me status daalna zaroori hai taaki frontend pe easily check ho sake ki approve hua ya nahi
    const token = jwt.sign(
      { 
        id: seller._id, 
        role: seller.role, 
        status: seller.status 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    // 🔥 5. Cookie Setup (Super Secure)
    res.cookie('sellerToken', token, {
      httpOnly: true,     // JS se token access nahi hoga (Security!)
      secure: process.env.NODE_ENV === 'production', // Production (HTTPS) me true hoga, Localhost pe false
      sameSite: 'Lax',    // CSRF attacks se bachane ke liye
      maxAge: 24 * 60 * 60 * 1000 // 1 din ki validity (Millisecond me)
    });

    // 6. Success Response (Password hata ke sirf kaam ki details bhej)
    res.status(200).json({
      message: "Login successful!",
      token, // Optional: Agar local storage me backup ke liye rakhna ho
      seller: {
        id: seller._id,
        companyName: seller.companyName,
        fullName: seller.fullName,
        email: seller.email,
        status: seller.status, // Isse dashboard pe "Pending Approval" dikha sakte hain
        onboardingCompleted: seller.onboardingCompleted
      }
    });

  } catch (error) {
    console.error("Seller Login Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports = { registerSeller , loginSeller };