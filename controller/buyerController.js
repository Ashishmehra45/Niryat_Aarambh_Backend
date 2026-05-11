const bcrypt = require('bcryptjs');
const Buyer = require('../models/buyer'); // Tera buyer model
const jwt = require('jsonwebtoken'); // JWT token ke liye

const registerBuyer = async (req, res) => {
  try {
    const { fullName, company, email, phone, address, password } = req.body;

    // 1. Basic Validation
    if (!fullName || !email || !phone || !address || !password) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }

    
    const existingBuyer = await Buyer.findOne({ email });
    if (existingBuyer) {
      return res.status(400).json({ message: "this email is already registered." });
    }

    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

   
    const newBuyer = new Buyer({
      fullName,
      company,
      email,
      phone,
      address,
      password: hashedPassword
    });

    await newBuyer.save();

    // 5. Success Response
    res.status(201).json({ message: "Buyer registered successfully!" });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const loginBuyer = async (req, res) => {
  try {
    const { email, password } = req.body;

   
    const buyer = await Buyer.findOne({ email });
    if (!buyer) {
      return res.status(400).json({ message: "This email is not registered." });
    }

    // 2. Password Match check
    const isMatch = await bcrypt.compare(password, buyer.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // 3. JWT Token generate (Secret key apni .env me rakhna)
    const token = jwt.sign(
      { id: buyer._id, role: 'buyer' }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    res.cookie('buyerToken', token, {
      httpOnly: true,     // ✅ JS isko read nahi kar payegi (Security!)
      secure: process.env.NODE_ENV === 'production', // ✅ Sirf HTTPS pe chalega production me
      sameSite: 'Lax',    // ✅ CSRF protection
      maxAge: 24 * 60 * 60 * 1000 // 1 din ki validity
    });

    res.status(200).json({
      message: "Login successful!",
      token,
      buyer: {
        id: buyer._id,
        fullName: buyer.fullName,
        email: buyer.email
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { registerBuyer , loginBuyer };