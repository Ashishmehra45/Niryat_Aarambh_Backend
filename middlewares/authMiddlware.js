const jwt = require("jsonwebtoken");
const Seller = require("../models/sellerModel.js"); // Tera path check kar lena

const verifySellerToken = async (req, res, next) => {
  try {
    // 1. Header se token nikalo (Format: "Bearer eyJhbGciOi...")
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    // 2. Agar token nahi hai
    if (!token) {
      return res.status(401).json({ error: "Access Denied. Please login to continue." });
    }

    // 3. Token verify aur decode karo
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Check if seller exists in DB
    const sellerExists = await Seller.findById(decoded.id);
    if (!sellerExists) {
      return res.status(401).json({ error: "Seller account no longer exists." });
    }

    // 5. Attach ID to request object
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(403).json({ error: "Session expired or invalid token. Please login again." });
  }
};

module.exports = verifySellerToken;