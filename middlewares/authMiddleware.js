const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Seller = require('../models/Seller');
const Buyer = require('../models/Buyer');

// ==========================================
// 🛡️ 1. ADMIN PROTECTION MIDDLEWARE
// ==========================================
const protectAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.adminToken; // Cookie se token nikalo

    if (!token) {
      return res.status(401).json({ message: "Not authorized. No admin token found." });
    }

    // Token verify karo
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Database se admin nikalo (password hata ke bhejenge security ke liye)
    req.admin = await Admin.findById(decoded.id).select('-password');

    if (!req.admin) {
      return res.status(401).json({ message: "Admin not found with this token." });
    }

    next(); // Sab theek hai, agle function me jao
  } catch (error) {
    console.error("Admin Auth Error:", error);
    res.status(401).json({ message: "Not authorized. Token failed." });
  }
};

// ==========================================
// 🏢 2. SELLER PROTECTION MIDDLEWARE
// ==========================================
const protectSeller = async (req, res, next) => {
  try {
    const token = req.cookies.sellerToken;

    if (!token) {
      return res.status(401).json({ message: "Not authorized. No seller token found." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.seller = await Seller.findById(decoded.id).select('-password');

    if (!req.seller) {
      return res.status(401).json({ message: "Seller not found." });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized as seller." });
  }
};

// ==========================================
// 🛒 3. BUYER PROTECTION MIDDLEWARE
// ==========================================
const protectBuyer = async (req, res, next) => {
  try {
    const token = req.cookies.buyerToken;

    if (!token) {
      return res.status(401).json({ message: "Not authorized. Please login." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.buyer = await Buyer.findById(decoded.id).select('-password');

    if (!req.buyer) {
      return res.status(401).json({ message: "Buyer not found." });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized as buyer." });
  }
};

// ==========================================
// 👑 4. ROLE AUTHORIZATION MIDDLEWARE (SUPER POWER)
// ==========================================
// Ye function check karega ki Admin 'superadmin' hai ya sirf 'manager'
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    // req.admin.role aayega protectAdmin middleware se
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ 
        message: `Role (${req.admin.role}) is not allowed to access this resource.` 
      });
    }
    next();
  };
};

module.exports = { protectAdmin, protectSeller, protectBuyer, authorizeRole };